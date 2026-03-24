from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.document import Document
from app.services.ai_service import chat_with_content

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    document_id: str
    message: str
    history: List[ChatMessage] = []

@router.post("/")
async def chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, req.document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    history = [{"role": m.role, "content": m.content} for m in req.history]
    response = await chat_with_content(doc.content_text, req.message, history)
    return {"response": response, "document_title": doc.title}
