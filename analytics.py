from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from app.core.database import Base
from datetime import datetime
import uuid

def gen_id():
    return str(uuid.uuid4())

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(String, primary_key=True, default=gen_id)
    subject = Column(String, default="General")
    activity_type = Column(String)  # quiz | flashcard | reading | audio
    duration_minutes = Column(Float, default=0)
    score = Column(Float, nullable=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

class StudyGoal(Base):
    __tablename__ = "study_goals"
    id = Column(String, primary_key=True, default=gen_id)
    subject = Column(String)
    target_minutes_per_week = Column(Integer, default=120)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
