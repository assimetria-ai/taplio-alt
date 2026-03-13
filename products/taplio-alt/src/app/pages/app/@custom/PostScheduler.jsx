import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Clock, Send, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'
// LinkedInPostPreview lives in @custom/components outside src/
// Use a simple inline preview fallback until the import path is resolved
function LinkedInPostPreview({ content }) {
  return (
    <div className="space-y-3">
      {/* Mock LinkedIn header */}
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0891B2] to-[#6366F1]" />
        <div>
          <p className="text-sm font-semibold text-foreground">Your Name</p>
          <p className="text-[11px] text-muted-foreground">Just now · <span className="inline-block">🌐</span></p>
        </div>
      </div>
      {/* Content */}
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
        {content}
      </p>
      {/* Mock engagement bar */}
      <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>🔄 Repost</span>
        <span>📤 Send</span>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('app_jwt')
}

function toLocalDatetime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return '' }
}

function toISO(localDatetime) {
  if (!localDatetime) return null
  try {
    return new Date(localDatetime).toISOString()
  } catch { return null }
}

const MAX_CONTENT_LENGTH = 3000

// ── Component ────────────────────────────────────────────────────────────────

export default function PostScheduler() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [content, setContent] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [status, setStatus] = useState('draft')
  const [hashtags, setHashtags] = useState('')
  const [mentions, setMentions] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [savedStatus, setSavedStatus] = useState(null)

  // Load existing post when editing
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/posts/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Post not found.')
        return r.json()
      })
      .then(data => {
        const post = data.data
        setContent(post.content || '')
        setScheduledFor(toLocalDatetime(post.scheduled_for))
        setStatus(post.status || 'draft')
        const tags = post.hashtags
        setHashtags(Array.isArray(tags) ? tags.join(', ') : (tags || ''))
        const ments = post.mentions
        setMentions(Array.isArray(ments) ? ments.join(', ') : (ments || ''))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const isReadOnly = status === 'published' || status === 'publishing'

  async function handleSave(saveStatus = 'draft') {
    setError(null)
    setSaving(true)
    setSavedStatus(null)

    const effectiveStatus = saveStatus === 'scheduled' && !scheduledFor ? 'draft' : saveStatus

    const body = {
      content: content.trim(),
      status: effectiveStatus,
      scheduled_for: effectiveStatus === 'scheduled' ? toISO(scheduledFor) : null,
      hashtags: hashtags ? hashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean) : [],
      mentions: mentions ? mentions.split(',').map(m => m.trim().replace(/^@/, '')).filter(Boolean) : [],
    }

    try {
      const url = isEditing ? `/api/posts/${id}` : '/api/posts'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Save failed.')
      }

      const data = await res.json()
      setSavedStatus('Saved')
      setStatus(data.data.status)

      // If new post, redirect to edit mode
      if (!isEditing && data.data.id) {
        navigate(`/posts/${data.data.id}/edit`, { replace: true })
      }

      setTimeout(() => setSavedStatus(null), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!id) {
      setError('Save the post first before publishing.')
      return
    }
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch(`/api/posts/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Publish failed.')
      }
      setStatus('published')
      setSavedStatus('Published')
      setTimeout(() => setSavedStatus(null), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/posts')}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Back to posts"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            {isReadOnly && (
              <p className="text-xs text-muted-foreground mt-0.5">This post is {status} and cannot be edited.</p>
            )}
          </div>
        </div>

        {/* Save indicator */}
        {savedStatus && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in-0">
            {savedStatus}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Editor */}
        <div className="space-y-5">
          {/* Content */}
          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-foreground mb-1.5">
              Post Content
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isReadOnly}
              placeholder="Write your LinkedIn post here..."
              rows={10}
              maxLength={MAX_CONTENT_LENGTH}
              className={cn(
                'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[200px]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'font-[Inter,sans-serif]'
              )}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">
                Supports line breaks and emojis
              </span>
              <span className={cn(
                'text-xs',
                content.length > MAX_CONTENT_LENGTH * 0.9 ? 'text-amber-500' : 'text-muted-foreground'
              )}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          {/* Schedule datetime */}
          <div>
            <label htmlFor="schedule-datetime" className="block text-sm font-medium text-foreground mb-1.5">
              <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" aria-hidden="true" />
              Schedule For
            </label>
            <input
              id="schedule-datetime"
              type="datetime-local"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              disabled={isReadOnly}
              className={cn(
                'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty to save as draft. Set a time to schedule.
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label htmlFor="post-hashtags" className="block text-sm font-medium text-foreground mb-1.5">
              Hashtags
            </label>
            <input
              id="post-hashtags"
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              disabled={isReadOnly}
              placeholder="linkedin, marketing, ai"
              className={cn(
                'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma-separated. # prefix optional.</p>
          </div>

          {/* Mentions */}
          <div>
            <label htmlFor="post-mentions" className="block text-sm font-medium text-foreground mb-1.5">
              Mentions
            </label>
            <input
              id="post-mentions"
              type="text"
              value={mentions}
              onChange={e => setMentions(e.target.value)}
              disabled={isReadOnly}
              placeholder="john-doe, jane-smith"
              className={cn(
                'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma-separated LinkedIn usernames.</p>
          </div>
        </div>

        {/* Sidebar — Preview + Actions */}
        <div className="space-y-5">
          {/* LinkedIn Preview */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Preview</h3>
            <div className="rounded-xl border border-border bg-card p-4">
              {content.trim() ? (
                <LinkedInPostPreview content={content} />
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Start typing to see a preview
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="space-y-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving || !content.trim()}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium',
                  'text-foreground hover:bg-accent transition-colors',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save as Draft
              </button>

              <button
                onClick={() => handleSave('scheduled')}
                disabled={saving || !content.trim() || !scheduledFor}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                style={{ backgroundColor: '#6366F1' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#4f46e5' }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6366F1'}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                Schedule
              </button>

              {isEditing && (
                <button
                  onClick={handlePublish}
                  disabled={publishing || !content.trim()}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  style={{ backgroundColor: '#0891B2' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0e7490' }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0891B2'}
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
