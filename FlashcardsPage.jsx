import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BookOpen, Loader2, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, RotateCcw, Layers } from 'lucide-react'
import { listDocuments, generateFlashcards, listFlashcardSets, getFlashcardSet, reviewCard } from '../utils/api'

export default function FlashcardsPage() {
  const [docs, setDocs] = useState([])
  const [sets, setSets] = useState([])
  const [form, setForm] = useState({ document_id: '', num_cards: 20 })
  const [generating, setGenerating] = useState(false)
  const [activeSet, setActiveSet] = useState(null)
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState('browse') // browse | review
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    listDocuments().then(setDocs)
    listFlashcardSets().then(setSets)
  }, [])

  const handleGenerate = async () => {
    if (!form.document_id) { toast.error('Select a document'); return }
    setGenerating(true)
    try {
      const r = await generateFlashcards(form)
      toast.success(`Created ${r.card_count} flashcards!`)
      listFlashcardSets().then(setSets)
    } catch (e) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const openSet = async (setId) => {
    const data = await getFlashcardSet(setId)
    setActiveSet(data)
    setCards(data.cards)
    setIdx(0)
    setFlipped(false)
    setCompleted(0)
    setMode('browse')
  }

  const handleReview = async (quality) => {
    const card = cards[idx]
    try {
      await reviewCard({ card_id: card.id, quality })
      setCompleted(c => c + 1)
      setFlipped(false)
      if (idx < cards.length - 1) {
        setTimeout(() => setIdx(i => i + 1), 200)
      } else {
        toast.success(`Session complete! ${completed + 1} cards reviewed`)
      }
    } catch (e) { toast.error(e.message) }
  }

  const card = cards[idx]

  // Active card session
  if (activeSet && card) return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <button onClick={() => setActiveSet(null)} className="btn-ghost px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="text-center">
          <h3 className="font-display text-lg font-semibold text-white">{activeSet.title}</h3>
          <p className="text-white/30 text-sm">{idx + 1} / {cards.length}</p>
        </div>
        <div className="text-white/30 text-sm">{completed} reviewed</div>
      </div>

      {/* Progress */}
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="progress-bar h-1.5" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
      </div>

      {/* Flip card */}
      <div className="flip-card h-72 cursor-pointer" onClick={() => setFlipped(f => !f)}>
        <div className={`flip-card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 glass rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-amber-400/60 font-mono-custom uppercase tracking-wider mb-4">Question</div>
            <p className="font-display text-xl text-white leading-relaxed">{card.front}</p>
            <div className="mt-6 text-white/20 text-sm animate-pulse-soft">Tap to reveal answer</div>
          </div>
          {/* Back */}
          <div className="flip-card-back absolute inset-0 glass rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(30, 26, 82, 0.8)' }}>
            <div className="text-xs text-emerald-400/60 font-mono-custom uppercase tracking-wider mb-4">Answer</div>
            <p className="font-display text-xl text-white leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {flipped ? (
        <div className="space-y-3">
          <p className="text-center text-white/40 text-sm">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { q: 0, label: 'Forgot', color: 'hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400' },
              { q: 2, label: 'Hard', color: 'hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-orange-400' },
              { q: 3, label: 'Good', color: 'hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-400' },
              { q: 5, label: 'Easy', color: 'hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400' },
            ].map(({ q, label, color }) => (
              <button key={q} onClick={() => handleReview(q)}
                className={`py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium transition-all ${color}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <button onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false) }} disabled={idx === 0}
            className="btn-ghost px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-30">
            <ChevronLeft size={16} /> Prev
          </button>
          <button onClick={() => { setIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false) }} disabled={idx === cards.length - 1}
            className="btn-ghost px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-30">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )

  // Sets view
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Flashcards</h2>
        <p className="text-white/40 mt-1">Spaced repetition for long-term retention</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-white">Generate Flashcards</h3>
          <div className="space-y-1">
            <label className="text-sm text-white/50">Document</label>
            <select value={form.document_id} onChange={e => setForm(f => ({ ...f, document_id: e.target.value }))}
              className="w-full input-dark rounded-xl px-4 py-3">
              <option value="">Select a document...</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/50">Cards: {form.num_cards}</label>
            <input type="range" min={5} max={40} value={form.num_cards}
              onChange={e => setForm(f => ({ ...f, num_cards: +e.target.value }))}
              className="w-full accent-amber-400" />
          </div>
          <button onClick={handleGenerate} disabled={generating || !form.document_id}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
            {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Layers size={18} /> Create Flashcards</>}
          </button>
        </div>

        {/* Sets list */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">Your Sets ({sets.length})</h3>
          {sets.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">No flashcard sets yet</div>
          ) : sets.map(set => (
            <div key={set.id} onClick={() => openSet(set.id)}
              className="flex items-center gap-3 p-3 rounded-xl glass-light card-hover cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <BookOpen size={15} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm truncate">{set.title}</p>
                <p className="text-white/30 text-xs">{set.subject} · {new Date(set.created_at).toLocaleDateString()}</p>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
