from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

def gen_id():
    return str(uuid.uuid4())

class FlashcardSet(Base):
    __tablename__ = "flashcard_sets"
    id = Column(String, primary_key=True, default=gen_id)
    document_id = Column(String, ForeignKey("documents.id"))
    title = Column(String, nullable=False)
    subject = Column(String, default="General")
    created_at = Column(DateTime, default=datetime.utcnow)
    document = relationship("Document", back_populates="flashcard_sets")
    cards = relationship("Flashcard", back_populates="set", cascade="all, delete")

class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(String, primary_key=True, default=gen_id)
    set_id = Column(String, ForeignKey("flashcard_sets.id"))
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    # Spaced repetition fields (SM-2 algorithm)
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)       # days until next review
    repetitions = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)
    last_reviewed = Column(DateTime, nullable=True)
    set = relationship("FlashcardSet", back_populates="cards")
