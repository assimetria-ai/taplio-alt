import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  FileText, Clock, CheckCircle2, Send, Trash2, Edit3, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('app_jwt')
}

const STATUS_STYLES = {
  draft:      { bg: 'bg-gray-500/10',    text: 'text-gray-600 dark:text-gray-400',    dot: 'bg-gray-400',    Icon: FileText },
  scheduled:  { bg: 'bg-cyan-500/10',     text: 'text-cyan-600 dark:text-cyan-400',    dot: 'bg-cyan-400',    Icon: Clock },
  publishing: { bg: 'bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-400',   Icon: Send },
  published:  { bg: 'bg-emerald-500/10',  text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400', Icon: CheckCircle2 },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize', s.bg, s.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', s.dot)} aria-hidden="true" />
      {status}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    })
  } catch { return '—' }
}

function truncate(str, len = 120) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

const STATUS_FILTERS = [
  { value: '',          label: 'All' },
  { value: 'draft',     label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function PostsList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sort_by: 'created_at', order: 'desc' })
      if (search)       params.set('q', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/posts?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load posts.')
      const data = await res.json()
      setPosts(data.data || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Delete failed.')
      setPosts(prev => prev.filter(p => p.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePublish(id) {
    try {
      const res = await fetch(`/api/posts/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Publish failed.')
      }
      fetchPosts()
    } catch (e) {
      setError(e.message)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Posts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your LinkedIn posts. Create, schedule, and track performance.
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

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>
          <button
            onClick={() => fetchPosts()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'border-[#0891B2] bg-[#0891B2]/5 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {!error && pagination.total > 0 && (
        <p className="text-xs text-muted-foreground">
          {pagination.total} post{pagination.total !== 1 ? 's' : ''} · Page {pagination.page} of {pagination.totalPages}
        </p>
      )}

      {/* Posts list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {error ? (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : loading && posts.length === 0 ? (
          <div className="space-y-px p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">No posts yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Create your first LinkedIn post to get started.
            </p>
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
        ) : (
          <ul className="divide-y divide-border" role="list">
            {posts.map(post => (
              <li
                key={post.id}
                className="group flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}/edit`)}
              >
                {/* Content preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {truncate(post.content, 160)}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <StatusBadge status={post.status} />
                    {post.scheduled_for && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatDate(post.scheduled_for)}
                      </span>
                    )}
                    {post.published_at && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Published {formatDate(post.published_at)}
                      </span>
                    )}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {(Array.isArray(post.hashtags) ? post.hashtags : []).slice(0, 3).map(h => `#${h}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                  {(post.status === 'draft' || post.status === 'scheduled') && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#0891B2]/10 hover:text-[#0891B2] transition-colors"
                      title="Publish now"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
