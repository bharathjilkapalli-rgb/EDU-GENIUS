import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from 'recharts'
import { getDashboard } from '../utils/api'
import { TrendingUp, Clock, Target, BookOpen } from 'lucide-react'

const COLORS = ['#fbbf24', '#818cf8', '#34d399', '#fb7185', '#60a5fa']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-white/50">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { getDashboard().then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  )

  const d = data || {}

  const radarData = (d.subject_breakdown || []).slice(0, 6).map(s => ({
    subject: s.subject.length > 8 ? s.subject.slice(0, 8) + '…' : s.subject,
    minutes: s.minutes,
  }))

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display text-3xl font-bold text-white">Analytics</h2>
        <p className="text-white/40 mt-1">Track your learning progress over time</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Minutes', value: Math.round(d.weekly_minutes || 0), icon: Clock, suffix: 'm' },
          { label: 'Avg Score', value: `${d.avg_quiz_score || 0}%`, icon: Target, suffix: '' },
          { label: 'Quizzes Taken', value: d.quizzes_taken || 0, icon: TrendingUp, suffix: '' },
          { label: 'Cards Due', value: d.cards_due || 0, icon: BookOpen, suffix: '' },
        ].map(({ label, value, icon: Icon, suffix }) => (
          <div key={label} className="glass rounded-2xl p-5 card-hover">
            <Icon size={18} className="text-amber-400 mb-3" />
            <p className="text-2xl font-display font-bold text-white">{value}{suffix}</p>
            <p className="text-white/30 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily study bar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Daily Study (minutes)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.daily_study || []}>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" name="Minutes" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz score line */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Quiz Score History</h3>
          {(d.recent_scores || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={d.recent_scores}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" name="Score" stroke="#fbbf24" strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">No quiz attempts yet</div>
          )}
        </div>

        {/* Subject radar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Subject Coverage</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Radar name="Minutes" dataKey="minutes" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">Study more subjects to see coverage</div>
          )}
        </div>

        {/* Subject breakdown pie + table */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Time by Subject</h3>
          {(d.subject_breakdown || []).length > 0 ? (
            <div className="flex gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={d.subject_breakdown} dataKey="minutes" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                    {d.subject_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {d.subject_breakdown.map((s, i) => (
                  <div key={s.subject} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60 text-sm flex-1">{s.subject}</span>
                    <span className="text-white/30 text-xs font-mono-custom">{s.minutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">No study data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
