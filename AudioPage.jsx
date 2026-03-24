import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Headphones, Loader2, Play, Pause, Volume2, FileText } from 'lucide-react'
import { listDocuments, createAudioSummary } from '../utils/api'

const STYLES = [
  { value: 'standard', label: 'Standard', desc: 'Clear structured overview' },
  { value: 'brief', label: 'Brief', desc: '3–5 sentence summary' },
  { value: 'detailed', label: 'Detailed', desc: 'Comprehensive coverage' },
  { value: 'bullet', label: 'Bullet Points', desc: 'Key facts listed' },
]

export default function AudioPage() {
  const [docs, setDocs] = useState([])
  const [form, setForm] = useState({ document_id: '', style: 'standard', generate_audio: true })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => { listDocuments().then(setDocs) }, [])

  const handleGenerate = async () => {
    if (!form.document_id) { toast.error('Select a document'); return }
    setLoading(true); setResult(null)
    try {
      const r = await createAudioSummary(form)
      setResult(r)
      toast.success('Summary generated!')
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const speakWithBrowser = () => {
    if (!result?.summary) return
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return }
    const utter = new SpeechSynthesisUtterance(result.summary)
    utter.rate = 0.9; utter.pitch = 1
    utter.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utter)
    setPlaying(true)
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Audio Summaries</h2>
        <p className="text-white/40 mt-1">Listen to AI-generated study summaries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-white">Create Summary</h3>

          <div className="space-y-1">
            <label className="text-sm text-white/50">Document</label>
            <select value={form.document_id} onChange={e => setForm(f => ({ ...f, document_id: e.target.value }))}
              className="w-full input-dark rounded-xl px-4 py-3">
              <option value="">Select a document...</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/50">Summary Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map(s => (
                <button key={s.value} onClick={() => setForm(f => ({ ...f, style: s.value }))}
                  className={`p-3 rounded-xl border text-left transition-all
                    ${form.style === s.value ? 'border-amber-400/40 bg-amber-400/8' : 'border-white/8 hover:border-white/15'}`}>
                  <div className="text-sm font-medium text-white">{s.label}</div>
                  <div className="text-xs text-white/30 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !form.document_id}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Headphones size={18} /> Generate Summary</>}
          </button>
        </div>

        {/* Result */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">Summary</h3>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-white/20 gap-3">
              <Headphones size={36} className="opacity-30" />
              <p className="text-sm">Select a document and generate a summary</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/40">
              <Loader2 size={32} className="animate-spin text-amber-400" />
              <p className="text-sm">AI is summarizing your content...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Audio player */}
              <div className="glass-light rounded-xl p-4 flex items-center gap-4">
                <button onClick={speakWithBrowser}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${playing ? 'bg-amber-400 text-ink-900' : 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'}`}>
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div>
                  <p className="text-white text-sm font-medium">{playing ? 'Playing...' : 'Listen to summary'}</p>
                  <p className="text-white/30 text-xs">Browser text-to-speech</p>
                </div>
                <Volume2 size={16} className="text-white/20 ml-auto" />
              </div>

              {/* Text */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-white/40" />
                  <p className="text-xs text-white/40 uppercase tracking-wider font-mono-custom">Summary Text</p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
