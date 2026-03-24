import React from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Upload, Brain, BookOpen, Headphones,
  MessageCircle, BarChart3, Sparkles, Menu, X
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import QuizPage from './pages/QuizPage'
import FlashcardsPage from './pages/FlashcardsPage'
import AudioPage from './pages/AudioPage'
import ChatPage from './pages/ChatPage'
import AnalyticsPage from './pages/AnalyticsPage'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Documents' },
  { to: '/quiz', icon: Brain, label: 'Quiz' },
  { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
  { to: '/audio', icon: Headphones, label: 'Audio' },
  { to: '/chat', icon: MessageCircle, label: 'AI Tutor' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function App() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen gradient-bg">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #403888 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2e2870 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-white/5 flex flex-col
        transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white leading-none">EduGenius</h1>
              <p className="text-xs text-white/40 mt-0.5">AI Study Companion</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-amber-400' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="glass-light rounded-xl p-3">
            <p className="text-xs text-white/30 font-mono-custom">Powered by Claude</p>
            <p className="text-xs text-white/20 mt-0.5">Anthropic · claude-sonnet-4-6</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden glass border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg btn-ghost">
            <Menu size={20} />
          </button>
          <h1 className="font-display font-bold text-white">EduGenius</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/audio" element={<AudioPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1a52', color: '#e8e6f0', border: '1px solid rgba(255,255,255,0.1)' },
        success: { iconTheme: { primary: '#fbbf24', secondary: '#080620' } },
        error: { iconTheme: { primary: '#fb7185', secondary: '#080620' } },
      }} />
    </div>
  )
}
