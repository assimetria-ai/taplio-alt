import { useState, useEffect, useCallback } from 'react'
import { Search, Download, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

// ── Action category colours ──────────────────────────────────────────────────

const ACTION_STYLES = {
  'user.':     { bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',    dot: 'bg-blue-400' },
  'post.':     { bg: 'bg-emerald-500/10',  text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
  'settings.': { bg: 'bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-400' },
  'team.':     { bg: 'bg-purple-500/10',   text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-400' },
  'file.':     { bg: 'bg-cyan-500/10',     text: 'text-cyan-600 dark:text-cyan-400',    dot: 'bg-cyan-400' },
}

function getActionStyle(action) {
  for (const [prefix, style] of Object.entries(ACTION_STYLES)) {
    if (action?.startsWith(prefix)) return style
  }
  return { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' }
}

function ActionBadge({ action }) {
  const s = getActionStyle(action)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', s.bg, s.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', s.dot)} aria-hidden="true" />
      {action}
    </span>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('app_jwt')
}

function formatDateTime(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

const ACTION_FILTERS = [
  { value: '',          label: 'All actions' },
  { value: 'user.',     label: 'User' },
  { value: 'post.',     label: 'Posts' },
  { value: 'settings.', label: 'Settings' },
  { value: 'team.',     label: 'Teams' },
  { value: 'file.',     label: 'Files' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function AuditLog() {
  const [entries, setEntries] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const fetchAudit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (search)       params.set('q', search)
      if (actionFilter) params.set('action', actionFilter)
      if (dateFrom)     params.set('from', dateFrom)
      if (dateTo)       params.set('to', dateTo)

      const res = await fetch(`/api/audit?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load audit log.')
      const data = await res.json()
      setEntries(data.data || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, actionFilter, dateFrom, dateTo, page])

  useEffect(() => { fetchAudit() }, [fetchAudit])

  // Reset to page 1 when filters change
  function applyFilters() {
    setPage(1)
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams()
      if (search)       params.set('q', search)
      if (actionFilter) params.set('action', actionFilter)
      if (dateFrom)     params.set('from', dateFrom)
      if (dateTo)       params.set('to', dateTo)

      const res = await fetch(`/api/audit/export?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Export failed.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    applyFilters()
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Activity Log</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track all user actions across the platform. Search, filter, and export.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Search + Export row */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search actions, resources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          <button
            onClick={() => fetchAudit()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden="true" />
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {ACTION_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setActionFilter(f.value); setPage(1) }}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  actionFilter === f.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="From date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="To date"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {!error && pagination.total > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {entries.length} of {pagination.total} entries · Page {pagination.page} of {pagination.totalPages}
        </p>
      )}

      {/* Entries */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {error ? (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : loading && entries.length === 0 ? (
          <div className="space-y-px p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <ClipboardList className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity found</p>
            <p className="text-xs text-muted-foreground mt-1">
              User actions will appear here as they happen.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="sm:hidden divide-y divide-border" role="list">
              {entries.map(entry => (
                <li key={entry.id} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <ActionBadge action={entry.action} />
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground">
                    {entry.user_name || entry.user_email || `User #${entry.user_id}`}
                  </p>
                  {entry.resource_type && (
                    <p className="text-xs text-muted-foreground">
                      {entry.resource_type}{entry.resource_id ? ` #${entry.resource_id}` : ''}
                    </p>
                  )}
                  {entry.meta && Object.keys(entry.meta).length > 0 && (
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {JSON.stringify(entry.meta)}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Resource</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">IP</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap font-mono">
                        {formatDateTime(entry.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-foreground whitespace-nowrap">
                        {entry.user_name || entry.user_email || (entry.user_id ? `#${entry.user_id}` : 'System')}
                      </td>
                      <td className="px-4 py-2.5">
                        <ActionBadge action={entry.action} />
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {entry.resource_type ? `${entry.resource_type}${entry.resource_id ? ` #${entry.resource_id}` : ''}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono">
                        {entry.ip || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">
                        {entry.meta && Object.keys(entry.meta).length > 0
                          ? JSON.stringify(entry.meta)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
