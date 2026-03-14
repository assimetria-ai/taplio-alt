// @custom — Planora sidebar navigation items (project management tool)
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Users,
  Search,
} from 'lucide-react'

export const PLANORA_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/app/dashboard' },
  { icon: Kanban,          label: 'Projects',   to: '/app/projects' },
  { icon: CheckSquare,     label: 'Tasks',      to: '/app/tasks' },
  { icon: Users,           label: 'Teams',      to: '/app/teams' },
  { icon: Search,          label: 'Search',     to: '/app/search' },
]
