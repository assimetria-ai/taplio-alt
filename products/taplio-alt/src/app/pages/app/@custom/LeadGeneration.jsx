import { useState, useMemo } from 'react'
import {
  Users, Search, Download, Filter, Star, Building2,
  Briefcase, MessageSquare, Heart, Share2, ChevronDown,
  ExternalLink, StickyNote, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

// ── Mock leads data ───────────────────────────────────────────────────────────

const MOCK_LEADS = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'VP of Marketing',
    company: 'TechFlow Inc.',
    industry: 'SaaS',
    engagement: 'high',
    interactions: { likes: 12, comments: 5, shares: 2 },
    lastActive: '2 hours ago',
    starred: true,
    notes: 'Interested in content strategy tools',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    title: 'Head of Growth',
    company: 'ScaleUp Labs',
    industry: 'Marketing',
    engagement: 'high',
    interactions: { likes: 8, comments: 7, shares: 1 },
    lastActive: '5 hours ago',
    starred: true,
    notes: '',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'Content Director',
    company: 'MediaBridge',
    industry: 'Media',
    engagement: 'medium',
    interactions: { likes: 15, comments: 3, shares: 0 },
    lastActive: '1 day ago',
    starred: false,
    notes: 'Met at SaaStr conference',
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'CEO',
    company: 'Notion.so Clone',
    industry: 'Productivity',
    engagement: 'medium',
    interactions: { likes: 6, comments: 2, shares: 3 },
    lastActive: '1 day ago',
    starred: false,
    notes: '',
  },
  {
    id: 5,
    name: 'Priya Patel',
    title: 'Social Media Manager',
    company: 'GrowthHive',
    industry: 'Marketing',
    engagement: 'high',
    interactions: { likes: 20, comments: 8, shares: 4 },
    lastActive: '3 hours ago',
    starred: true,
    notes: 'Potential partnership',
  },
  {
    id: 6,
    name: 'Alex Thompson',
    title: 'Founder',
    company: 'ContentStack AI',
    industry: 'AI',
    engagement: 'low',
    interactions: { likes: 3, comments: 1, shares: 0 },
    lastActive: '3 days ago',
    starred: false,
    notes: '',
  },
  {
    id: 7,
    name: 'Lisa Wang',
    title: 'Marketing Lead',
    company: 'CloudSync',
    industry: 'SaaS',
    engagement: 'medium',
    interactions: { likes: 9, comments: 4, shares: 1 },
    lastActive: '12 hours ago',
    starred: false,
    notes: 'Follows competitor Taplio',
  },
  {
    id: 8,
    name: 'James O\'Brien',
    title: 'Director of Sales',
    company: 'RevenueOS',
    industry: 'Sales Tech',
    engagement: 'high',
    interactions: { likes: 11, comments: 6, shares: 2 },
    lastActive: '4 hours ago',
    starred: false,
    notes: '',
  },
]

const ENGAGEMENT_COLORS = {
  high: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'High' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Medium' },
  low: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Low' },
}

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="rounded-lg p-2" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function LeadRow({ lead, onToggleStar }) {
  const eng = ENGAGEMENT_COLORS[lead.engagement]
  const totalInteractions = lead.interactions.likes + lead.interactions.comments + lead.interactions.shares

  return (
    <tr className="border-b border-border hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3">
        <button onClick={() => onToggleStar(lead.id)} className="text-muted-foreground hover:text-yellow-500 transition-colors">
          <Star className={cn('h-4 w-4', lead.starred && 'fill-yellow-500 text-yellow-500')} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-foreground text-sm">{lead.name}</p>
          <p className="text-xs text-muted-foreground">{lead.title}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          {lead.company}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{lead.industry}</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', eng.bg, eng.text)}>
          {eng.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {lead.interactions.likes}</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {lead.interactions.comments}</span>
          <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {lead.interactions.shares}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{lead.lastActive}</td>
      <td className="px-4 py-3">
        {lead.notes ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground" title={lead.notes}>
            <StickyNote className="h-3 w-3" /> Note
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">-</span>
        )}
      </td>
    </tr>
  )
}

export default function LeadGeneration() {
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [search, setSearch] = useState('')
  const [filterEngagement, setFilterEngagement] = useState('all')
  const [sortBy, setSortBy] = useState('engagement')

  const toggleStar = (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, starred: !l.starred } : l))
  }

  const filtered = useMemo(() => {
    let result = [...leads]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q)
      )
    }
    if (filterEngagement !== 'all') {
      result = result.filter(l => l.engagement === filterEngagement)
    }
    // Sort: starred first, then by criteria
    result.sort((a, b) => {
      if (a.starred !== b.starred) return b.starred ? 1 : -1
      if (sortBy === 'engagement') {
        const order = { high: 3, medium: 2, low: 1 }
        return (order[b.engagement] || 0) - (order[a.engagement] || 0)
      }
      return (b.interactions.likes + b.interactions.comments) - (a.interactions.likes + a.interactions.comments)
    })
    return result
  }, [leads, search, filterEngagement, sortBy])

  const stats = useMemo(() => ({
    total: leads.length,
    high: leads.filter(l => l.engagement === 'high').length,
    starred: leads.filter(l => l.starred).length,
    totalInteractions: leads.reduce((s, l) => s + l.interactions.likes + l.interactions.comments + l.interactions.shares, 0),
  }), [leads])

  const handleExportCSV = () => {
    const header = 'Name,Title,Company,Industry,Engagement,Likes,Comments,Shares,Notes\n'
    const rows = filtered.map(l =>
      `"${l.name}","${l.title}","${l.company}","${l.industry}","${l.engagement}",${l.interactions.likes},${l.interactions.comments},${l.interactions.shares},"${l.notes}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Generation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track engagement on your posts and identify potential leads from LinkedIn interactions.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} Icon={Users} color="#0891B2" />
        <StatCard label="High Engagement" value={stats.high} Icon={Star} color="#10B981" />
        <StatCard label="Starred" value={stats.starred} Icon={Star} color="#F59E0B" />
        <StatCard label="Total Interactions" value={stats.totalInteractions} Icon={MessageSquare} color="#8B5CF6" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name, company, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map(level => (
            <button
              key={level}
              onClick={() => setFilterEngagement(level)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                filterEngagement === level
                  ? 'bg-[#0891B2] text-white'
                  : 'border border-border text-muted-foreground hover:bg-accent'
              )}
            >
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button onClick={() => setSortBy('engagement')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Engagement <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button onClick={() => setSortBy('interactions')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Interactions <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <LeadRow key={lead.id} lead={lead} onToggleStar={toggleStar} />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">No leads match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
