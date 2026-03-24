import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Brain, Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
import { listDocuments, generateQuiz, getQuiz, submitAttempt, listQuizzes } from '../utils/api'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const TYPES = ['mcq', 'truefalse', 'fillblank', 'mixed']

export default function QuizPage() {
  const [docs, setDocs] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState({ document_id: '', difficulty: 'medium', quiz_type: 'mcq', num_questions: 10 })
  const [generating, setGenerating] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [fillInput, setFillInput] = useState('')

  useEffect(() => {
    listDocuments().then(setDocs)
    listQuizzes().then(setQuizzes)
  }, [])

  const handleGenerate = async () => {
    if (!form.document_id) { toast.error('Select a document first'); return }
    setGenerating(true)
    try {
      const quiz = await generateQuiz(form)
      setActiveQuiz(quiz)
      setAnswers({})
      setResult(null)
      setCurrentQ(0)
      setStartTime(Date.now())
      toast.success(`Quiz generated! ${quiz.questions.length} questions`)
    } catch (e) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [currentQ]: answer }))
    if (currentQ < activeQuiz.questions.length - 1) {
      setTimeout(() => { setCurrentQ(c => c + 1); setFillInput('') }, 300)
    }
  }

  const handleSubmit = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    try {
      const r = await submitAttempt({ quiz_id: activeQuiz.id, answers, time_taken_seconds: timeTaken })
      setResult(r)
      listQuizzes().then(setQuizzes)
    } catch (e) { toast.error(e.message) }
  }

  const q = activeQuiz?.questions?.[currentQ]
  const answered = Object.keys(answers).length
  const total = activeQuiz?.questions?.length || 0

  // Result screen
  if (result) return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="glass rounded-2xl p-10 text-center space-y-6">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl
          ${result.score >= 80 ? 'bg-emerald-400/20' : result.score >= 60 ? 'bg-amber-400/20' : 'bg-rose-400/20'}`}>
          {result.score >= 80 ? '🏆' : result.score >= 60 ? '📚' : '💪'}
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold text-white">{result.percentage}</h2>
          <p className="text-white/40 mt-1">{result.correct} of {result.total} correct</p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div className="progress-bar h-3" style={{ width: `${result.score}%` }} />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setActiveQuiz(null); setResult(null) }}
            className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2">
            <RotateCcw size={16} /> New Quiz
          </button>
        </div>
      </div>
    </div>
  )

  // Active quiz
  if (activeQuiz && q) return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm text-white/40 mb-2">
          <span>Question {currentQ + 1} of {total}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium badge-${activeQuiz.difficulty}`}>{activeQuiz.difficulty}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="progress-bar h-1.5" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="glass rounded-2xl p-8 space-y-6">
        <h3 className="font-display text-xl font-semibold text-white leading-relaxed">{q.question}</h3>

        {/* MCQ */}
        {q.type === 'mcq' && (
          <div className="space-y-3">
            {Object.entries(q.options || {}).map(([key, val]) => (
              <button key={key} onClick={() => handleAnswer(key)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                  ${answers[currentQ] === key ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/3 text-white/70 hover:border-white/20 hover:bg-white/5'}`}>
                <span className="font-mono-custom text-amber-400 mr-3">{key}</span>{val}
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === 'truefalse' && (
          <div className="flex gap-4">
            {['true', 'false'].map(v => (
              <button key={v} onClick={() => handleAnswer(v === 'true')}
                className={`flex-1 py-4 rounded-xl border text-lg font-medium transition-all
                  ${answers[currentQ] === (v === 'true') ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20'}`}>
                {v === 'true' ? '✓ True' : '✗ False'}
              </button>
            ))}
          </div>
        )}

        {/* Fill blank */}
        {q.type === 'fillblank' && (
          <div className="flex gap-3">
            <input value={fillInput} onChange={e => setFillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fillInput && handleAnswer(fillInput)}
              className="flex-1 input-dark rounded-xl px-4 py-3"
              placeholder="Type your answer..." autoFocus />
            <button onClick={() => fillInput && handleAnswer(fillInput)} disabled={!fillInput}
              className="btn-primary px-5 rounded-xl disabled:opacity-40">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-sm">{answered}/{total} answered</span>
        {answered === total && (
          <button onClick={handleSubmit} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2">
            <Trophy size={16} /> Submit Quiz
          </button>
        )}
      </div>
    </div>
  )

  // Setup screen
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Quiz Generator</h2>
        <p className="text-white/40 mt-1">Create AI-powered quizzes from your documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator form */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-white">Generate New Quiz</h3>

          <div className="space-y-1">
            <label className="text-sm text-white/50">Document</label>
            <select value={form.document_id} onChange={e => setForm(f => ({ ...f, document_id: e.target.value }))}
              className="w-full input-dark rounded-xl px-4 py-3">
              <option value="">Select a document...</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/50">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                className="w-full input-dark rounded-xl px-3 py-2.5 text-sm">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/50">Type</label>
              <select value={form.quiz_type} onChange={e => setForm(f => ({ ...f, quiz_type: e.target.value }))}
                className="w-full input-dark rounded-xl px-3 py-2.5 text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/50">Questions: {form.num_questions}</label>
            <input type="range" min={5} max={20} value={form.num_questions}
              onChange={e => setForm(f => ({ ...f, num_questions: +e.target.value }))}
              className="w-full accent-amber-400" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !form.document_id}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
            {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Brain size={18} /> Generate Quiz</>}
          </button>
        </div>

        {/* Recent quizzes */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">Recent Quizzes</h3>
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">No quizzes yet</div>
          ) : quizzes.slice(0, 6).map(quiz => (
            <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-xl glass-light card-hover cursor-pointer"
              onClick={async () => { const q = await getQuiz(quiz.id); setActiveQuiz(q); setAnswers({}); setResult(null); setCurrentQ(0); setStartTime(Date.now()) }}>
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Brain size={15} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm truncate">{quiz.title}</p>
                <p className="text-white/30 text-xs">{quiz.question_count} questions</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
