// @custom — Taplio Alt sidebar navigation items
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Calendar,
  BookOpen,
  BarChart3,
  Target,
  Settings,
} from 'lucide-react'

export const TAPLIO_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: Sparkles, label: 'AI Writer', to: '/app/writer' },
  { icon: FileText, label: 'Posts', to: '/app/posts' },
  { icon: Calendar, label: 'Calendar', to: '/app/calendar' },
  { icon: BookOpen, label: 'Templates', to: '/app/templates' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics' },
  { icon: Target, label: 'Leads', to: '/app/leads' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]
