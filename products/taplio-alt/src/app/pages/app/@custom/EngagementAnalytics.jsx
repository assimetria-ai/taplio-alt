import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Share2,
  Calendar, RefreshCw, AlertCircle, BarChart3, ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { cn } from '@/app/lib/@system/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('app_jwt')
}

function formatNum(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatPct(n) {
  if (n == null) return '—'
  return Number(n).toFixed(2) + '%'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Date range presets ───────────────────────────────────────────────────────

const RANGES = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function toISO(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, delta, trend }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="rounded-lg bg-[#0891B2]/10 p-2">
          <Icon className="h-4 w-4 text-[#0891B2]" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {delta != null && (
        <div className="flex items-center gap-1 mt-1.5">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          <span className={cn(
            'text-xs font-medium',
            trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
            trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
          )}>{delta}</span>
        </div>
      )}
    </div>
  )
}

// ── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatNum(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Top posts table ──────────────────────────────────────────────────────────

function TopPosts({ posts }) {
  if (!posts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No post data yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Post</th>
            <th className="pb-3 px-4 font-medium text-muted-foreground text-right">Impressions</th>
            <th className="pb-3 px-4 font-medium text-muted-foreground text-right">Likes</th>
            <th className="pb-3 px-4 font-medium text-muted-foreground text-right">Comments</th>
            <th className="pb-3 pl-4 font-medium text-muted-foreground text-right">Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((post, i) => (
            <tr key={post.id || i} className="hover:bg-accent/30 transition-colors">
              <td className="py-3 pr-4">
                <p className="text-foreground font-medium truncate max-w-[280px]">
                  {post.title || post.content?.substring(0, 60) || `Post #${i + 1}`}
                </p>
              </td>
              <td className="py-3 px-4 text-right text-muted-foreground">{formatNum(post.impressions)}</td>
              <td className="py-3 px-4 text-right text-muted-foreground">{formatNum(post.likes)}</td>
              <td className="py-3 px-4 text-right text-muted-foreground">{formatNum(post.comments)}</td>
              <td className="py-3 pl-4 text-right">
                <span className="inline-flex items-center gap-1 text-[#0891B2] font-medium">
                  {formatPct(post.engagement_rate)}
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function EngagementAnalytics() {
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [trends, setTrends] = useState([])
  const [topPosts, setTopPosts] = useState([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const token = getToken()
    const from = toISO(range)
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [engRes, trendRes, perfRes] = await Promise.all([
        fetch(`/api/analytics/engagement?from=${from}`, { headers }),
        fetch(`/api/analytics/engagement/trends?from=${from}`, { headers }),
        fetch(`/api/analytics/performance?from=${from}&limit=10`, { headers }),
      ])

      if (!engRes.ok || !trendRes.ok || !perfRes.ok) {
        throw new Error('Failed to load analytics data')
      }

      const [engData, trendData, perfData] = await Promise.all([
        engRes.json(), trendRes.json(), perfRes.json(),
      ])

      setMetrics(engData.data || engData)
      setTrends(
        (trendData.data || trendData || []).map(d => ({
          ...d,
          date: formatDate(d.date || d.bucket),
        }))
      )
      setTopPosts(perfData.data || perfData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Engagement Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track post performance, engagement rates, and audience growth
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                range === r.days
                  ? 'bg-[#0891B2] text-white'
                  : 'bg-accent/50 text-muted-foreground hover:bg-accent'
              )}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg p-2 bg-accent/50 text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Impressions"
          value={loading ? '...' : formatNum(metrics?.total_impressions)}
          Icon={Eye}
        />
        <StatCard
          label="Total Likes"
          value={loading ? '...' : formatNum(metrics?.total_likes)}
          Icon={Heart}
        />
        <StatCard
          label="Total Comments"
          value={loading ? '...' : formatNum(metrics?.total_comments)}
          Icon={MessageSquare}
        />
        <StatCard
          label="Avg Engagement Rate"
          value={loading ? '...' : formatPct(metrics?.avg_engagement_rate)}
          Icon={TrendingUp}
        />
      </div>

      {/* Engagement trends chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Engagement Trends</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : trends.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No trend data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="impressions"
                name="Impressions"
                stroke="#0891B2"
                strokeWidth={2}
                fill="url(#colorImpressions)"
              />
              <Area
                type="monotone"
                dataKey="likes"
                name="Likes"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#colorEngagement)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Engagement breakdown bar chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Engagement Breakdown</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : trends.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trends} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="likes" name="Likes" fill="#0891B2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shares" name="Shares" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top performing posts */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Top Performing Posts</h2>
        <TopPosts posts={topPosts} />
      </div>
    </div>
  )
}
