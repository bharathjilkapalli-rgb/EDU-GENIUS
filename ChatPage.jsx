import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react'
import { listDocuments, chatWithDoc } from '../utils/api'

export default function ChatPage() {
  const [docs, setDocs] = useState([])
  const [docId, setDocId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { listDocuments().then(setDocs) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !docId || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const r = await chatWithDoc({ document_id: docId, message: input, history: messages })
      setMessages(m => [...m, { role: 'assistant', content: r.response }])
    } catch (e) {
      toast.error(e.message)
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Error: ' + e.message }])
    } finally { setLoading(false) }
  }

  const selectedDoc = docs.find(d => d.id === docId)

  return (
    <div className="space-y-6 animate-fade-up h-full flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">AI Tutor</h2>
          <p className="text-white/40 mt-1">Ask questions about your study material</p>
        </div>
        <select value={docId} onChange={e => { setDocId(e.target.value); setMessages([]) }}
          className="input-dark rounded-xl px-4 py-2.5 text-sm max-w-xs">
          <option value="">Select document...</option>
          {docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
      </div>

      {/* Chat window */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
              <Bot size={48} className="opacity-20" />
              {docId ? (
                <div className="text-center">
                  <p className="font-medium">Ask anything about</p>
                  <p className="text-amber-400/60 text-sm">{selectedDoc?.title}</p>
                </div>
              ) : (
                <p className="text-sm">Select a document to start chatting</p>
              )}
              {docId && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {['Summarize the key concepts', 'What are the main topics?', 'Create a study plan', 'What should I focus on?'].map(s => (
                    <button key={s} onClick={() => setInput(s)}
                      className="p-3 rounded-xl glass-light text-xs text-white/50 hover:text-white/80 hover:border-white/15 border border-white/5 transition-all text-left">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-amber-400/20' : 'bg-purple-400/20'}`}>
                {msg.role === 'user' ? <User size={14} className="text-amber-400" /> : <Bot size={14} className="text-purple-400" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-amber-400/10 border border-amber-400/20 text-amber-100 rounded-tr-none'
                  : 'glass-light text-white/80 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-400/20 flex items-center justify-center">
                <Bot size={14} className="text-purple-400" />
              </div>
              <div className="glass-light px-4 py-3 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-white/40" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!docId || loading}
              placeholder={docId ? 'Ask your AI tutor...' : 'Select a document first'}
              className="flex-1 input-dark rounded-xl px-4 py-3 text-sm disabled:opacity-40" />
            <button onClick={handleSend} disabled={!input.trim() || !docId || loading}
              className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-40">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
