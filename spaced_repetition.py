from datetime import datetime, timedelta
from typing import Tuple

def sm2_update(ease_factor: float, interval: int, repetitions: int, quality: int) -> Tuple[float, int, int]:
    """
    SM-2 Spaced Repetition Algorithm
    quality: 0-5 (0-2 = fail, 3-5 = pass)
    Returns: (new_ease_factor, new_interval, new_repetitions)
    """
    if quality < 3:
        # Failed - reset
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease_factor)
        repetitions += 1

    # Update ease factor
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)  # Minimum EF is 1.3

    return ease_factor, interval, repetitions

def get_next_review_date(interval: int) -> datetime:
    return datetime.utcnow() + timedelta(days=interval)

def get_due_cards_filter():
    """Returns SQLAlchemy filter for cards due today."""
    return datetime.utcnow()
