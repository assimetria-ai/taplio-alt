// @custom — Lead Generation page for tracking LinkedIn engagement leads
import { useState, useMemo, useCallback } from 'react'
import { Users, UserPlus, TrendingUp, Filter, Download, Eye, MessageSquare, Heart, Share2, Star, ExternalLink, BarChart3, Target } from 'lucide-react'
import { DashboardLayout, StatCard, StatCardGrid, DataTable } from '../../../components/@system/Dashboard'
import { Button } from '../../../components/@system/ui/button'
import { Badge } from '../../../components/@system/ui/badge'

const LEAD_STATUSES = ['All', 'Hot', 'Warm', 'Cold', 'Contacted', 'Converted']
const LEAD_SOURCES = ['All', 'Post Likes', 'Comments', 'Shares', 'Profile Views', 'DMs']
const TIME_RANGES = ['7 days', '30 days', '90 days', 'All time']

const MOCK_LEADS = [
  { id: 1, name: 'Sarah Chen', title: 'VP of Marketing', company: 'TechCorp', status: 'Hot', source: 'Comment', engagement: 12, lastActive: '2h ago', score: 92, avatar: null },
  { id: 2, name: 'James Wilson', title: 'CEO', company: 'StartupXYZ', status: 'Hot', source: 'Like + Comment', engagement: 8, lastActive: '5h ago', score: 87, avatar: null },
  { id: 3, name: 'Maria Santos', title: 'Head of Growth', company: 'ScaleUp Inc', status: 'Warm', source: 'Share', engagement: 5, lastActive: '1d ago', score: 73, avatar: null },
  { id: 4, name: 'David Kim', title: 'Product Manager', company: 'BigTech', status: 'Warm', source: 'Profile View', engagement: 3, lastActive: '2d ago', score: 65, avatar: null },
  { id: 5, name: 'Emma Roberts', title: 'Founder', company: 'NewVenture', status: 'Hot', source: 'Comment', engagement: 15, lastActive: '1h ago', score: 95, avatar: null },
  { id: 6, name: 'Michael Brown', title: 'Sales Director', company: 'Enterprise Co', status: 'Cold', source: 'Like', engagement: 1, lastActive: '5d ago', score: 32, avatar: null },
  { id: 7, name: 'Lisa Zhang', title: 'CMO', company: 'BrandFirst', status: 'Warm', source: 'Comment', engagement: 6, lastActive: '12h ago', score: 71, avatar: null },
  { id: 8, name: 'Robert Taylor', title: 'CTO', company: 'DevOps.io', status: 'Contacted', source: 'DM', engagement: 9, lastActive: '3h ago', score: 84, avatar: null },
  { id: 9, name: 'Ana Popov', title: 'Growth Lead', company: 'FastGrow', status: 'Converted', source: 'Comment + DM', engagement: 22, lastActive: '30m ago', score: 98, avatar: null },
  { id: 10, name: 'Tom Harris', title: 'VP Sales', company: 'RevenueMax', status: 'Cold', source: 'Like', engagement: 2, lastActive: '7d ago', score: 28, avatar: null },
]

function StatusBadge({ status }) {
  const colorMap = {
    Hot: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Warm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Cold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground">{score}</span>
    </div>
  )
}

function LeadRow({ lead, onView }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{lead.name}</p>
            <p className="text-xs text-muted-foreground">{lead.title}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{lead.company}</td>
      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.source}</td>
      <td className="px-4 py-3"><ScoreBar score={lead.score} /></td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.engagement}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{lead.lastActive}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onView(lead)} className="p-1 rounded hover:bg-muted" title="View profile">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="p-1 rounded hover:bg-muted" title="Send message">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="p-1 rounded hover:bg-muted" title="Mark as star">
            <Star className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function LeadDetailPanel({ lead, onClose }) {
  if (!lead) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Lead Profile</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{lead.name}</p>
            <p className="text-sm text-muted-foreground">{lead.title} at {lead.company}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Lead Score</p>
            <p className="text-xl font-bold text-foreground">{lead.score}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Engagements</p>
            <p className="text-xl font-bold text-foreground">{lead.engagement}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge status={lead.status} />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Source</p>
            <p className="text-sm font-medium text-foreground">{lead.source}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Engagement</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              Liked your post "5 Lessons from Scaling..."
              <span className="ml-auto text-xs">2h ago</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Commented "Great insights!"
              <span className="ml-auto text-xs">1d ago</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Share2 className="h-3.5 w-3.5" />
              Shared your post
              <span className="ml-auto text-xs">3d ago</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Send Message
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LeadGenerationPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [timeRange, setTimeRange] = useState('30 days')
  const [selectedLead, setSelectedLead] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter((lead) => {
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'All' && !lead.source.toLowerCase().includes(sourceFilter.toLowerCase().replace('post ', ''))) return false
      if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) && !lead.company.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [statusFilter, sourceFilter, searchQuery])

  const stats = useMemo(() => ({
    total: MOCK_LEADS.length,
    hot: MOCK_LEADS.filter(l => l.status === 'Hot').length,
    contacted: MOCK_LEADS.filter(l => l.status === 'Contacted').length,
    converted: MOCK_LEADS.filter(l => l.status === 'Converted').length,
  }), [])

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Lead Generation
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage leads from your LinkedIn engagement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatCardGrid>
          <StatCard
            title="Total Leads"
            value={stats.total}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: '+12%', positive: true }}
          />
          <StatCard
            title="Hot Leads"
            value={stats.hot}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: '+3', positive: true }}
          />
          <StatCard
            title="Contacted"
            value={stats.contacted}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <StatCard
            title="Converted"
            value={stats.converted}
            icon={<BarChart3 className="h-5 w-5" />}
            trend={{ value: '+1', positive: true }}
          />
        </StatCardGrid>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {TIME_RANGES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Engagements</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} onView={setSelectedLead} />
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leads match your filters</p>
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedLead(null)} />
            <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default LeadGenerationPage
