// @custom — Planora sidebar navigation items (AI-powered project management)
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
} from 'lucide-react'

export const PLANORA_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: FolderKanban, label: 'Projects', to: '/app/projects' },
  { icon: CheckSquare, label: 'Tasks', to: '/app/tasks' },
  { icon: Users, label: 'Teams', to: '/app/teams' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]

// Keep backward-compatible export name used by @system sidebar
export const TAPLIO_NAV_ITEMS = PLANORA_NAV_ITEMS
