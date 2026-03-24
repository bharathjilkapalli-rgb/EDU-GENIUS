from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import quiz, flashcards, upload, analytics, audio, chat
from app.core.database import init_db

app = FastAPI(
    title="EduGenius API",
    description="AI-powered educational content generator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["flashcards"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "EduGenius API"}
