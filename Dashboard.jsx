import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { getDashboard } from '../utils/api'
import { Clock, Target, Zap, BookOpen, TrendingUp, ArrowRight } from 'lucide-react'

const COLORS = ['#fbbf24', '#818cf8', '#34d399', '#fb7185', '#60a5fa', '#a78bfa']

function StatCard({ icon: Icon, label, value, sub, color = 'amber' }) {
  const colors = { amber: 'text-amber-400 bg-amber-400/10', emerald: 'text-emerald-400 bg-emerald-400/10', rose: 'text-rose-400 bg-rose-400/10', purple: 'text-purple-400 bg-purple-400/10' }
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm">{label}</p>
          <p className="text-3xl font-display font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-sm">
      <p className="text-white/60">{label}</p>
      <p className="text-amber-400 font-medium">{payload[0].value} {payload[0].name}</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )

  const d = data || {}

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Good day, Scholar</h2>
        <p className="text-white/40 mt-1">Here's your learning overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Study Time This Week" value={`${Math.round(d.weekly_minutes || 0)}m`} sub="minutes studied" color="amber" />
        <StatCard icon={Target} label="Avg Quiz Score" value={`${d.avg_quiz_score || 0}%`} sub={`${d.quizzes_taken || 0} quizzes taken`} color="emerald" />
        <StatCard icon={BookOpen} label="Cards Due Today" value={d.cards_due || 0} sub="flashcards to review" color="purple" />
        <StatCard icon={Zap} label="Total Sessions" value={d.total_sessions || 0} sub="study sessions" color="rose" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily study chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Weekly Study Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.daily_study || []}>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" name="min" fill="#fbbf24" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz score trend */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Quiz Score Trend</h3>
          {(d.recent_scores || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={d.recent_scores}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" name="%" stroke="#fbbf24" strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 3 }} activeDot={{ r: 5, fill: '#fcd34d' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-white/20 text-sm">No quiz data yet</div>
          )}
        </div>
      </div>

      {/* Subject breakdown + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject pie */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">By Subject</h3>
          {(d.subject_breakdown || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={d.subject_breakdown} dataKey="minutes" nameKey="subject" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {d.subject_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {d.subject_breakdown.slice(0, 4).map((s, i) => (
                  <div key={s.subject} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60 flex-1">{s.subject}</span>
                    <span className="text-white/40 text-xs">{s.minutes}m</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-white/20 text-sm">Upload docs to get started</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/upload', label: 'Upload Document', sub: 'Add study material', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
              { to: '/quiz', label: 'Generate Quiz', sub: 'Test your knowledge', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
              { to: '/flashcards', label: 'Review Cards', sub: `${d.cards_due || 0} due today`, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20' },
              { to: '/chat', label: 'Ask AI Tutor', sub: 'Get instant help', color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20' },
            ].map(({ to, label, sub, color, border }) => (
              <Link key={to} to={to}
                className={`group p-4 rounded-xl bg-gradient-to-br ${color} border ${border} card-hover flex flex-col gap-1`}>
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-xs text-white/40">{sub}</span>
                <ArrowRight size={14} className="text-white/30 mt-1 group-hover:text-amber-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
