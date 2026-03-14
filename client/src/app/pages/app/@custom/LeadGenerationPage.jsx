// @custom — Lead Generation page for LinkedIn engagement tracking
import { useState, useMemo } from 'react'
import { Users, Download, Search, Filter, UserPlus, Building2, Briefcase, MessageSquare, Heart, Share2, Star, ChevronDown, ExternalLink, StickyNote } from 'lucide-react'
import { DashboardLayout } from '../../../components/@system/Dashboard'
import { Button } from '../../../components/@system/ui/button'
import { TAPLIO_NAV_ITEMS } from '../../../config/@custom/navigation'

const MOCK_LEADS = [
  { id: 1, name: 'Sarah Chen', title: 'VP of Marketing', company: 'TechCorp Inc.', industry: 'Technology', engagementScore: 95, likes: 12, comments: 5, shares: 3, lastEngaged: '2h ago', avatar: null, notes: '' },
  { id: 2, name: 'Marcus Johnson', title: 'Head of Growth', company: 'ScaleUp Labs', industry: 'SaaS', engagementScore: 88, likes: 8, comments: 7, shares: 1, lastEngaged: '4h ago', avatar: null, notes: '' },
  { id: 3, name: 'Emily Rodriguez', title: 'Content Director', company: 'MediaFlow', industry: 'Media', engagementScore: 82, likes: 15, comments: 3, shares: 2, lastEngaged: '1d ago', avatar: null, notes: '' },
  { id: 4, name: 'David Kim', title: 'CEO', company: 'DataDriven AI', industry: 'AI/ML', engagementScore: 78, likes: 6, comments: 4, shares: 4, lastEngaged: '1d ago', avatar: null, notes: '' },
  { id: 5, name: 'Lisa Patel', title: 'Product Manager', company: 'CloudScale', industry: 'Cloud', engagementScore: 75, likes: 10, comments: 2, shares: 0, lastEngaged: '2d ago', avatar: null, notes: '' },
  { id: 6, name: 'James Wilson', title: 'Director of Sales', company: 'RevenueMax', industry: 'Sales Tech', engagementScore: 71, likes: 4, comments: 6, shares: 1, lastEngaged: '2d ago', avatar: null, notes: '' },
  { id: 7, name: 'Ana Martinez', title: 'CMO', company: 'BrandForge', industry: 'Marketing', engagementScore: 68, likes: 7, comments: 1, shares: 3, lastEngaged: '3d ago', avatar: null, notes: '' },
  { id: 8, name: 'Robert Taylor', title: 'Founder', company: 'StartupLab', industry: 'Venture', engagementScore: 65, likes: 3, comments: 3, shares: 2, lastEngaged: '4d ago', avatar: null, notes: '' },
]

const ENGAGEMENT_FILTERS = ['All', 'High (80+)', 'Medium (50-79)', 'Low (<50)']
const INDUSTRY_FILTERS = ['All Industries', 'Technology', 'SaaS', 'Media', 'AI/ML', 'Cloud', 'Sales Tech', 'Marketing', 'Venture']

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{score}</span>
}

function LeadRow({ lead, onAddNote }) {
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState(lead.notes)

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{lead.name}</p>
              <p className="text-xs text-muted-foreground">{lead.title}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground">{lead.company}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-muted-foreground">{lead.industry}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <ScoreBadge score={lead.engagementScore} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{lead.likes}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{lead.comments}</span>
            <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{lead.shares}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{lead.lastEngaged}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNote(!showNote)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Add note"
            >
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded hover:bg-muted transition-colors" title="View profile">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </td>
      </tr>
      {showNote && (
        <tr className="border-b border-border bg-muted/30">
          <td colSpan={7} className="px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a follow-up note..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
              <Button
                size="sm"
                onClick={() => { onAddNote(lead.id, note); setShowNote(false) }}
              >
                Save
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function LeadGenerationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('All')
  const [industryFilter, setIndustryFilter] = useState('All Industries')
  const [leads, setLeads] = useState(MOCK_LEADS)

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchQuery ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesEngagement = true
      if (engagementFilter === 'High (80+)') matchesEngagement = lead.engagementScore >= 80
      else if (engagementFilter === 'Medium (50-79)') matchesEngagement = lead.engagementScore >= 50 && lead.engagementScore < 80
      else if (engagementFilter === 'Low (<50)') matchesEngagement = lead.engagementScore < 50

      const matchesIndustry = industryFilter === 'All Industries' || lead.industry === industryFilter

      return matchesSearch && matchesEngagement && matchesIndustry
    })
  }, [leads, searchQuery, engagementFilter, industryFilter])

  const handleAddNote = (id, note) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: note } : l))
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Title', 'Company', 'Industry', 'Engagement Score', 'Likes', 'Comments', 'Shares', 'Last Engaged', 'Notes']
    const rows = filteredLeads.map(l => [l.name, l.title, l.company, l.industry, l.engagementScore, l.likes, l.comments, l.shares, l.lastEngaged, l.notes])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = useMemo(() => ({
    total: leads.length,
    highEngagement: leads.filter(l => l.engagementScore >= 80).length,
    newThisWeek: 3,
    avgScore: Math.round(leads.reduce((s, l) => s + l.engagementScore, 0) / leads.length),
  }), [leads])

  return (
    <DashboardLayout navItems={TAPLIO_NAV_ITEMS}>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lead Generation</h1>
              <p className="text-sm text-muted-foreground mt-1">Track engagement and identify potential leads from your LinkedIn posts</p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Leads</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">High Engagement</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.highEngagement}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserPlus className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">New This Week</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.newThisWeek}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Avg. Score</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.avgScore}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads by name, company, or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={engagementFilter}
                onChange={e => setEngagementFilter(e.target.value)}
                className="appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm"
              >
                {ENGAGEMENT_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
                className="appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm"
              >
                {INDUSTRY_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Leads Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Industry</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Engagement</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <LeadRow key={lead.id} lead={lead} onAddNote={handleAddNote} />
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No leads match your filters. Try adjusting your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default LeadGenerationPage
