import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Plus, AlertCircle, Loader2,
  FileText, Clock, CheckCircle2, CalendarDays
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('app_jwt')
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_DOT = {
  draft:      'bg-gray-400',
  scheduled:  'bg-cyan-400',
  publishing: 'bg-amber-400',
  published:  'bg-emerald-400',
}

const STATUS_BG = {
  draft:      'bg-gray-500/10 hover:bg-gray-500/20',
  scheduled:  'bg-cyan-500/10 hover:bg-cyan-500/20',
  publishing: 'bg-amber-500/10 hover:bg-amber-500/20',
  published:  'bg-emerald-500/10 hover:bg-emerald-500/20',
}

function truncate(str, len = 50) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch { return '' }
}

// Calendar math helpers
function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

function isToday(year, month, day) {
  return isSameDay(new Date(year, month, day), new Date())
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ContentCalendar() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all posts for the visible month range (generous: get 200)
      const res = await fetch(`/api/posts?limit=200&sort_by=scheduled_for&order=asc`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load posts.')
      const data = await res.json()
      setPosts(data.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Group posts by date
  const postsByDate = useMemo(() => {
    const map = {}
    posts.forEach(post => {
      // Use scheduled_for for scheduled posts, created_at for drafts, published_at for published
      const dateStr = post.scheduled_for || post.published_at || post.created_at
      if (!dateStr) return
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(post)
    })
    return map
  }, [posts])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const totalDays = getMonthDays(year, month)
  const startOffset = getFirstDayOfWeek(year, month)
  const prevMonthDays = getMonthDays(year, month === 0 ? 11 : month - 1)
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Content Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Visual overview of your scheduled and published posts.
          </p>
        </div>
        <button
          onClick={() => navigate('/posts/new')}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#0891B2' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0e7490'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0891B2'}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Post
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Today
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-400" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" /> Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Published
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map(day => (
            <div key={day} className="px-2 py-2.5 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startOffset + 1
              const isCurrentMonth = dayNum >= 1 && dayNum <= totalDays
              const displayDay = isCurrentMonth
                ? dayNum
                : dayNum < 1
                  ? prevMonthDays + dayNum
                  : dayNum - totalDays

              const key = isCurrentMonth ? `${year}-${month}-${dayNum}` : null
              const dayPosts = key ? (postsByDate[key] || []) : []
              const today = isCurrentMonth && isToday(year, month, dayNum)

              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
                    !isCurrentMonth && 'bg-muted/30',
                    today && 'bg-[#0891B2]/5',
                    isCurrentMonth && 'hover:bg-accent/20 cursor-pointer'
                  )}
                  onClick={() => isCurrentMonth && navigate(`/posts/new`)}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'text-xs font-medium',
                      !isCurrentMonth && 'text-muted-foreground/50',
                      isCurrentMonth && !today && 'text-foreground',
                      today && 'text-white rounded-full w-6 h-6 flex items-center justify-center text-[11px]'
                    )} style={today ? { backgroundColor: '#0891B2' } : undefined}>
                      {displayDay}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{dayPosts.length}</span>
                    )}
                  </div>

                  {/* Post chips */}
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map(post => (
                      <button
                        key={post.id}
                        onClick={e => {
                          e.stopPropagation()
                          navigate(`/posts/${post.id}/edit`)
                        }}
                        className={cn(
                          'flex items-center gap-1 w-full rounded px-1.5 py-0.5 text-left transition-colors',
                          STATUS_BG[post.status] || STATUS_BG.draft
                        )}
                        title={post.content}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[post.status] || STATUS_DOT.draft)} />
                        <span className="text-[10px] text-foreground truncate leading-tight">
                          {formatTime(post.scheduled_for || post.published_at || post.created_at)}{' '}
                          {truncate(post.content, 25)}
                        </span>
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[10px] text-muted-foreground px-1.5">
                        +{dayPosts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
