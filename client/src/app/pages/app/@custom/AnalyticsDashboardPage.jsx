/**
 * @custom AnalyticsDashboardPage — Overview dashboard for analytics
 * Aggregated view: key metrics, recent activity, quick insights, account health score.
 */
import { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
  Target,
  Activity,
  ChevronRight,
  Award,
  Flame,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DashboardLayout } from '../../../components/@system/Dashboard/DashboardLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Constants ────────────────────────────────────────────────────
const BRAND = {
  primary: '#0891B2',
  primaryLight: '#ecfeff',
  primaryDark: '#0e7490',
}

// ─── Mock Data ────────────────────────────────────────────────────
function generateWeekData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    day,
    impressions: Math.floor(Math.random() * 2000) + 500,
    engagement: Math.floor(Math.random() * 150) + 30,
  }))
}

function generateMonthTrend() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    followers: 1200 + Math.floor(i * 3.2) + Math.floor(Math.random() * 15),
    posts: Math.random() > 0.6 ? 1 : 0,
  }))
}

function generateRecentPosts() {
  return [
    { id: 1, title: '5 AI tools every marketer needs in 2026', status: 'published', impressions: 3420, likes: 89, time: '2h ago' },
    { id: 2, title: 'Why I stopped chasing virality', status: 'published', impressions: 2180, likes: 67, time: '1d ago' },
    { id: 3, title: 'The power of consistent posting', status: 'scheduled', impressions: 0, likes: 0, time: 'Tomorrow 9:00 AM' },
    { id: 4, title: 'How to write hooks that stop the scroll', status: 'draft', impressions: 0, likes: 0, time: 'Draft' },
  ]
}

// ─── Component ────────────────────────────────────────────────────
export default function AnalyticsDashboardPage() {
  const [weekData, setWeekData] = useState([])
  const [monthTrend, setMonthTrend] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWeekData(generateWeekData())
      setMonthTrend(generateMonthTrend())
      setRecentPosts(generateRecentPosts())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Account health score (mock)
  const healthScore = 78
  const healthColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'

  // Quick stats
  const stats = {
    totalImpressions: 45230,
    totalEngagement: 1847,
    engagementRate: 4.08,
    postsThisWeek: 5,
    followers: 1456,
    followerGrowth: 48,
    avgImpressions: 2890,
    bestDay: 'Tuesday',
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your LinkedIn performance at a glance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} />
            <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-28" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickMetric icon={Eye} label="Total Impressions" value={stats.totalImpressions} change={12.3} />
              <QuickMetric icon={Zap} label="Engagement Rate" value={`${stats.engagementRate}%`} change={0.5} isPercent />
              <QuickMetric icon={Users} label="Followers" value={stats.followers} change={stats.followerGrowth} isAbsolute />
              <QuickMetric icon={FileText} label="Posts This Week" value={stats.postsThisWeek} />
            </div>

            {/* Second Row: Health Score + Streak + Best Day */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Account Health */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={16} style={{ color: BRAND.primary }} />
                  <span className="text-sm font-medium text-slate-700">Account Health</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold" style={{ color: healthColor }}>{healthScore}</span>
                  <span className="text-sm text-slate-500 mb-1">/100</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${healthScore}%`, backgroundColor: healthColor }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Post more consistently to boost your score</p>
              </div>

              {/* Posting Streak */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-sm font-medium text-slate-700">Posting Streak</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-orange-500">12</span>
                  <span className="text-sm text-slate-500 mb-1">days</span>
                </div>
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-full h-3 rounded-sm',
                        i < 12 ? 'bg-orange-400' : 'bg-slate-100'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Keep going! Your best streak was 18 days</p>
              </div>

              {/* Best Day */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} style={{ color: BRAND.primary }} />
                  <span className="text-sm font-medium text-slate-700">Best Performing Day</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold" style={{ color: BRAND.primary }}>{stats.bestDay}</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Avg. {stats.avgImpressions.toLocaleString()} impressions on {stats.bestDay}s
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* This Week's Performance */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">This Week</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                      <Bar dataKey="impressions" fill={BRAND.primary} radius={[4, 4, 0, 0]} name="Impressions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Follower Growth Trend */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Follower Growth (30d)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                      <Area type="monotone" dataKey="followers" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Recent Posts</h3>
                <button
                  className="text-sm font-medium flex items-center gap-1 transition-colors"
                  style={{ color: BRAND.primary }}
                >
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {recentPosts.map(post => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{post.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={post.status} />
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {post.time}
                        </span>
                      </div>
                    </div>
                    {post.status === 'published' && (
                      <div className="flex items-center gap-4 text-sm text-slate-600 shrink-0">
                        <span className="flex items-center gap-1">
                          <Eye size={14} className="text-slate-400" />
                          {post.impressions.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="text-slate-400" />
                          {post.likes}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ActionCard
                icon={FileText}
                title="Create Post"
                description="Write and schedule a new LinkedIn post"
                color={BRAND.primary}
              />
              <ActionCard
                icon={BarChart3}
                title="Detailed Analytics"
                description="Deep dive into your engagement metrics"
                color="#10b981"
              />
              <ActionCard
                icon={Target}
                title="Content Templates"
                description="Browse templates for your next post"
                color="#8b5cf6"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function QuickMetric({ icon: Icon, label, value, change, isPercent, isAbsolute }) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value
  const positive = typeof change === 'number' ? change > 0 : false

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND.primaryLight }}>
          <Icon size={16} style={{ color: BRAND.primary }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{displayValue}</div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', positive ? 'text-emerald-600' : 'text-red-500')}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {isAbsolute ? `${positive ? '+' : ''}${change}` : `${positive ? '+' : ''}${change}%`}
          <span className="text-slate-400 font-normal ml-1">vs last week</span>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    published: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles[status] || styles.draft)}>
      {status}
    </span>
  )
}

function ActionCard({ icon: Icon, title, description, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="p-3 rounded-xl w-fit mb-3" style={{ backgroundColor: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <h4 className="font-semibold text-slate-900 mb-1 group-hover:underline">{title}</h4>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
