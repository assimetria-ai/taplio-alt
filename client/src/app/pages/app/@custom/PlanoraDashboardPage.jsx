/**
 * @custom PlanoraDashboardPage — Planora project management dashboard
 * KPI cards (active projects, tasks due, team members, completion rate),
 * recent activity feed, my tasks list with status pills and priority badges.
 * Monday.com-inspired design with Planora brand color #5E6AD2.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  ListTodo,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Activity,
  Bell,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../../store/@system/auth'

// ─── Brand Constants ───────────────────────────────────────────
const BRAND = '#5E6AD2'
const BRAND_LIGHT = '#E8EAFF'

// ─── Status Config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  'To Do': { color: '#C4C4C4', bg: '#F5F5F5', label: 'To Do' },
  'In Progress': { color: '#FDAB3D', bg: '#FFF8ED', label: 'In Progress' },
  'Review': { color: '#A25DDC', bg: '#F5EDFF', label: 'Review' },
  'Stuck': { color: '#DF2F4A', bg: '#FFEDED', label: 'Stuck' },
  'Done': { color: '#00C875', bg: '#EDFFEE', label: 'Done' },
}

const PRIORITY_CONFIG = {
  critical: { color: '#DF2F4A', bg: '#FFEDED', label: 'Critical', icon: '🔴' },
  high: { color: '#FDAB3D', bg: '#FFF8ED', label: 'High', icon: '🟠' },
  medium: { color: '#5E6AD2', bg: '#E8EAFF', label: 'Medium', icon: '🔵' },
  low: { color: '#C4C4C4', bg: '#F5F5F5', label: 'Low', icon: '⚪' },
}

// ─── Mock Data ─────────────────────────────────────────────────
const MOCK_TASKS = [
  { id: 1, title: 'Design system documentation', project: 'Design System', status: 'In Progress', priority: 'high', assignee: 'Sarah K.', avatar: 'SK', dueDate: '2026-03-15', subtasks: { done: 3, total: 5 } },
  { id: 2, title: 'API rate limiting implementation', project: 'Backend v2', status: 'Review', priority: 'critical', assignee: 'Mike R.', avatar: 'MR', dueDate: '2026-03-14', subtasks: { done: 7, total: 8 } },
  { id: 3, title: 'User onboarding flow redesign', project: 'Growth', status: 'To Do', priority: 'medium', assignee: 'You', avatar: 'YO', dueDate: '2026-03-18', subtasks: { done: 0, total: 4 } },
  { id: 4, title: 'Fix mobile responsive issues', project: 'Mobile App', status: 'Stuck', priority: 'high', assignee: 'You', avatar: 'YO', dueDate: '2026-03-13', subtasks: { done: 2, total: 6 } },
  { id: 5, title: 'Stripe webhook integration', project: 'Backend v2', status: 'In Progress', priority: 'medium', assignee: 'Alex T.', avatar: 'AT', dueDate: '2026-03-16', subtasks: { done: 4, total: 6 } },
  { id: 6, title: 'Landing page A/B test setup', project: 'Growth', status: 'Done', priority: 'low', assignee: 'You', avatar: 'YO', dueDate: '2026-03-12', subtasks: { done: 3, total: 3 } },
  { id: 7, title: 'Database migration script', project: 'Backend v2', status: 'To Do', priority: 'high', assignee: 'You', avatar: 'YO', dueDate: '2026-03-17', subtasks: { done: 0, total: 3 } },
  { id: 8, title: 'Component library audit', project: 'Design System', status: 'In Progress', priority: 'low', assignee: 'Lisa M.', avatar: 'LM', dueDate: '2026-03-20', subtasks: { done: 5, total: 12 } },
]

const MOCK_ACTIVITY = [
  { id: 1, user: 'Sarah K.', avatar: 'SK', action: 'completed', target: 'Design tokens spec', project: 'Design System', time: '5 min ago', icon: CheckCircle2 },
  { id: 2, user: 'Mike R.', avatar: 'MR', action: 'moved to Review', target: 'API rate limiting', project: 'Backend v2', time: '15 min ago', icon: ArrowUpRight },
  { id: 3, user: 'You', avatar: 'YO', action: 'created', target: 'User onboarding flow', project: 'Growth', time: '1h ago', icon: Plus },
  { id: 4, user: 'Alex T.', avatar: 'AT', action: 'commented on', target: 'Stripe webhooks', project: 'Backend v2', time: '2h ago', icon: Activity },
  { id: 5, user: 'Lisa M.', avatar: 'LM', action: 'marked Stuck', target: 'Mobile responsive issues', project: 'Mobile App', time: '3h ago', icon: AlertTriangle },
  { id: 6, user: 'You', avatar: 'YO', action: 'completed', target: 'Landing page A/B test', project: 'Growth', time: '5h ago', icon: CheckCircle2 },
]

const MOCK_PROJECTS = [
  { name: 'Design System', color: '#A25DDC', tasks: 12, done: 5, members: 3 },
  { name: 'Backend v2', color: '#00C875', tasks: 24, done: 14, members: 5 },
  { name: 'Growth', color: '#FDAB3D', tasks: 8, done: 3, members: 2 },
  { name: 'Mobile App', color: '#DF2F4A', tasks: 16, done: 9, members: 4 },
]

// ─── Sub-components ────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, change, changeType, suffix }) {
  const isPositive = changeType === 'up'
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      border: '1px solid #E8E8E8',
      flex: '1 1 0',
      minWidth: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={BRAND} />
        </div>
        {change != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: isPositive ? '#00C875' : '#DF2F4A',
            fontSize: 13, fontWeight: 600,
          }}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1 }}>
        {value}{suffix && <span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['To Do']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function AvatarCircle({ initials, size = 28, color = BRAND }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '20', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function SubtaskProgress({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 60, height: 4, borderRadius: 2, background: '#E8E8E8', overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: pct === 100 ? '#00C875' : BRAND, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{done}/{total}</span>
    </div>
  )
}

function ProjectBar({ project }) {
  const pct = project.tasks > 0 ? (project.done / project.tasks) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{ width: 4, height: 32, borderRadius: 2, background: project.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>{project.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#E8E8E8', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: project.color, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{project.done}/{project.tasks}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
        {Array.from({ length: Math.min(project.members, 3) }).map((_, i) => (
          <AvatarCircle key={i} initials="?" size={22} color={project.color} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard Component ──────────────────────────────────

export function PlanoraDashboardPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all') // all | mine | overdue
  const [searchQuery, setSearchQuery] = useState('')

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const myTasks = useMemo(() => {
    let tasks = MOCK_TASKS
    if (filter === 'mine') tasks = tasks.filter(t => t.assignee === 'You')
    if (filter === 'overdue') tasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done')
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q))
    }
    return tasks
  }, [filter, searchQuery])

  const stats = useMemo(() => ({
    activeProjects: MOCK_PROJECTS.length,
    tasksDue: MOCK_TASKS.filter(t => {
      const d = new Date(t.dueDate)
      const now = new Date()
      const inWeek = new Date(now.getTime() + 7 * 86400000)
      return d <= inWeek && t.status !== 'Done'
    }).length,
    teamMembers: 8,
    completionRate: Math.round(
      (MOCK_TASKS.filter(t => t.status === 'Done').length / MOCK_TASKS.length) * 100
    ),
  }), [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
            {greeting}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>
            Here's what's happening across your projects today.
          </p>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: BRAND, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
          onClick={() => navigate('/app/projects/new')}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KPICard icon={FolderKanban} label="Active Projects" value={stats.activeProjects} change={12} changeType="up" />
        <KPICard icon={Clock} label="Tasks Due This Week" value={stats.tasksDue} change={8} changeType="up" />
        <KPICard icon={Users} label="Team Members" value={stats.teamMembers} change={2} changeType="up" />
        <KPICard icon={CheckCircle2} label="Completion Rate" value={stats.completionRate} suffix="%" change={5} changeType="up" />
      </div>

      {/* Main Grid: Tasks + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: My Tasks */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8E8', overflow: 'hidden' }}>
          {/* Tasks Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
                <ListTodo size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: BRAND }} />
                My Tasks
              </h2>
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'mine', 'overdue'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '4px 12px', borderRadius: 6, border: 'none',
                      background: filter === f ? BRAND : 'transparent',
                      color: filter === f ? '#fff' : '#888',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F5F5F5', borderRadius: 8, padding: '6px 12px',
            }}>
              <Search size={14} color="#888" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 13, color: '#1A1A2E', width: 140,
                }}
              />
            </div>
          </div>

          {/* Tasks Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8E8E8' }}>
                  {['Task', 'Project', 'Status', 'Priority', 'Due', 'Subtasks'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: '#888',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myTasks.map(task => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done'
                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid #F0F0F0',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AvatarCircle initials={task.avatar} size={28} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{task.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{task.project}</td>
                      <td style={{ padding: '12px 16px' }}><StatusPill status={task.status} /></td>
                      <td style={{ padding: '12px 16px' }}><PriorityBadge priority={task.priority} /></td>
                      <td style={{
                        padding: '12px 16px', fontSize: 13,
                        color: isOverdue ? '#DF2F4A' : '#666',
                        fontWeight: isOverdue ? 600 : 400,
                      }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {isOverdue && ' ⚠'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <SubtaskProgress done={task.subtasks.done} total={task.subtasks.total} />
                      </td>
                    </tr>
                  )
                })}
                {myTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>
                      No tasks match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent Activity */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8E8', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
                <Activity size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: BRAND }} />
                Recent Activity
              </h3>
              <button style={{ background: 'none', border: 'none', color: BRAND, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                View All <ChevronRight size={12} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {MOCK_ACTIVITY.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', gap: 12, padding: '10px 20px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <AvatarCircle initials={item.avatar} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#1A1A2E', lineHeight: 1.4 }}>
                      <strong>{item.user}</strong>{' '}
                      <span style={{ color: '#888' }}>{item.action}</span>{' '}
                      <strong>{item.target}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>
                      {item.project} · {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Overview */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8E8', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
                <FolderKanban size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: BRAND }} />
                Projects
              </h3>
              <button
                onClick={() => navigate('/app/projects')}
                style={{ background: 'none', border: 'none', color: BRAND, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                View All <ChevronRight size={12} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
            <div style={{ padding: '8px 20px 16px' }}>
              {MOCK_PROJECTS.map(p => (
                <ProjectBar key={p.name} project={p} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8E8', padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 12px' }}>
              <Zap size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: BRAND }} />
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Create Task', icon: Plus, path: '/app/tasks/new' },
                { label: 'New Project', icon: FolderKanban, path: '/app/projects/new' },
                { label: 'Invite Member', icon: Users, path: '/app/settings' },
                { label: 'View Calendar', icon: Calendar, path: '/app/calendar' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #E8E8E8', background: '#FAFAFA',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: '#1A1A2E', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = BRAND_LIGHT; e.currentTarget.style.borderColor = BRAND }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E8E8E8' }}
                >
                  <action.icon size={16} color={BRAND} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          div[style*="display: flex"][style*="gap: 16px"] {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default PlanoraDashboardPage
