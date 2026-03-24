from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

def gen_id():
    return str(uuid.uuid4())

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String, primary_key=True, default=gen_id)
    document_id = Column(String, ForeignKey("documents.id"))
    title = Column(String, nullable=False)
    difficulty = Column(String, default="medium")  # easy | medium | hard
    quiz_type = Column(String, default="mcq")       # mcq | truefalse | fillblank | mixed
    questions = Column(JSON)  # list of question dicts
    created_at = Column(DateTime, default=datetime.utcnow)
    document = relationship("Document", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(String, primary_key=True, default=gen_id)
    quiz_id = Column(String, ForeignKey("quizzes.id"))
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    answers = Column(JSON)
    completed_at = Column(DateTime, default=datetime.utcnow)
    quiz = relationship("Quiz", back_populates="attempts")
