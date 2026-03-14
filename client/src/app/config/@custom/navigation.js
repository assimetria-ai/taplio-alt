// @custom — Taplio Alt sidebar navigation items (LinkedIn growth tool)
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  CalendarDays,
  PenTool,
  Users,
  Settings,
  Lightbulb,
} from 'lucide-react'

export const TAPLIO_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: PenTool, label: 'AI Post Writer', to: '/app/writer' },
  { icon: Lightbulb, label: 'Content Suggestions', to: '/app/content-suggestions' },
  { icon: Calendar, label: 'Post Scheduler', to: '/app/scheduler' },
  { icon: CalendarDays, label: 'Content Calendar', to: '/app/calendar' },
  { icon: FileText, label: 'Content Templates', to: '/app/templates' },
  { icon: TrendingUp, label: 'Engagement', to: '/app/engagement' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics' },
  { icon: Users, label: 'Lead Generation', to: '/app/leads' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]
