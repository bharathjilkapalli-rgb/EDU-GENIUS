from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.document import Document
from app.services.document_service import extract_text_from_file
from app.services.ai_service import detect_subject
from app.core.config import settings
import os, shutil, uuid

router = APIRouter()
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # Validate file type
    allowed = [".pdf", ".docx", ".doc", ".txt", ".md"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type. Allowed: {', '.join(allowed)}")

    # Validate size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB")

    # Save file
    doc_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{doc_id}{ext}"
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text
    try:
        text, word_count = await extract_text_from_file(file_path, file.filename)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(422, f"Could not extract text: {str(e)}")

    # Auto-detect subject
    subject = await detect_subject(text[:1000], file.filename)

    # Save to DB
    doc = Document(
        id=doc_id,
        title=os.path.splitext(file.filename)[0],
        filename=file.filename,
        file_path=file_path,
        content_text=text,
        subject=subject,
        word_count=word_count,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return {
        "id": doc.id,
        "title": doc.title,
        "subject": doc.subject,
        "word_count": doc.word_count,
        "created_at": doc.created_at.isoformat(),
        "preview": text[:300] + "..." if len(text) > 300 else text,
    }

@router.get("/")
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    docs = result.scalars().all()
    return [{"id": d.id, "title": d.title, "subject": d.subject, "word_count": d.word_count, "created_at": d.created_at.isoformat()} for d in docs]

@router.get("/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return {"id": doc.id, "title": doc.title, "subject": doc.subject, "word_count": doc.word_count, "content": doc.content_text, "created_at": doc.created_at.isoformat()}

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}
