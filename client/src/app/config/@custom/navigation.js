// @custom — Taplio Alt sidebar navigation items (LinkedIn content & scheduling)
import {
  LayoutDashboard,
  PenTool,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  Users,
} from 'lucide-react'

export const TAPLIO_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/app/dashboard' },
  { icon: PenTool,         label: 'AI Writer',  to: '/app/ai-writer' },
  { icon: Clock,           label: 'Scheduler',  to: '/app/scheduler' },
  { icon: Calendar,        label: 'Calendar',   to: '/app/calendar' },
  { icon: FileText,        label: 'Templates',  to: '/app/templates' },
  { icon: BarChart3,       label: 'Analytics',  to: '/app/analytics' },
  { icon: Users,           label: 'Leads',      to: '/app/leads' },
]
