/**
 * @custom TaskManagementPage — Task CRUD with status, priority, subtasks
 * Create, edit, assign, set status (To Do/In Progress/Review/Stuck/Done),
 * due dates, priority levels, subtasks.
 */
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  X,
  Calendar,
  Tag,
  User,
  MessageSquare,
  Paperclip,
} from 'lucide-react'

const BRAND = '#5E6AD2'

const STATUSES = ['To Do', 'In Progress', 'Review', 'Stuck', 'Done']
const PRIORITIES = ['critical', 'high', 'medium', 'low']

const STATUS_COLORS = {
  'To Do': '#C4C4C4',
  'In Progress': '#FDAB3D',
  'Review': '#A25DDC',
  'Stuck': '#DF2F4A',
  'Done': '#00C875',
}

const PRIORITY_COLORS = {
  critical: '#DF2F4A',
  high: '#FDAB3D',
  medium: '#5E6AD2',
  low: '#C4C4C4',
}

const MOCK_TASKS = [
  {
    id: 1, title: 'Design system documentation', description: 'Document all design tokens, components, and patterns.',
    project: 'Design System', status: 'In Progress', priority: 'high',
    assignee: { name: 'Sarah K.', initials: 'SK' },
    dueDate: '2026-03-15', createdAt: '2026-03-08',
    subtasks: [
      { id: 's1', title: 'Token inventory', done: true },
      { id: 's2', title: 'Component catalog', done: true },
      { id: 's3', title: 'Usage guidelines', done: true },
      { id: 's4', title: 'Migration guide', done: false },
      { id: 's5', title: 'Code examples', done: false },
    ],
    tags: ['documentation', 'design'],
    comments: 3,
    attachments: 2,
  },
  {
    id: 2, title: 'API rate limiting implementation', description: 'Implement token bucket rate limiting on all API endpoints.',
    project: 'Backend v2', status: 'Review', priority: 'critical',
    assignee: { name: 'Mike R.', initials: 'MR' },
    dueDate: '2026-03-14', createdAt: '2026-03-05',
    subtasks: [
      { id: 's6', title: 'Design algorithm', done: true },
      { id: 's7', title: 'Implement middleware', done: true },
      { id: 's8', title: 'Add Redis cache', done: true },
      { id: 's9', title: 'Write tests', done: true },
      { id: 's10', title: 'Update docs', done: true },
      { id: 's11', title: 'Load testing', done: true },
      { id: 's12', title: 'Deploy to staging', done: true },
      { id: 's13', title: 'Prod rollout', done: false },
    ],
    tags: ['backend', 'security'],
    comments: 8,
    attachments: 1,
  },
  {
    id: 3, title: 'User onboarding flow redesign', description: 'Redesign the onboarding wizard for better conversion.',
    project: 'Growth', status: 'To Do', priority: 'medium',
    assignee: { name: 'You', initials: 'YO' },
    dueDate: '2026-03-18', createdAt: '2026-03-12',
    subtasks: [
      { id: 's14', title: 'User research', done: false },
      { id: 's15', title: 'Wireframes', done: false },
      { id: 's16', title: 'UI design', done: false },
      { id: 's17', title: 'Implementation', done: false },
    ],
    tags: ['ux', 'growth'],
    comments: 1,
    attachments: 0,
  },
  {
    id: 4, title: 'Fix mobile responsive issues', description: 'Address all responsive breakpoint issues reported in QA.',
    project: 'Mobile App', status: 'Stuck', priority: 'high',
    assignee: { name: 'You', initials: 'YO' },
    dueDate: '2026-03-13', createdAt: '2026-03-10',
    subtasks: [
      { id: 's18', title: 'Audit breakpoints', done: true },
      { id: 's19', title: 'Fix sidebar collapse', done: true },
      { id: 's20', title: 'Fix table overflow', done: false },
      { id: 's21', title: 'Fix modal sizing', done: false },
      { id: 's22', title: 'Test on devices', done: false },
      { id: 's23', title: 'Cross-browser test', done: false },
    ],
    tags: ['bug', 'mobile'],
    comments: 5,
    attachments: 3,
  },
]

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 6,
          background: STATUS_COLORS[value] || '#C4C4C4', color: '#fff',
          border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {value} <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: '#fff', border: '1px solid #E8E8E8', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden',
          minWidth: 140,
        }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', width: '100%',
                background: value === s ? '#F5F5F5' : 'transparent',
                border: 'none', fontSize: 13, cursor: 'pointer', color: '#1A1A2E',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskRow({ task }) {
  const [status, setStatus] = useState(task.status)
  const isOverdue = new Date(task.dueDate) < new Date() && status !== 'Done'
  const subtasksDone = task.subtasks.filter(s => s.done).length
  const subtasksTotal = task.subtasks.length
  const pct = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0

  return (
    <tr
      style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '12px 16px', width: 28 }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: status === 'Done' ? '#00C875' : '#CCC',
        }}>
          {status === 'Done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
      </td>
      <td style={{ padding: '12px 16px', minWidth: 240 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>{task.title}</div>
        <div style={{ fontSize: 11, color: '#AAA' }}>{task.project}</div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <StatusDropdown value={status} onChange={setStatus} />
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: PRIORITY_COLORS[task.priority] + '15',
          color: PRIORITY_COLORS[task.priority],
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[task.priority] }} />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: BRAND + '20', color: BRAND,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
          }}>{task.assignee.initials}</div>
          <span style={{ fontSize: 12, color: '#666' }}>{task.assignee.name}</span>
        </div>
      </td>
      <td style={{
        padding: '12px 16px', fontSize: 13,
        color: isOverdue ? '#DF2F4A' : '#666',
        fontWeight: isOverdue ? 600 : 400,
      }}>
        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 50, height: 4, borderRadius: 2, background: '#E8E8E8', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: pct === 100 ? '#00C875' : BRAND }} />
          </div>
          <span style={{ fontSize: 11, color: '#888' }}>{subtasksDone}/{subtasksTotal}</span>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#AAA' }}>
          {task.comments > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}><MessageSquare size={12} />{task.comments}</span>}
          {task.attachments > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}><Paperclip size={12} />{task.attachments}</span>}
        </div>
      </td>
    </tr>
  )
}

