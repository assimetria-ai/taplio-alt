import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Eye, Heart, MessageSquare,
  Share2, FileText, ArrowRight, RefreshCw, AlertCircle, BarChart3,
  Calendar, Target, Zap,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
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

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, delta, trend, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="rounded-lg p-2" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
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

// ── Engagement distribution pie ──────────────────────────────────────────────

const PIE_COLORS = ['#0891B2', '#6366F1', '#F59E0B', '#10B981']

function EngagementPie({ data }) {
  if (!data) return null
  const items = [
    { name: 'Likes', value: Number(data.total_likes) || 0 },
    { name: 'Comments', value: Number(data.total_comments) || 0 },
    { name: 'Shares', value: Number(data.total_shares) || 0 },
  ].filter(i => i.value > 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Target className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No engagement data yet</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {items.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{formatNum(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Quick action card ────────────────────────────────────────────────────────

function QuickAction({ to, Icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-[#0891B2]/40 hover:shadow-md transition-all"
    >
      <div className="rounded-lg bg-[#0891B2]/10 p-2.5 group-hover:bg-[#0891B2]/20 transition-colors">
        <Icon className="h-5 w-5 text-[#0891B2]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#0891B2] transition-colors" />
    </Link>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const token = getToken()
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [ovRes, trendRes] = await Promise.all([
        fetch('/api/analytics/overview', { headers }),
        fetch('/api/analytics/engagement/trends?from=' + new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], { headers }),
      ])

      if (!ovRes.ok || !trendRes.ok) throw new Error('Failed to load analytics')

      const [ovData, trendData] = await Promise.all([ovRes.json(), trendRes.json()])

      setOverview(ovData.data || ovData)
      setTrends(
        (trendData.data || trendData || []).map(d => ({
          ...d,
          date: formatDate(d.date || d.bucket),
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your LinkedIn performance at a glance — last 30 days
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#0891B2] text-white hover:bg-[#0891B2]/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
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
          label="Total Posts"
          value={loading ? '...' : formatNum(overview?.total_posts)}
          Icon={FileText}
          color="#0891B2"
        />
        <StatCard
          label="Total Impressions"
          value={loading ? '...' : formatNum(overview?.total_impressions)}
          Icon={Eye}
          color="#6366F1"
        />
        <StatCard
          label="Total Engagement"
          value={loading ? '...' : formatNum(
            (Number(overview?.total_likes) || 0) +
            (Number(overview?.total_comments) || 0) +
            (Number(overview?.total_shares) || 0)
          )}
          Icon={Zap}
          color="#F59E0B"
        />
        <StatCard
          label="Avg Engagement Rate"
          value={loading ? '...' : formatPct(overview?.avg_engagement_rate)}
          Icon={TrendingUp}
          color="#10B981"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Line chart — 3 cols */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Performance Trend</h2>
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : trends.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No trend data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="impressions" name="Impressions" stroke="#0891B2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="likes" name="Likes" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="comments" name="Comments" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Engagement Distribution</h2>
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <EngagementPie data={overview} />
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            to="/engagement-analytics"
            Icon={BarChart3}
            label="Detailed Analytics"
            description="Deep-dive into engagement metrics and trends"
          />
          <QuickAction
            to="/content-templates"
            Icon={FileText}
            label="Content Templates"
            description="Browse templates to boost your posts"
          />
          <QuickAction
            to="/dashboard"
            Icon={LayoutDashboard}
            label="Dashboard"
            description="Back to your main dashboard"
          />
        </div>
      </div>
    </div>
  )
}
