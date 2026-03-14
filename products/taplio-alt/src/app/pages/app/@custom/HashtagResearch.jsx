import { useState, useMemo } from 'react'
import { Hash, Search, TrendingUp, TrendingDown, Minus, Copy, Check, BarChart3, Users } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

const MOCK_HASHTAGS = [
  { tag: '#LinkedInGrowth', posts: '234K', avgLikes: 142, avgComments: 28, trend: 'up', score: 92 },
  { tag: '#PersonalBranding', posts: '189K', avgLikes: 118, avgComments: 22, trend: 'up', score: 88 },
  { tag: '#ContentStrategy', posts: '156K', avgLikes: 97, avgComments: 19, trend: 'up', score: 85 },
  { tag: '#B2BMarketing', posts: '123K', avgLikes: 86, avgComments: 16, trend: 'stable', score: 78 },
  { tag: '#LinkedInTips', posts: '312K', avgLikes: 75, avgComments: 14, trend: 'down', score: 72 },
  { tag: '#SaaS', posts: '198K', avgLikes: 104, avgComments: 21, trend: 'up', score: 81 },
  { tag: '#StartupLife', posts: '267K', avgLikes: 63, avgComments: 11, trend: 'stable', score: 65 },
  { tag: '#Leadership', posts: '445K', avgLikes: 52, avgComments: 8, trend: 'down', score: 55 },
  { tag: '#AIMarketing', posts: '45K', avgLikes: 165, avgComments: 34, trend: 'up', score: 94 },
  { tag: '#GrowthHacking', posts: '178K', avgLikes: 71, avgComments: 13, trend: 'stable', score: 68 },
  { tag: '#RemoteWork', posts: '289K', avgLikes: 58, avgComments: 10, trend: 'down', score: 52 },
  { tag: '#Entrepreneurship', posts: '523K', avgLikes: 45, avgComments: 7, trend: 'stable', score: 48 },
]

const TREND_ICONS = {
  up: { Icon: TrendingUp, color: 'text-green-500' },
  down: { Icon: TrendingDown, color: 'text-red-500' },
  stable: { Icon: Minus, color: 'text-yellow-500' },
}

function ScoreBar({ score }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score}</span>
    </div>
  )
}

export default function HashtagResearch() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [sortBy, setSortBy] = useState('score')

  const filtered = useMemo(() => {
    let result = [...MOCK_HASHTAGS]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(h => h.tag.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'likes') return b.avgLikes - a.avgLikes
      if (sortBy === 'comments') return b.avgComments - a.avgComments
      return 0
    })
    return result
  }, [search, sortBy])

  const handleCopy = (tag) => {
    navigator.clipboard.writeText(tag)
    setCopied(tag)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleCopySelected = () => {
    const tags = [...selected].join(' ')
    navigator.clipboard.writeText(tags)
    setCopied('__all__')
    setTimeout(() => setCopied(''), 2000)
  }

  const toggleSelect = (tag) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hashtag Research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find the best performing hashtags for your LinkedIn posts. Select and copy groups of hashtags.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2.5" style={{ backgroundColor: '#0891B215' }}>
            <Hash className="h-5 w-5" style={{ color: '#0891B2' }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tracked Hashtags</p>
            <p className="text-xl font-bold text-foreground">{MOCK_HASHTAGS.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2.5" style={{ backgroundColor: '#10B98115' }}>
            <TrendingUp className="h-5 w-5" style={{ color: '#10B981' }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trending Up</p>
            <p className="text-xl font-bold text-foreground">{MOCK_HASHTAGS.filter(h => h.trend === 'up').length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2.5" style={{ backgroundColor: '#8B5CF615' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-xl font-bold text-foreground">
              {Math.round(MOCK_HASHTAGS.reduce((s, h) => s + h.score, 0) / MOCK_HASHTAGS.length)}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hashtags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'score', label: 'Score' },
            { key: 'likes', label: 'Likes' },
            { key: 'comments', label: 'Comments' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                sortBy === s.key ? 'bg-[#0891B2] text-white' : 'border border-border text-muted-foreground hover:bg-accent'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleCopySelected}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#0891B2' }}
          >
            {copied === '__all__' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy {selected.size} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Hashtag</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Posts</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Likes</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Comments</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trend</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => {
                const T = TREND_ICONS[h.trend]
                return (
                  <tr key={h.tag} className={cn('border-b border-border hover:bg-accent/30 transition-colors', selected.has(h.tag) && 'bg-[#0891B2]/5')}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(h.tag)}
                        onChange={() => toggleSelect(h.tag)}
                        className="h-4 w-4 rounded border-border text-[#0891B2] focus:ring-[#0891B2]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: '#0891B2' }}>{h.tag}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{h.posts}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{h.avgLikes}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{h.avgComments}</td>
                    <td className="px-4 py-3">
                      <T.Icon className={cn('h-4 w-4', T.color)} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={h.score} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleCopy(h.tag)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {copied === h.tag ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
