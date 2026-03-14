/**
 * @custom ProjectBoardPage — Monday.com-style project board
 * Table-row board with colored group headers, status columns,
 * assignee avatars, due dates, priority tags. Kanban and table views.
 */
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  GripVertical,
  Calendar,
  User,
  Clock,
} from 'lucide-react'

const BRAND = '#5E6AD2'

const STATUS_CONFIG = {
  'To Do': { color: '#C4C4C4', bg: '#F5F5F5' },
  'In Progress': { color: '#FDAB3D', bg: '#FFF8ED' },
  'Review': { color: '#A25DDC', bg: '#F5EDFF' },
  'Stuck': { color: '#DF2F4A', bg: '#FFEDED' },
  'Done': { color: '#00C875', bg: '#EDFFEE' },
}

const PRIORITY_CONFIG = {
  critical: { color: '#DF2F4A', label: 'Critical' },
  high: { color: '#FDAB3D', label: 'High' },
  medium: { color: '#5E6AD2', label: 'Medium' },
  low: { color: '#C4C4C4', label: 'Low' },
}

const GROUPS = [
  {
    name: 'Sprint 12 — Core Features',
    color: '#5E6AD2',
    tasks: [
      { id: 1, title: 'User authentication flow', status: 'Done', priority: 'high', assignee: 'SK', due: 'Mar 10' },
      { id: 2, title: 'Dashboard KPI cards', status: 'In Progress', priority: 'high', assignee: 'MR', due: 'Mar 14' },
      { id: 3, title: 'Project board view', status: 'In Progress', priority: 'critical', assignee: 'AT', due: 'Mar 15' },
      { id: 4, title: 'Task CRUD operations', status: 'To Do', priority: 'high', assignee: 'YO', due: 'Mar 16' },
    ],
  },
  {
    name: 'Sprint 12 — Polish',
    color: '#00C875',
    tasks: [
      { id: 5, title: 'Mobile responsive layout', status: 'To Do', priority: 'medium', assignee: 'LM', due: 'Mar 18' },
      { id: 6, title: 'Dark mode support', status: 'To Do', priority: 'low', assignee: 'SK', due: 'Mar 20' },
      { id: 7, title: 'Keyboard shortcuts', status: 'Stuck', priority: 'medium', assignee: 'MR', due: 'Mar 17' },
    ],
  },
  {
    name: 'Backlog',
    color: '#FDAB3D',
    tasks: [
      { id: 8, title: 'Gantt chart view', status: 'To Do', priority: 'low', assignee: null, due: null },
      { id: 9, title: 'Automations engine', status: 'To Do', priority: 'medium', assignee: null, due: null },
      { id: 10, title: 'Time tracking', status: 'To Do', priority: 'low', assignee: null, due: null },
    ],
  },
]

// Kanban columns
const KANBAN_COLS = ['To Do', 'In Progress', 'Review', 'Stuck', 'Done']

function StatusCell({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['To Do']
  return (
    <div style={{
      background: cfg.color, color: '#fff',
      padding: '6px 0', borderRadius: 4,
      fontSize: 12, fontWeight: 600, textAlign: 'center',
      minWidth: 100,
    }}>
      {status}
    </div>
  )
}

function PriorityCell({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <div style={{
      background: cfg.color, color: '#fff',
      padding: '6px 0', borderRadius: 4,
      fontSize: 12, fontWeight: 600, textAlign: 'center',
      minWidth: 80,
    }}>
      {cfg.label}
    </div>
  )
}

function AvatarSmall({ initials }) {
  if (!initials) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8E8E8' }} />
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: BRAND + '20', color: BRAND,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700,
    }}>{initials}</div>
  )
}

function GroupHeader({ name, color, count, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: color,
        color: '#fff', cursor: 'pointer',
        borderRadius: expanded ? '8px 8px 0 0' : 8,
        fontWeight: 700, fontSize: 14,
      }}
    >
      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      {name}
      <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.8 }}>({count} tasks)</span>
    </div>
  )
}

