/**
 * @custom SearchFiltersPage — Global search across tasks and projects
 * Filter by status, assignee, priority, due date. Save and recall filters.
 * Planora brand color #5E6AD2.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Bookmark,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESULTS = [
  { id: 1,  type: 'task',    title: 'Design new onboarding flow',          project: 'Website Redesign',    status: 'In Progress', priority: 'High',   assignee: 'Alice Chen',    dueDate: '2026-03-20' },
  { id: 2,  type: 'task',    title: 'Implement authentication module',     project: 'Backend API',         status: 'To Do',       priority: 'High',   assignee: 'Bob Martinez',  dueDate: '2026-03-18' },
  { id: 3,  type: 'task',    title: 'Write unit tests for payment flow',   project: 'Backend API',         status: 'Review',      priority: 'Medium', assignee: 'Carol White',   dueDate: '2026-03-22' },
  { id: 4,  type: 'task',    title: 'Update landing page copy',            project: 'Marketing Q1',        status: 'Done',        priority: 'Low',    assignee: 'Alice Chen',    dueDate: '2026-03-10' },
  { id: 5,  type: 'task',    title: 'Fix mobile nav overflow bug',         project: 'Website Redesign',    status: 'In Progress', priority: 'High',   assignee: 'David Kim',     dueDate: '2026-03-15' },
  { id: 6,  type: 'task',    title: 'Set up CI/CD pipeline',              project: 'DevOps',              status: 'Stuck',       priority: 'High',   assignee: 'Bob Martinez',  dueDate: '2026-03-12' },
  { id: 7,  type: 'task',    title: 'Create email templates',             project: 'Marketing Q1',        status: 'To Do',       priority: 'Medium', assignee: 'Eve Johnson',   dueDate: '2026-03-28' },
  { id: 8,  type: 'task',    title: 'Performance audit & optimization',   project: 'Backend API',         status: 'To Do',       priority: 'Medium', assignee: 'Carol White',   dueDate: '2026-04-01' },
  { id: 9,  type: 'project', title: 'Website Redesign',                   project: null,                  status: 'In Progress', priority: 'High',   assignee: 'Alice Chen',    dueDate: '2026-04-15' },
  { id: 10, type: 'project', title: 'Backend API',                        project: null,                  status: 'In Progress', priority: 'High',   assignee: 'Bob Martinez',  dueDate: '2026-05-01' },
  { id: 11, type: 'project', title: 'Marketing Q1',                       project: null,                  status: 'Done',        priority: 'Medium', assignee: 'Eve Johnson',   dueDate: '2026-03-31' },
  { id: 12, type: 'task',    title: 'Integrate Stripe webhooks',          project: 'Backend API',         status: 'In Progress', priority: 'High',   assignee: 'David Kim',     dueDate: '2026-03-25' },
  { id: 13, type: 'task',    title: 'Accessibility review pass',          project: 'Website Redesign',    status: 'To Do',       priority: 'Low',    assignee: 'Carol White',   dueDate: '2026-04-05' },
  { id: 14, type: 'task',    title: 'Migrate legacy database tables',     project: 'DevOps',              status: 'Review',      priority: 'High',   assignee: 'Bob Martinez',  dueDate: '2026-03-19' },
]

const STATUSES   = ['To Do', 'In Progress', 'Review', 'Stuck', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High']
const ASSIGNEES  = [...new Set(MOCK_RESULTS.map(r => r.assignee))].sort()

const SAVED_FILTERS_DEFAULT = [
  { id: 'sf1', name: 'My high-priority tasks',    filters: { assignee: 'Alice Chen', priority: 'High', status: '', dueAfter: '', dueBefore: '' } },
  { id: 'sf2', name: 'Overdue & stuck items',     filters: { assignee: '', priority: '', status: 'Stuck', dueAfter: '', dueBefore: '2026-03-14' } },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  'To Do':       { color: '#6B7280', bg: '#F3F4F6', icon: Circle },
  'In Progress': { color: '#5E6AD2', bg: '#EEF0FB', icon: Clock },
  'Review':      { color: '#D97706', bg: '#FEF3C7', icon: AlertCircle },
  'Stuck':       { color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle },
  'Done':        { color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
}

const PRIORITY_META = {
  'Low':    { color: '#6B7280' },
  'Medium': { color: '#D97706' },
  'High':   { color: '#DC2626' },
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { color: '#6B7280', bg: '#F3F4F6', icon: Circle }
  const Icon = meta.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: meta.bg, color: meta.color,
      borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      <Icon size={10} />
      {status}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || { color: '#6B7280' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: meta.color, fontWeight: 600 }}>
      <Flag size={10} />
      {priority}
    </span>
  )
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          border: value ? '1.5px solid #5E6AD2' : '1px solid #E5E7EB',
          background: value ? '#EEF0FB' : '#fff',
          color: value ? '#5E6AD2' : '#374151',
          fontSize: 13, fontWeight: 500,
        }}
      >
        {label}{value ? `: ${value}` : ''}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 100,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, overflow: 'hidden',
        }}>
          <div
            onClick={() => { onChange(''); setOpen(false) }}
            style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: '#6B7280' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            Any {label}
          </div>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                background: value === opt ? '#EEF0FB' : '',
                color: value === opt ? '#5E6AD2' : '#111827',
                fontWeight: value === opt ? 600 : 400,
              }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = '#F9FAFB' }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = '' }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({ item }) {
  const isProject = item.type === 'project'
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
      alignItems: 'center', gap: 16,
      padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
      cursor: 'pointer', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: isProject ? '#5E6AD2' : '#9CA3AF',
            background: isProject ? '#EEF0FB' : '#F3F4F6',
            padding: '1px 6px', borderRadius: 4,
          }}>
            {isProject ? 'Project' : 'Task'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.title}</span>
        </div>
        {item.project && (
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 46 }}>{item.project}</span>
        )}
      </div>
      <StatusPill status={item.status} />
      <PriorityBadge priority={item.priority} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
        <User size={11} />
        {item.assignee.split(' ')[0]}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
        <Calendar size={11} />
        {item.dueDate}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SearchFiltersPage() {
  const [query, setQuery]       = useState('')
  const [filterStatus, setFilterStatus]     = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [dueAfter, setDueAfter]   = useState('')
  const [dueBefore, setDueBefore] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all | task | project
  const [savedFilters, setSavedFilters] = useState(SAVED_FILTERS_DEFAULT)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')

  const hasActiveFilters = filterStatus || filterAssignee || filterPriority || dueAfter || dueBefore || typeFilter !== 'all'

  const clearFilters = useCallback(() => {
    setFilterStatus('')
    setFilterAssignee('')
    setFilterPriority('')
    setDueAfter('')
    setDueBefore('')
    setTypeFilter('all')
  }, [])

  const applyFilter = useCallback((saved) => {
    setFilterStatus(saved.filters.status)
    setFilterAssignee(saved.filters.assignee)
    setFilterPriority(saved.filters.priority)
    setDueAfter(saved.filters.dueAfter)
    setDueBefore(saved.filters.dueBefore)
  }, [])

  const deleteSavedFilter = useCallback((id) => {
    setSavedFilters(f => f.filter(sf => sf.id !== id))
  }, [])

  const saveCurrentFilter = useCallback(() => {
    if (!saveName.trim()) return
    setSavedFilters(f => [
      ...f,
      {
        id: `sf${Date.now()}`,
        name: saveName.trim(),
        filters: { status: filterStatus, assignee: filterAssignee, priority: filterPriority, dueAfter, dueBefore },
      },
    ])
    setSaveName('')
    setSaveDialogOpen(false)
  }, [saveName, filterStatus, filterAssignee, filterPriority, dueAfter, dueBefore])

  const results = useMemo(() => {
    let items = MOCK_RESULTS
    if (query) {
      const q = query.toLowerCase()
      items = items.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.project || '').toLowerCase().includes(q) ||
        r.assignee.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'all') items = items.filter(r => r.type === typeFilter)
    if (filterStatus)   items = items.filter(r => r.status === filterStatus)
    if (filterAssignee) items = items.filter(r => r.assignee === filterAssignee)
    if (filterPriority) items = items.filter(r => r.priority === filterPriority)
    if (dueAfter)       items = items.filter(r => r.dueDate >= dueAfter)
    if (dueBefore)      items = items.filter(r => r.dueDate <= dueBefore)
    return items
  }, [query, typeFilter, filterStatus, filterAssignee, filterPriority, dueAfter, dueBefore])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
          Search & Filters
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Find tasks and projects across all your workspaces.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12,
        padding: '10px 16px', marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <Search size={18} color="#9CA3AF" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks, projects, assignees…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#111827', background: 'transparent' }}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <SlidersHorizontal size={14} color="#6B7280" />

        {/* Type toggle */}
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          {['all', 'task', 'project'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: 'none', textTransform: 'capitalize',
                background: typeFilter === t ? '#5E6AD2' : '#fff',
                color: typeFilter === t ? '#fff' : '#6B7280',
              }}
            >
              {t === 'all' ? 'All' : t === 'task' ? 'Tasks' : 'Projects'}
            </button>
          ))}
        </div>

        <FilterSelect label="Status"   value={filterStatus}   options={STATUSES}   onChange={setFilterStatus} />
        <FilterSelect label="Assignee" value={filterAssignee} options={ASSIGNEES}  onChange={setFilterAssignee} />
        <FilterSelect label="Priority" value={filterPriority} options={PRIORITIES} onChange={setFilterPriority} />

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="date"
            value={dueAfter}
            onChange={e => setDueAfter(e.target.value)}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 12,
              border: dueAfter ? '1.5px solid #5E6AD2' : '1px solid #E5E7EB',
              color: '#374151', cursor: 'pointer', background: dueAfter ? '#EEF0FB' : '#fff',
            }}
            title="Due after"
          />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>–</span>
          <input
            type="date"
            value={dueBefore}
            onChange={e => setDueBefore(e.target.value)}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 12,
              border: dueBefore ? '1.5px solid #5E6AD2' : '1px solid #E5E7EB',
              color: '#374151', cursor: 'pointer', background: dueBefore ? '#EEF0FB' : '#fff',
            }}
            title="Due before"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid #FECACA', background: '#FEF2F2',
              color: '#DC2626', fontSize: 12, fontWeight: 500,
            }}
          >
            <X size={11} /> Clear filters
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={() => setSaveDialogOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid #C7D2FE', background: '#EEF0FB',
              color: '#5E6AD2', fontSize: 12, fontWeight: 500,
            }}
          >
            <Bookmark size={11} /> Save filter
          </button>
        )}
      </div>

      {/* Save filter dialog */}
      {saveDialogOpen && (
        <div style={{
          background: '#fff', border: '1.5px solid #C7D2FE', borderRadius: 12,
          padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(94,106,210,0.12)',
        }}>
          <input
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Filter name…"
            onKeyDown={e => { if (e.key === 'Enter') saveCurrentFilter() }}
            style={{
              flex: 1, padding: '7px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              fontSize: 13, outline: 'none',
            }}
            autoFocus
          />
          <button
            onClick={saveCurrentFilter}
            style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              background: '#5E6AD2', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600,
            }}
          >
            Save
          </button>
          <button
            onClick={() => { setSaveDialogOpen(false); setSaveName('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: savedFilters.length ? '1fr 220px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Results */}
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, overflow: 'hidden' }}>
          {/* Results header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {results.filter(r => r.type === 'task').length} tasks · {results.filter(r => r.type === 'project').length} projects
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <Search size={32} color="#D1D5DB" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>No results match your search.</p>
            </div>
          ) : (
            results.map(item => <ResultRow key={item.id} item={item} />)
          )}
        </div>

        {/* Saved filters panel */}
        {savedFilters.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Saved Filters
              </span>
            </div>
            {savedFilters.map(sf => (
              <div
                key={sf.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <button
                  onClick={() => applyFilter(sf)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 13, color: '#374151', flex: 1, padding: 0,
                  }}
                >
                  <Filter size={11} style={{ marginRight: 6, color: '#5E6AD2', verticalAlign: 'middle' }} />
                  {sf.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(sf.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 2, display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFiltersPage
