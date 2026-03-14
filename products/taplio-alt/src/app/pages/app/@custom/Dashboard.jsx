import { Link } from 'react-router-dom'
import {
  PenSquare, Calendar, BarChart3, Users, TrendingUp, TrendingDown,
  Eye, Heart, Share2, MousePointer, Clock, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/app/store/@system/auth'
import { cn } from '@/app/lib/@system/utils'

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Post Impressions',
    value: '12,847',
    delta: '+18.3%',
    trend: 'up',
    Icon: Eye,
    color: '#0891B2',
  },
  {
    label: 'Engagement Rate',
    value: '4.2%',
    delta: '+0.8%',
    trend: 'up',
    Icon: Heart,
    color: '#8B5CF6',
  },
  {
    label: 'New Followers',
    value: '+127',
    delta: '+23%',
    trend: 'up',
    Icon: Users,
    color: '#10B981',
  },
  {
    label: 'Leads Captured',
    value: '34',
    delta: '-5%',
    trend: 'down',
    Icon: MousePointer,
    color: '#F59E0B',
  },
]

const QUICK_ACTIONS = [
  {
    to: '/posts/new',
    Icon: PenSquare,
    label: 'Write with AI',
    subtitle: 'Generate post ideas and content instantly',
  },
  {
    to: '/posts/new',
    Icon: Calendar,
    label: 'Schedule Post',
    subtitle: 'Plan your content for optimal reach',
  },
  {
    to: '/analytics',
    Icon: BarChart3,
    label: 'View Analytics',
    subtitle: 'Track impressions, engagement and leads',
  },
  {
    to: '/engagement-analytics',
    Icon: Share2,
    label: 'Browse Leads',
    subtitle: 'Manage and convert your LinkedIn leads',
  },
]

const UPCOMING_POSTS = [
  {
    id: 1,
    content: '5 LinkedIn growth strategies that helped me gain 10K followers in 90 days…',
    status: 'scheduled',
    scheduledFor: 'Mar 15 · 9:00 AM',
  },
  {
    id: 2,
    content: 'The biggest mistake I see founders make on LinkedIn (and how to fix it)…',
    status: 'scheduled',
    scheduledFor: 'Mar 16 · 11:30 AM',
  },
  {
    id: 3,
    content: 'Hot take: engagement pods are dead. Here is what actually works in 2025…',
    status: 'draft',
    scheduledFor: null,
  },
  {
    id: 4,
    content: 'I analyzed 500 viral LinkedIn posts. Here are the 7 patterns they all share…',
    status: 'scheduled',
    scheduledFor: 'Mar 18 · 8:00 AM',
  },
]

const TOP_POSTS = [
  {
    id: 1,
    content: '5 LinkedIn growth strategies that helped me gain 10K followers in 90 days',
    impressions: 8420,
    engagement: '6.3%',
    leads: 12,
    performance: 92,
  },
  {
    id: 2,
    content: 'Why your LinkedIn content is not getting traction (honest truth)',
    impressions: 6830,
    engagement: '5.1%',
    leads: 8,
    performance: 78,
  },
  {
    id: 3,
    content: 'The 3-line hook formula that gets my posts 4× more views',
    impressions: 5214,
    engagement: '7.2%',
    leads: 6,
    performance: 71,
  },
  {
    id: 4,
    content: 'I tested 50 different post formats. Here is what LinkedIn actually rewards',
    impressions: 4930,
    engagement: '4.8%',
    leads: 5,
    performance: 65,
  },
  {
    id: 5,
    content: 'Controversial opinion: personal stories outperform expert tips 3:1 on LinkedIn',
    impressions: 3870,
    engagement: '3.9%',
    leads: 3,
    performance: 48,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, delta, trend, Icon, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="rounded-lg p-2" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {trend === 'up'
          ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          : <TrendingDown className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />}
        <span className={cn(
          'text-xs font-medium',
          trend === 'up'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400',
        )}>
          {delta} vs last month
        </span>
      </div>
    </div>
  )
}

// ── QuickActionCard ───────────────────────────────────────────────────────────

