// @custom — Taplio Alt Dashboard — LinkedIn content creation & scheduling overview
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Clock,
  PenTool,
  BarChart3,
  Target,
  ChevronRight,
  Zap,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
} from 'lucide-react'
import { useAuthContext } from '../../../store/@system/auth'
import { DashboardLayout, StatCard, StatCardGrid } from '../../../components/@system/Dashboard'
import { Button } from '../../../components/@system/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/@system/Card/Card'

// ─── Mock Data (replace with real API calls) ──────────────────────────────────

const STATS = {
  totalPosts: 47,
  scheduledPosts: 8,
  impressionsThisWeek: 12450,
  followersGained: 156,
  engagementRate: 4.8,
  leadsGenerated: 23,
}

const RECENT_POSTS = [
  {
    id: 1,
    title: '5 lessons from scaling a SaaS to $1M ARR',
    status: 'published',
    publishedAt: '2026-03-13T10:30:00Z',
    impressions: 2340,
    likes: 89,
    comments: 12,
  },
  {
    id: 2,
    title: 'Why most LinkedIn content strategies fail',
    status: 'published',
    publishedAt: '2026-03-12T14:00:00Z',
    impressions: 1890,
    likes: 67,
    comments: 8,
  },
  {
    id: 3,
    title: 'The remote work productivity framework',
    status: 'scheduled',
    publishedAt: '2026-03-15T09:00:00Z',
    impressions: 0,
    likes: 0,
    comments: 0,
  },
  {
    id: 4,
    title: 'How I built my personal brand in 90 days',
    status: 'draft',
    publishedAt: null,
    impressions: 0,
    likes: 0,
    comments: 0,
  },
]

const UPCOMING_SCHEDULED = [
  { id: 3, title: 'The remote work productivity framework', scheduledFor: '2026-03-15T09:00:00Z' },
  { id: 5, title: 'Top hiring mistakes founders make', scheduledFor: '2026-03-16T11:00:00Z' },
  { id: 6, title: 'Building in public: Week 12 update', scheduledFor: '2026-03-17T08:30:00Z' },
]

const BEST_POSTING_TIMES = [
  { day: 'Tuesday', time: '9:00 AM', score: 95 },
  { day: 'Wednesday', time: '11:00 AM', score: 88 },
  { day: 'Thursday', time: '8:30 AM', score: 82 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }) {
  const styles = {
    published: 'bg-emerald-100 text-emerald-700',
    scheduled: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActionsBar({ navigate }) {
  const actions = [
    { icon: Sparkles, label: 'Write with AI', path: '/app/writer', color: 'text-violet-600' },
    { icon: Calendar, label: 'Schedule Post', path: '/app/posts/new', color: 'text-blue-600' },
    { icon: FileText, label: 'Browse Templates', path: '/app/templates', color: 'text-amber-600' },
    { icon: BarChart3, label: 'View Analytics', path: '/app/analytics', color: 'text-emerald-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <button
          key={action.path}
          onClick={() => navigate(action.path)}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left"
        >
          <div className={`p-2 rounded-lg bg-muted ${action.color}`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Recent Posts Table ───────────────────────────────────────────────────────

function RecentPostsTable({ posts, navigate }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Posts</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/posts')}>
          View all <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/app/posts/${post.id}/edit`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={post.status} />
                  <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
                </div>
              </div>
              {post.status === 'published' && (
                <div className="flex items-center gap-4 ml-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatNumber(post.impressions)}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.comments}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Upcoming Scheduled ───────────────────────────────────────────────────────

function UpcomingScheduled({ items, navigate }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming Schedule</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/calendar')}>
          Calendar <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.scheduledFor)}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming posts scheduled</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Best Posting Times ───────────────────────────────────────────────────────

function BestPostingTimes({ times }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Best Posting Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {times.map((t, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t.day}</p>
                <p className="text-xs text-muted-foreground">{t.time}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${t.score}%` }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-8">{t.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function TaplioDashboardPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <DashboardLayout>
      <DashboardLayout.Header
        title={`Welcome back, ${firstName}`}
        description="Here's how your LinkedIn content is performing"
        actions={
          <Button onClick={() => navigate('/app/writer')} className="gap-2">
            <Sparkles className="h-4 w-4" /> Write with AI
          </Button>
        }
      />
      <DashboardLayout.Content>
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActionsBar navigate={navigate} />

          {/* Stats Grid */}
          <StatCardGrid>
            <StatCard
              title="Total Posts"
              value={STATS.totalPosts}
              icon={FileText}
              description="All time"
            />
            <StatCard
              title="Scheduled"
              value={STATS.scheduledPosts}
              icon={Calendar}
              description="In queue"
            />
            <StatCard
              title="Impressions"
              value={formatNumber(STATS.impressionsThisWeek)}
              icon={Eye}
              description="This week"
              trend={{ value: 12, direction: 'up' }}
            />
            <StatCard
              title="Engagement Rate"
              value={`${STATS.engagementRate}%`}
              icon={TrendingUp}
              description="Avg. this month"
              trend={{ value: 0.5, direction: 'up' }}
            />
            <StatCard
              title="Followers Gained"
              value={`+${STATS.followersGained}`}
              icon={Users}
              description="This month"
              trend={{ value: 8, direction: 'up' }}
            />
            <StatCard
              title="Leads Generated"
              value={STATS.leadsGenerated}
              icon={Target}
              description="This month"
            />
          </StatCardGrid>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentPostsTable posts={RECENT_POSTS} navigate={navigate} />
            </div>
            <div className="space-y-6">
              <UpcomingScheduled items={UPCOMING_SCHEDULED} navigate={navigate} />
              <BestPostingTimes times={BEST_POSTING_TIMES} />
            </div>
          </div>
        </div>
      </DashboardLayout.Content>
    </DashboardLayout>
  )
}
