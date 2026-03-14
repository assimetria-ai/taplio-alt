// @custom — Taplio Alt sidebar navigation items (LinkedIn growth tool)
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Settings,
} from 'lucide-react'

export const TAPLIO_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: Calendar, label: 'Post Scheduler', to: '/app/scheduler' },
  { icon: FileText, label: 'Content Templates', to: '/app/templates' },
  { icon: TrendingUp, label: 'Engagement', to: '/app/engagement' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics' },
  { icon: CalendarDays, label: 'Content Calendar', to: '/app/calendar' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]
