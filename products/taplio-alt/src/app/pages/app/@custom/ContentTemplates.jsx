import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Search, Copy, Sparkles, ChevronRight, Plus, Tag,
  TrendingUp, MessageSquare, Users, Briefcase, Lightbulb, BookOpen,
  Filter, X, Check,
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

// ── Template categories ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',           label: 'All Templates', Icon: FileText },
  { id: 'storytelling',  label: 'Storytelling',  Icon: BookOpen },
  { id: 'thought-leader',label: 'Thought Leadership', Icon: Lightbulb },
  { id: 'engagement',    label: 'Engagement',    Icon: MessageSquare },
  { id: 'growth',        label: 'Growth',        Icon: TrendingUp },
  { id: 'networking',    label: 'Networking',     Icon: Users },
  { id: 'career',        label: 'Career',        Icon: Briefcase },
]

// ── Built-in templates ───────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 1,
    title: 'The Hook Story',
    category: 'storytelling',
    description: 'Open with a surprising hook, share a personal story, end with a takeaway.',
    body: "Most people think [common belief].\n\nI used to think the same.\n\nThen [event happened] and everything changed.\n\nHere's what I learned:\n\n1. [Lesson 1]\n2. [Lesson 2]\n3. [Lesson 3]\n\nThe biggest takeaway?\n→ [Key insight]\n\nAgree? Let me know below 👇",
    engagement: 'high',
    tags: ['story', 'hook', 'personal'],
  },
  {
    id: 2,
    title: 'Contrarian Take',
    category: 'thought-leader',
    description: 'Challenge conventional wisdom with a bold opinion backed by evidence.',
    body: "Unpopular opinion:\n\n[Bold statement that goes against the norm]\n\nHere's why:\n\n→ [Reason 1 with data/example]\n→ [Reason 2 with data/example]\n→ [Reason 3 with data/example]\n\nThe truth is [nuanced conclusion].\n\nWhat's your take?",
    engagement: 'high',
    tags: ['opinion', 'debate', 'authority'],
  },
  {
    id: 3,
    title: 'Listicle Tips',
    category: 'growth',
    description: 'Share actionable tips in a numbered list format for maximum saves.',
    body: "[Number] [topic] tips I wish I knew [time] ago:\n\n1. [Tip] — [Brief explanation]\n2. [Tip] — [Brief explanation]\n3. [Tip] — [Brief explanation]\n4. [Tip] — [Brief explanation]\n5. [Tip] — [Brief explanation]\n\nWhich one resonates most?\n\n♻️ Repost to help your network",
    engagement: 'medium',
    tags: ['tips', 'list', 'actionable'],
  },
  {
    id: 4,
    title: 'Poll / Question',
    category: 'engagement',
    description: 'Ask an engaging question to drive comments and boost reach.',
    body: "Quick question for my network:\n\n[Relevant question about industry topic]?\n\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) Something else (comment below!)\n\nI'll share the results + my take on Friday.",
    engagement: 'high',
    tags: ['poll', 'question', 'interaction'],
  },
  {
    id: 5,
    title: 'Before / After',
    category: 'storytelling',
    description: 'Show a transformation with clear before and after states.',
    body: "2 years ago:\n→ [Old situation 1]\n→ [Old situation 2]\n→ [Old situation 3]\n\nToday:\n→ [New situation 1]\n→ [New situation 2]\n→ [New situation 3]\n\nWhat changed?\n\n[The key shift or decision that made it happen]\n\nIf you're still in the \"before\" stage:\n[Actionable advice]",
    engagement: 'high',
    tags: ['transformation', 'personal', 'inspiring'],
  },
  {
    id: 6,
    title: 'Framework Share',
    category: 'thought-leader',
    description: 'Share a proprietary framework or mental model.',
    body: "I use a simple framework called [Name]:\n\n[Letter 1] — [What it stands for]\n[Letter 2] — [What it stands for]\n[Letter 3] — [What it stands for]\n[Letter 4] — [What it stands for]\n\nHere's how it works in practice:\n\n[Brief real example]\n\nResult: [Outcome]\n\nSave this for later 🔖",
    engagement: 'medium',
    tags: ['framework', 'system', 'educational'],
  },
  {
    id: 7,
    title: 'Celebration Post',
    category: 'career',
    description: 'Celebrate a milestone while providing value to your audience.',
    body: "Excited to share: [Milestone/achievement] 🎉\n\nBut more importantly, here's what got me here:\n\n1. [Key factor]\n2. [Key factor]\n3. [Key factor]\n\nThe biggest lesson from this journey:\n→ [Genuine insight]\n\nThank you to [people/community] who made this possible.\n\nWhat milestone are you working towards?",
    engagement: 'medium',
    tags: ['milestone', 'career', 'gratitude'],
  },
  {
    id: 8,
    title: 'Connection Request Follow-up',
    category: 'networking',
    description: 'Follow up with new connections to start meaningful conversations.',
    body: "Just connected with [number]+ amazing people this week.\n\nIf we recently connected, here's a bit about me:\n\n→ I help [audience] do [outcome]\n→ I post about [topic 1], [topic 2], and [topic 3]\n→ My best resource: [link or description]\n\nI'd love to learn about you too.\nDrop a comment: What are you working on right now?",
    engagement: 'medium',
    tags: ['networking', 'introduction', 'community'],
  },
  {
    id: 9,
    title: 'Myth Buster',
    category: 'growth',
    description: 'Debunk a common myth in your industry to establish authority.',
    body: "Myth: \"[Common misconception]\"\n\nReality: [The truth]\n\nHere's the data:\n→ [Stat or evidence 1]\n→ [Stat or evidence 2]\n→ [Stat or evidence 3]\n\nSo next time someone says [myth]...\n\nRemember: [Memorable one-liner]\n\n♻️ Share this with someone who needs to hear it",
    engagement: 'high',
    tags: ['myth', 'educational', 'authority'],
  },
]