export function TaskManagementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredTasks = useMemo(() => {
    let tasks = MOCK_TASKS
    if (statusFilter !== 'all') tasks = tasks.filter(t => t.status === statusFilter)
    if (priorityFilter !== 'all') tasks = tasks.filter(t => t.priority === priorityFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q))
    }
    return tasks
  }, [searchQuery, statusFilter, priorityFilter])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
          {id ? `Task #${id}` : 'Tasks'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#F5F5F5', borderRadius: 8, padding: '6px 12px',
          }}>
            <Search size={14} color="#888" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: 150 }}
            />
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 8, border: '1px solid #E8E8E8',
              fontSize: 13, color: '#666', background: '#fff', cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 8, border: '1px solid #E8E8E8',
              fontSize: 13, color: '#666', background: '#fff', cursor: 'pointer',
            }}
          >
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
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

      {/* Task Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map(s => {
          const count = MOCK_TASKS.filter(t => t.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                border: statusFilter === s ? `2px solid ${STATUS_COLORS[s]}` : '1px solid #E8E8E8',
                background: statusFilter === s ? STATUS_COLORS[s] + '15' : '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', color: STATUS_COLORS[s],
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[s] }} />
              {s} ({count})
            </button>
          )
        })}
      </div>

      {/* Tasks Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8E8', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E8E8' }}>
                <th style={{ width: 28 }} />
                {['Task', 'Status', 'Priority', 'Assignee', 'Due', 'Subtasks', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: '#888',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#888', fontSize: 14 }}>
                    No tasks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TaskManagementPage
