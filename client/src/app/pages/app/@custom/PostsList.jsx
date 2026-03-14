/**
 * @custom PostsList — List view of all posts with status filtering, search, and bulk actions
 * Brand: #0891B2 primary, #6366F1 accent, Inter + Space Grotesk fonts
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MoreHorizontal,
  Edit3,
  Trash2,
  Send,
  RefreshCw,
  Eye,
  ChevronDown,
  LayoutList,
  Grid3x3,
  ArrowUpDown,
} from 'lucide-react'
import { DashboardLayout } from '../../../components/@system/Dashboard/DashboardLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Constants ────────────────────────────────────────────────────
const STATUSES = ['all', 'draft', 'scheduled', 'published', 'failed']
const STATUS_CONFIG = {
  draft: { icon: FileText, label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  scheduled: { icon: Clock, label: 'Scheduled', bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-[#0891B2]' },
  published: { icon: CheckCircle, label: 'Published', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { icon: AlertCircle, label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'scheduled', label: 'Scheduled date' },
]

// ─── StatusBadge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────
function PostCard({ post, onEdit, onDelete, onPublish, onRetry, viewMode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const preview = post.content?.length > 160 ? post.content.slice(0, 160) + '…' : post.content
  const dateStr = post.scheduled_for
    ? new Date(post.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 truncate">{preview || 'Empty post'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{dateStr}</p>
        </div>
        <StatusBadge status={post.status} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <PostMenu
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
              onPublish={onPublish}
              onRetry={onRetry}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow group relative">
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={post.status} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <PostMenu
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
              onPublish={onPublish}
              onRetry={onRetry}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed line-clamp-4 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        {preview || 'Empty post'}
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {post.scheduled_for ? (
          <>
            <Clock className="w-3 h-3" />
            <span>{dateStr}</span>
          </>
        ) : (
          <>
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── PostMenu ─────────────────────────────────────────────────────
function PostMenu({ post, onEdit, onDelete, onPublish, onRetry, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-8 z-50 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
        <button
          onClick={() => { onClose(); onEdit(post); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
        {(post.status === 'draft' || post.status === 'scheduled') && (
          <button
            onClick={() => { onClose(); onPublish(post); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Send className="w-3.5 h-3.5" /> Publish Now
          </button>
        )}
        {post.status === 'failed' && (
          <button
            onClick={() => { onClose(); onRetry(post); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
        <hr className="my-1 border-slate-100" />
        <button
          onClick={() => { onClose(); onDelete(post); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────
function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Scheduled', value: stats.scheduled_count || 0, color: '#0891B2' },
        { label: 'Published', value: stats.published_count || 0, color: '#22c55e' },
        { label: 'Drafts', value: stats.draft_count || 0, color: '#94a3b8' },
        { label: 'Failed', value: stats.permanently_failed_count || 0, color: '#ef4444' },
      ].map((s) => (
        <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">{s.label}</p>
          <p className="text-xl font-bold mt-0.5" style={{ color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function PostsList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/posts?${params}`, { credentials: 'include' })
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (e) {
      console.error('Failed to fetch posts:', e)
    }
  }, [filter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/posts/queue/stats', { credentials: 'include' })
      const data = await res.json()
      setStats(data.stats || {})
    } catch (e) {
      console.error('Failed to fetch stats:', e)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchPosts(), fetchStats()]).finally(() => setLoading(false))
  }, [fetchPosts, fetchStats])

  const handleEdit = (post) => navigate(`/app/posts/new?id=${post.id}`)
  const handleDelete = async (post) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE', credentials: 'include' })
    fetchPosts()
    fetchStats()
  }
  const handlePublish = async (post) => {
    await fetch(`/api/posts/${post.id}/publish`, { method: 'POST', credentials: 'include' })
    fetchPosts()
    fetchStats()
  }
  const handleRetry = async (post) => {
    await fetch(`/api/posts/${post.id}/retry`, { method: 'POST', credentials: 'include' })
    fetchPosts()
    fetchStats()
  }

  // Client-side search + sort
  let filtered = posts
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter((p) => p.content?.toLowerCase().includes(q))
  }
  if (sort === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else if (sort === 'oldest') {
    filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sort === 'scheduled') {
    filtered = [...filtered].sort((a, b) => {
      const da = a.scheduled_for ? new Date(a.scheduled_for) : new Date('9999-12-31')
      const db = b.scheduled_for ? new Date(b.scheduled_for) : new Date('9999-12-31')
      return da - db
    })
  }

  return (
    <DashboardLayout>
      <DashboardLayout.Header
        title="Posts"
        description="Manage your LinkedIn content"
        actions={
          <button
            onClick={() => navigate('/app/posts/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#0891B2' }}
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        }
      />
      <DashboardLayout.Content>
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891B2]/30 focus:border-[#0891B2]"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                  filter === s
                    ? 'bg-[#0891B2] text-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort + View toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400')}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400')}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-2 border-[#0891B2] border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-700 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {search || filter !== 'all' ? 'No matching posts' : 'No posts yet'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {search || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first post to get started'}
            </p>
            {!search && filter === 'all' && (
              <button
                onClick={() => navigate('/app/posts/new')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#0891B2' }}
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                viewMode="list"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onRetry={handleRetry}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                viewMode="grid"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}
      </DashboardLayout.Content>
    </DashboardLayout>
  )
}
