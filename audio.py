from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.document import Document
from app.services.ai_service import generate_summary, chat_with_content
from app.services.tts_service import text_to_speech
import os

router = APIRouter()

class SummaryRequest(BaseModel):
    document_id: str
    style: str = "standard"  # standard | brief | detailed | bullet
    generate_audio: bool = True

@router.post("/summary")
async def create_audio_summary(req: SummaryRequest, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, req.document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    summary_text = await generate_summary(doc.content_text, req.style)
    result = {"summary": summary_text, "audio_url": None}

    if req.generate_audio:
        try:
            audio_path = await text_to_speech(summary_text)
            result["audio_url"] = f"/api/audio/file/{os.path.basename(audio_path)}"
        except Exception as e:
            result["audio_error"] = str(e)

    return result

@router.get("/file/{filename}")
async def serve_audio(filename: str):
    audio_path = f"./audio_cache/{filename}"
    if not os.path.exists(audio_path):
        raise HTTPException(404, "Audio file not found")
    return FileResponse(audio_path, media_type="audio/mpeg")