function QuickActionCard({ to, Icon, label, subtitle }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-cyan-500/40 hover:shadow-md transition-all duration-200"
    >
      <div className="rounded-lg bg-cyan-500/10 p-2.5 group-hover:bg-cyan-500/20 transition-colors shrink-0">
        <Icon className="h-5 w-5 text-cyan-600" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 transition-colors shrink-0" aria-hidden="true" />
    </Link>
  )
}

// ── ImpressionsChart (SVG) ────────────────────────────────────────────────────
//
// Points computed from 12 months of mock data (Jan–Dec):
// [3200,4100,3800,5200,6800,7400,8100,9600,8900,10200,11800,12847]
// Normalized into viewBox 0 0 500 160, y-range [10, 150].

function ImpressionsChart() {
  // Smooth cubic-bezier path through all 12 data points.
  // Control points are spaced 15px (⅓ of 45px interval) from each knot.
  const linePath =
    'M 0,150 ' +
    'C 15,150 30,137 45,137 ' +
    'C 60,137 76,141 91,141 ' +
    'C 106,141 121,121 136,121 ' +
    'C 151,121 166,98 182,98 ' +
    'C 197,98 212,89 227,89 ' +
    'C 242,89 258,79 273,79 ' +
    'C 288,79 303,57 318,57 ' +
    'C 333,57 348,67 364,67 ' +
    'C 379,67 394,48 409,48 ' +
    'C 424,48 440,25 455,25 ' +
    'C 470,25 485,10 500,10'

  const fillPath = linePath + ' L 500,158 L 0,158 Z'

  return (
    <svg
      viewBox="0 0 500 160"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0891B2" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Subtle horizontal grid lines */}
      <line x1="0" y1="40"  x2="500" y2="40"  stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
      <line x1="0" y1="80"  x2="500" y2="80"  stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
      <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />

      {/* Gradient fill area */}
      <path d={fillPath} fill="url(#impressionsGradient)" />

      {/* Stroke line */}
      <path
        d={linePath}
        fill="none"
        stroke="#0891B2"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Endpoint indicator */}
      <circle cx="500" cy="10" r="7" fill="#0891B2" fillOpacity="0.18" />
      <circle cx="500" cy="10" r="3.5" fill="#0891B2" />
    </svg>
  )
}

// ── PostStatusBadge ───────────────────────────────────────────────────────────

function PostStatusBadge({ status }) {
  if (status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" aria-hidden="true" />
        Scheduled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" aria-hidden="true" />
      Draft
    </span>
  )
}

// ── PerformanceBar ────────────────────────────────────────────────────────────

function PerformanceBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-7 text-right shrink-0">
        {value}%
      </span>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back{firstName ? `, ${firstName}` : ''}. Here is your LinkedIn overview.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            View Calendar
          </Link>
          <Link
            to="/posts/new"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
          >
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            + New Post
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Quick actions (2×2) ── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_ACTIONS.map(action => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </div>

      {/* ── Chart + Upcoming posts ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Impressions over time */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Impressions Over Time</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-foreground">12,847</p>
              <p className="flex items-center justify-end gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                +18.3%
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="h-40">
              <ImpressionsChart />
            </div>
            <div className="flex justify-between mt-2">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                <span key={m} className="text-[10px] text-muted-foreground">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming posts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Upcoming Posts</h2>
            <Link
              to="/posts"
              className="text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              View all →
            </Link>
          </div>
          <ul className="space-y-3" role="list">
            {UPCOMING_POSTS.map(post => (
              <li key={post.id} className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-1.5 mt-0.5 shrink-0">
                  {post.status === 'scheduled'
                    ? <Clock className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
                    : <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <PostStatusBadge status={post.status} />
                    {post.scheduledFor && (
                      <span className="text-xs text-muted-foreground">{post.scheduledFor}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Top performing posts table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Top Performing Posts</h2>
          <Link
            to="/analytics"
            className="text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            View analytics →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Post
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Impressions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Engagement
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Leads
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-40">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TOP_POSTS.map(post => (
                <tr key={post.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-sm text-foreground truncate">{post.content}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    <span className="text-sm font-medium text-foreground">{formatNum(post.impressions)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    <span className="text-sm font-medium text-foreground">{post.engagement}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    <span className="text-sm font-medium text-foreground">{post.leads}</span>
                  </td>
                  <td className="px-5 py-3.5 w-40">
                    <PerformanceBar value={post.performance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
