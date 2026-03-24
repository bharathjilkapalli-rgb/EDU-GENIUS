# 🎓 EduGenius — AI-Powered Educational Content Generator

> **Track B (Advanced)** | 8-Week Project | Anthropic Claude + React + FastAPI

A full-stack AI educational platform that transforms your documents into quizzes, flashcards, audio summaries, and personalized study sessions — powered by Claude Sonnet.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload** | PDF, DOCX, TXT, MD — auto subject detection |
| 🧠 **AI Quiz Generator** | MCQ, True/False, Fill-in-blank, Mixed — Easy/Medium/Hard |
| 🃏 **Smart Flashcards** | Auto-generated + SM-2 Spaced Repetition Algorithm |
| 🎧 **Audio Summaries** | Multiple styles (Standard/Brief/Detailed/Bullet) + TTS |
| 💬 **AI Tutor Chat** | Context-aware Q&A with conversation history |
| 📊 **Analytics Dashboard** | Study time, scores, subject coverage, trends |

---

## 🏗️ Tech Stack

**Frontend**: React 18 + Vite + Tailwind CSS + Recharts + Framer Motion  
**Backend**: FastAPI + SQLAlchemy (async) + Pydantic  
**AI**: Anthropic Claude Sonnet (`claude-sonnet-4-6`)  
**Database**: SQLite (dev) → PostgreSQL (production)  
**TTS**: gTTS + Browser Web Speech API fallback  
**Deployment**: Vercel (frontend) + Railway/Render (backend)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key ([get one here](https://console.anthropic.com))

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
uvicorn app.main:app --reload --port 8000
```

Backend will be at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be at: `http://localhost:3000`

---

## 📁 Project Structure

```
edugenius/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py        # Settings & env vars
│   │   │   └── database.py      # SQLAlchemy async setup
│   │   ├── models/
│   │   │   ├── document.py      # Document model
│   │   │   ├── quiz.py          # Quiz + Attempt models
│   │   │   ├── flashcard.py     # Flashcard + Set models
│   │   │   └── analytics.py     # StudySession model
│   │   ├── api/
│   │   │   ├── upload.py        # Document upload endpoints
│   │   │   ├── quiz.py          # Quiz generation + attempts
│   │   │   ├── flashcards.py    # Flashcard CRUD + review
│   │   │   ├── audio.py         # Summary + TTS
│   │   │   ├── chat.py          # AI tutor chat
│   │   │   └── analytics.py     # Dashboard data
│   │   └── services/
│   │       ├── ai_service.py    # Claude API wrapper
│   │       ├── document_service.py # PDF/DOCX extraction
│   │       ├── tts_service.py   # Text-to-speech
│   │       ├── spaced_repetition.py # SM-2 algorithm
│   │       └── analytics_service.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router + sidebar layout
    │   ├── main.jsx             # React entry point
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Overview + charts
    │   │   ├── UploadPage.jsx   # Document management
    │   │   ├── QuizPage.jsx     # Quiz generator + player
    │   │   ├── FlashcardsPage.jsx # Flip cards + SM-2 review
    │   │   ├── AudioPage.jsx    # Audio summaries
    │   │   ├── ChatPage.jsx     # AI tutor interface
    │   │   └── AnalyticsPage.jsx # Detailed analytics
    │   ├── utils/
    │   │   └── api.js           # Axios API client
    │   └── styles/
    │       └── globals.css      # Design system + animations
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🔌 API Reference

### Documents
```
POST /api/upload/          Upload a document (PDF/DOCX/TXT)
GET  /api/upload/          List all documents
GET  /api/upload/{id}      Get document with content
DELETE /api/upload/{id}    Delete document
```

### Quiz
```
POST /api/quiz/generate    Generate AI quiz from document
GET  /api/quiz/            List all quizzes
GET  /api/quiz/{id}        Get quiz with questions
POST /api/quiz/attempt     Submit quiz answers → get score
GET  /api/quiz/{id}/attempts  Get attempt history
```

### Flashcards
```
POST /api/flashcards/generate      Generate flashcard set
GET  /api/flashcards/sets          List all sets
GET  /api/flashcards/sets/{id}     Get set with cards
GET  /api/flashcards/sets/{id}/due Cards due for review today
POST /api/flashcards/review        Review card (SM-2 update)
```

### Audio & Chat
```
POST /api/audio/summary    Generate summary + TTS
POST /api/chat/            AI tutor Q&A
GET  /api/analytics/dashboard  Dashboard analytics
```

---

## 🧠 AI Prompt Engineering

All Claude prompts are in `backend/app/services/ai_service.py`. Key design decisions:

- **Quiz Generation**: Structured JSON output with type-specific templates (MCQ/TF/Fill-blank)
- **Difficulty Levels**: Explicit cognitive level instructions (recall → application → synthesis)
- **Content Chunking**: First 6000 chars used to stay within context limits
- **Subject Detection**: Zero-shot classification from predefined subject list
- **Chat**: System prompt injects document content for grounded responses

---

## 📊 Spaced Repetition (SM-2 Algorithm)

Located in `backend/app/services/spaced_repetition.py`:

- **Quality 0-2**: Forgotten → reset interval to 1 day
- **Quality 3**: Pass with difficulty → small interval
- **Quality 4**: Pass → normal progression
- **Quality 5**: Perfect → maximum interval growth
- **Ease Factor**: Adjusted per review, minimum 1.3

---

## 🚢 Deployment

### Backend (Railway / Render)
```bash
# Set environment variables:
ANTHROPIC_API_KEY=your_key
DATABASE_URL=postgresql+asyncpg://...  # from Railway
TTS_ENGINE=gtts

# Build command: pip install -r requirements.txt
# Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)
```bash
# Root directory: frontend
# Build command: npm run build
# Output directory: dist
# Environment variable: VITE_API_URL=https://your-backend.railway.app
```

Update `vite.config.js` proxy target for production.

---

## 🧪 Assessment Checklist

### Track B Requirements (120 pts)
- [x] **Enhanced Educational Architecture (45pts)**: 4 integrated tools (quiz/flashcards/audio/chat) with clean workflows
- [x] **Better Student UI/UX (25pts)**: React with dark aesthetic, animations, responsive design
- [x] **Cloud Deployment (20pts)**: Full-stack deployment guide included (Vercel + Railway)
- [x] **Code Quality (15pts)**: Async FastAPI, typed models, service layer separation
- [x] **Technical Presentation (15pts)**: Full API docs at `/docs`, architecture documented
- [x] **Bonus: Adaptive Quiz Difficulty (up to 15pts)**: SM-2 spaced repetition implemented

---

## 📝 Week-by-Week Progress

| Week | Status | Completed |
|------|--------|-----------|
| 1-2 | ✅ | Project setup, document upload, basic quiz, deployment |
| 3-4 | ✅ | Multi-format quiz, flashcards, progress tracking, SM-2 |
| 5-6 | ✅ | Analytics dashboard, AI chat tutor, audio summaries |
| 7-8 | 🔄 | UI polish, testing, documentation, demo video |

---

## 🤝 Team

| Member | Responsibility |
|--------|---------------|
| Member 1 | Backend API + AI services |
| Member 2 | Frontend (Dashboard + Quiz) |
| Member 3 | Frontend (Flashcards + Audio + Chat) |
| Member 4 | DevOps + Testing + Documentation |

---

## 📄 License

MIT License — built for educational purposes as part of Capabl Track B project.