// ── Engagement badge ─────────────────────────────────────────────────────────

const ENGAGEMENT_STYLES = {
  high:   { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'High engagement' },
  medium: { bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',     label: 'Medium engagement' },
  low:    { bg: 'bg-gray-500/10',     text: 'text-gray-600 dark:text-gray-400',       label: 'Low engagement' },
}

function EngagementBadge({ level }) {
  const s = ENGAGEMENT_STYLES[level] || ENGAGEMENT_STYLES.medium
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', s.bg, s.text)}>
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {s.label}
    </span>
  )
}

// ── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onSelect }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(template.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [template.body])

  const cat = CATEGORIES.find(c => c.id === template.category)

  return (
    <div
      className="group rounded-xl border border-border bg-card p-5 hover:border-[#0891B2]/40 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {cat && <cat.Icon className="h-4 w-4 text-[#0891B2]" aria-hidden="true" />}
          <span className="text-xs font-medium text-muted-foreground">{cat?.label}</span>
        </div>
        <EngagementBadge level={template.engagement} />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1.5">{template.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {template.tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent/50 px-2 py-0.5 text-xs text-muted-foreground">
            <Tag className="h-2.5 w-2.5" aria-hidden="true" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-accent/50 text-foreground hover:bg-accent transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#0891B2] transition-colors" aria-hidden="true" />
      </div>
    </div>
  )
}

// ── Template preview modal ───────────────────────────────────────────────────

function TemplatePreview({ template, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(template.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [template.body])

  if (!template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{template.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-accent/30 rounded-xl p-4 font-sans leading-relaxed">
            {template.body}
          </pre>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border">
          <EngagementBadge level={template.engagement} />
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-[#0891B2] text-white hover:bg-[#0891B2]/90 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ContentTemplates() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const filtered = TEMPLATES.filter(t => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-built LinkedIn post formats to boost your engagement
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-muted-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {TEMPLATES.length} templates
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search templates by name, description, or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0891B2]/40 focus:border-[#0891B2]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-accent"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-[#0891B2] text-white'
                : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <cat.Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No templates found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(t => (
            <TemplateCard key={t.id} template={t} onSelect={setSelectedTemplate} />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {selectedTemplate && (
        <TemplatePreview template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
      )}
    </div>
  )
}
