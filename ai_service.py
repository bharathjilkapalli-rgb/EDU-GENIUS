import anthropic
import json
import re
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

def _extract_json(text: str) -> any:
    """Extract JSON from Claude's response, handling markdown code blocks."""
    text = text.strip()
    # Remove markdown code blocks
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = text.replace("```", "").strip()
    return json.loads(text)

async def generate_quiz(content: str, difficulty: str, quiz_type: str, num_questions: int = 10) -> list:
    """Generate quiz questions from educational content."""
    type_instructions = {
        "mcq": "multiple choice questions with 4 options (A, B, C, D) and one correct answer",
        "truefalse": "true/false questions",
        "fillblank": "fill-in-the-blank questions with a clear answer",
        "mixed": "a mix of MCQ, true/false, and fill-in-the-blank questions",
    }

    prompt = f"""You are an expert educator. Generate {num_questions} {type_instructions.get(quiz_type, 'multiple choice')} questions from the following educational content.

Difficulty level: {difficulty}
- easy: basic recall, definitions, simple concepts
- medium: application, understanding, connecting ideas  
- hard: analysis, synthesis, edge cases

Content:
{content[:6000]}

Return ONLY a valid JSON array. Each question object must follow this exact structure:
For MCQ:
{{"type": "mcq", "question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct": "A", "explanation": "..."}}

For True/False:
{{"type": "truefalse", "question": "...", "correct": true, "explanation": "..."}}

For Fill-in-the-blank:
{{"type": "fillblank", "question": "The ___ is responsible for...", "correct": "answer", "explanation": "..."}}

Generate exactly {num_questions} questions. Return ONLY the JSON array, no other text."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    return _extract_json(message.content[0].text)

async def generate_flashcards(content: str, num_cards: int = 20) -> list:
    """Generate flashcards from educational content."""
    prompt = f"""You are an expert educator. Create {num_cards} high-quality flashcards from this content.
Each flashcard should test a key concept, definition, fact, or relationship.

Content:
{content[:6000]}

Return ONLY a valid JSON array of flashcard objects:
{{"front": "Question or term", "back": "Answer or definition"}}

Make the fronts concise questions or terms. Make backs clear, complete answers.
Return ONLY the JSON array, no other text."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )
    return _extract_json(message.content[0].text)

async def generate_summary(content: str, style: str = "standard") -> str:
    """Generate a study summary from content."""
    styles = {
        "standard": "a clear, structured summary with key points",
        "brief": "a concise 3-5 sentence summary hitting only the most critical points",
        "detailed": "a comprehensive summary covering all major concepts and their relationships",
        "bullet": "a bulleted list of all key facts and concepts",
    }
    prompt = f"""You are an expert educator. Create {styles.get(style, styles['standard'])} of the following educational content.

Content:
{content[:8000]}

Format it clearly with sections if appropriate. Focus on what students need to remember."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text

async def chat_with_content(content: str, question: str, history: list = []) -> str:
    """Answer questions about educational content."""
    messages = []
    for h in history[-6:]:  # keep last 3 turns
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": question})

    system = f"""You are an expert AI tutor. Answer questions based on the provided study material.
Be clear, accurate, and pedagogically helpful. If the answer isn't in the material, say so.

Study Material:
{content[:6000]}"""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1500,
        system=system,
        messages=messages
    )
    return message.content[0].text

async def detect_subject(content: str, title: str = "") -> str:
    """Auto-detect the subject of content."""
    prompt = f"""Identify the primary academic subject of this content. Return ONLY one of:
Mathematics, Physics, Chemistry, Biology, History, Geography, Computer Science, Economics, Literature, Philosophy, Psychology, General

Title: {title}
Content preview: {content[:1000]}

Return ONLY the subject name, nothing else."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=20,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()

async def generate_study_schedule(subjects: list, available_hours_per_week: float) -> dict:
    """Generate a personalized study schedule."""
    prompt = f"""You are a study coach. Create a weekly study schedule for a student.

Subjects to cover: {', '.join(subjects)}
Available hours per week: {available_hours_per_week}

Return ONLY a valid JSON object:
{{
  "schedule": [
    {{"day": "Monday", "sessions": [{{"subject": "...", "duration_minutes": 45, "activity": "quiz/flashcards/reading", "tips": "..."}}]}}
  ],
  "tips": ["tip1", "tip2", "tip3"]
}}"""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    return _extract_json(message.content[0].text)
