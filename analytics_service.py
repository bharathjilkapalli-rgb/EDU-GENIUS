from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analytics import StudySession

async def log_session(db: AsyncSession, subject: str, activity_type: str, duration_minutes: float, score: float = None):
    session = StudySession(subject=subject, activity_type=activity_type, duration_minutes=duration_minutes, score=score)
    db.add(session)
    # Don't commit here - let the caller do it
