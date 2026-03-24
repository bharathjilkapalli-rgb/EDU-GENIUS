from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

def gen_id():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_text = Column(Text)
    subject = Column(String, default="General")
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    quizzes = relationship("Quiz", back_populates="document", cascade="all, delete")
    flashcard_sets = relationship("FlashcardSet", back_populates="document", cascade="all, delete")
