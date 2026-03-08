// @system — Standard dashboard layout with sidebar and header
// Provides consistent layout structure for all app pages
//
// Usage:
// <DashboardLayout>
//   <DashboardLayout.Header
//     title="Dashboard"
//     description="Welcome back!"
//     actions={<Button>Action</Button>}
//   />
//   <DashboardLayout.Content>
//     {/* Your dashboard content */}
//   </DashboardLayout.Content>
// </DashboardLayout>

import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Shield, CreditCard, Activity, Key, LayoutDashboard } from 'lucide-react'
import { Header } from '../Header/Header'
import { Sidebar, SidebarLogo, SidebarSection, SidebarItem } from '../Sidebar/Sidebar'
import { info } from '@/config/@system/info'
import { useAuthContext } from '@/app/store/@system/auth'
import { cn } from '@/app/lib/@system/utils'

const DEFAULT_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app' },
  { icon: Activity, label: 'Activity', to: '/app/activity' },
  { icon: CreditCard, label: 'Billing', to: '/app/billing' },
  { icon: Key, label: 'API Keys', to: '/app/api-keys' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]

/**
 * @typedef {Object} NavItem
 * @property {React.ComponentType} icon - Lucide icon component
 * @property {string} label - Navigation label
 * @property {string} to - Route path
 * @property {boolean} [adminOnly] - Show only for admin users
 */

/**
 * DashboardLayout — Main layout container
 * @param {Object} props
 * @param {React.ReactNode} props.children - Layout content
 * @param {NavItem[]} [props.navItems] - Custom navigation items (defaults to standard items)
 * @param {boolean} [props.showSidebar=true] - Toggle sidebar visibility
 */
export function DashboardLayout({ children, navItems = DEFAULT_NAV_ITEMS, showSidebar = true }) {
  const { user } = useAuthContext()
  const location = useLocation()

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar>
            <SidebarLogo name={info.name} />
            <SidebarSection>
              {navItems.map(({ icon: Icon, label, to, adminOnly }) => {
                if (adminOnly && user?.role !== 'admin') return null
                return (
                  <Link to={to} key={to}>
                    <SidebarItem
                      icon={<Icon className="h-4 w-4" />}
                      label={label}
                      active={location.pathname === to}
                    />
                  </Link>
                )
              })}
              {user?.role === 'admin' && (
                <Link to="/app/admin">
                  <SidebarItem
                    icon={<Shield className="h-4 w-4" />}
                    label="Admin"
                    active={location.pathname === '/app/admin'}
                  />
                </Link>
              )}
            </SidebarSection>
          </Sidebar>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * DashboardLayout.Header — Page header with title and optional actions
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Optional description text
 * @param {React.ReactNode} [props.actions] - Optional action buttons
 * @param {string} [props.className] - Additional CSS classes
 */
DashboardLayout.Header = function DashboardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

/**
 * DashboardLayout.Content — Scrollable content area with consistent padding
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.noPadding] - Remove default padding
 */
DashboardLayout.Content = function DashboardContent({ children, className, noPadding = false }) {
  return (
    <div className={cn(!noPadding && 'p-8', className)}>
      {children}
    </div>
  )
}

/**
 * DashboardLayout.Section — Content section with optional title
 * @param {Object} props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.title] - Section title
 * @param {string} [props.description] - Section description
 * @param {React.ReactNode} [props.actions] - Optional section actions
 * @param {string} [props.className] - Additional CSS classes
 */
DashboardLayout.Section = function DashboardSection({ children, title, description, actions, className }) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          {title && (
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
