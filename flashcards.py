from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.models.document import Document
from app.models.flashcard import FlashcardSet, Flashcard
from app.services.ai_service import generate_flashcards
from app.services.spaced_repetition import sm2_update, get_next_review_date

router = APIRouter()

class GenerateFlashcardsRequest(BaseModel):
    document_id: str
    num_cards: int = 20

class ReviewCardRequest(BaseModel):
    card_id: str
    quality: int  # 0-5

@router.post("/generate")
async def generate_flashcards_endpoint(req: GenerateFlashcardsRequest, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, req.document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    cards_data = await generate_flashcards(doc.content_text, req.num_cards)

    fset = FlashcardSet(document_id=req.document_id, title=f"{doc.title} - Flashcards", subject=doc.subject)
    db.add(fset)
    await db.flush()

    cards = []
    for c in cards_data:
        card = Flashcard(set_id=fset.id, front=c.get("front", ""), back=c.get("back", ""))
        db.add(card)
        cards.append(card)

    await db.commit()
    await db.refresh(fset)
    return {"set_id": fset.id, "title": fset.title, "card_count": len(cards)}

@router.get("/sets")
async def list_sets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FlashcardSet).order_by(FlashcardSet.created_at.desc()))
    sets = result.scalars().all()
    return [{"id": s.id, "title": s.title, "subject": s.subject, "created_at": s.created_at.isoformat()} for s in sets]

@router.get("/sets/{set_id}")
async def get_set(set_id: str, db: AsyncSession = Depends(get_db)):
    fset = await db.get(FlashcardSet, set_id)
    if not fset:
        raise HTTPException(404, "Flashcard set not found")
    result = await db.execute(select(Flashcard).where(Flashcard.set_id == set_id))
    cards = result.scalars().all()
    return {
        "id": fset.id, "title": fset.title, "subject": fset.subject,
        "cards": [{"id": c.id, "front": c.front, "back": c.back, "ease_factor": c.ease_factor,
                   "interval": c.interval, "repetitions": c.repetitions,
                   "next_review": c.next_review.isoformat() if c.next_review else None} for c in cards]
    }

@router.get("/sets/{set_id}/due")
async def get_due_cards(set_id: str, db: AsyncSession = Depends(get_db)):
    """Get cards due for review today."""
    result = await db.execute(
        select(Flashcard).where(Flashcard.set_id == set_id, Flashcard.next_review <= datetime.utcnow())
    )
    cards = result.scalars().all()
    return [{"id": c.id, "front": c.front, "back": c.back, "repetitions": c.repetitions} for c in cards]

@router.post("/review")
async def review_card(req: ReviewCardRequest, db: AsyncSession = Depends(get_db)):
    card = await db.get(Flashcard, req.card_id)
    if not card:
        raise HTTPException(404, "Card not found")

    new_ef, new_interval, new_reps = sm2_update(card.ease_factor, card.interval, card.repetitions, req.quality)
    card.ease_factor = new_ef
    card.interval = new_interval
    card.repetitions = new_reps
    card.next_review = get_next_review_date(new_interval)
    card.last_reviewed = datetime.utcnow()

    await db.commit()
    return {"interval_days": new_interval, "ease_factor": round(new_ef, 2), "next_review": card.next_review.isoformat()}