// Kanban card
function KanbanCard({ task }) {
  const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 14,
      border: '1px solid #E8E8E8', marginBottom: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>{task.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: pCfg.color,
        }} title={pCfg.label} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.due && <span style={{ fontSize: 11, color: '#888' }}>{task.due}</span>}
          <AvatarSmall initials={task.assignee} />
        </div>
      </div>
    </div>
  )
}

export function ProjectBoardPage() {
  const { id } = useParams()
  const [view, setView] = useState('table') // table | kanban
  const [expandedGroups, setExpandedGroups] = useState(GROUPS.map((_, i) => i))
  const [searchQuery, setSearchQuery] = useState('')

  const allTasks = useMemo(() => {
    let tasks = GROUPS.flatMap(g => g.tasks)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q))
    }
    return tasks
  }, [searchQuery])

  const toggleGroup = (idx) => {
    setExpandedGroups(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
          {id ? `Project #${id}` : 'All Projects'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#F5F5F5', borderRadius: 8, padding: '6px 12px',
          }}>
            <Search size={14} color="#888" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: 120 }}
            />
          </div>
          {/* View Toggle */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
            <button
              onClick={() => setView('table')}
              style={{
                padding: '6px 12px', border: 'none', cursor: 'pointer',
                background: view === 'table' ? BRAND : '#fff',
                color: view === 'table' ? '#fff' : '#888',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
              }}
            ><List size={14} /> Table</button>
            <button
              onClick={() => setView('kanban')}
              style={{
                padding: '6px 12px', border: 'none', cursor: 'pointer',
                background: view === 'kanban' ? BRAND : '#fff',
                color: view === 'kanban' ? '#fff' : '#888',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
              }}
            ><LayoutGrid size={14} /> Kanban</button>
          </div>
          {/* New Task */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: BRAND, color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {GROUPS.map((group, gIdx) => (
            <div key={gIdx}>
              <GroupHeader
                name={group.name}
                color={group.color}
                count={group.tasks.length}
                expanded={expandedGroups.includes(gIdx)}
                onToggle={() => toggleGroup(gIdx)}
              />
              {expandedGroups.includes(gIdx) && (
                <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8E8E8' }}>
                        <th style={{ width: 28 }} />
                        {['Task', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
                          <th key={h} style={{
                            padding: '8px 12px', textAlign: 'left',
                            fontSize: 11, fontWeight: 600, color: '#888',
                            textTransform: 'uppercase', letterSpacing: 0.5,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.tasks.map(task => (
                        <tr key={task.id} style={{ borderBottom: '1px solid #F0F0F0' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '8px 4px 8px 12px', color: '#CCC' }}><GripVertical size={14} /></td>
                          <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{task.title}</td>
                          <td style={{ padding: '10px 12px' }}><StatusCell status={task.status} /></td>
                          <td style={{ padding: '10px 12px' }}><PriorityCell priority={task.priority} /></td>
                          <td style={{ padding: '10px 12px' }}><AvatarSmall initials={task.assignee} /></td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: '#666' }}>{task.due || '—'}</td>
                        </tr>
                      ))}
                      {/* Add row */}
                      <tr>
                        <td colSpan={6} style={{ padding: '8px 12px' }}>
                          <button style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', color: '#AAA',
                            fontSize: 13, cursor: 'pointer', padding: '4px 0',
                          }}>
                            <Plus size={14} /> Add task
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div style={{
          display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16,
        }}>
          {KANBAN_COLS.map(col => {
            const cfg = STATUS_CONFIG[col]
            const colTasks = allTasks.filter(t => t.status === col)
            return (
              <div key={col} style={{ minWidth: 260, flex: '1 0 260px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', marginBottom: 8,
                  borderRadius: 8, background: cfg.bg,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{col}</span>
                  <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{colTasks.length}</span>
                </div>
                {colTasks.map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                  padding: '10px 14px', background: '#FAFAFA', border: '1px dashed #DDD',
                  borderRadius: 8, color: '#AAA', fontSize: 13, cursor: 'pointer',
                }}>
                  <Plus size={14} /> Add task
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectBoardPage
