// @system — main app dashboard page with sidebar layout
// @custom — add your dashboard widgets/sections in the main content area
import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Shield, CreditCard, Activity, Key, Menu } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { Sidebar, SidebarLogo, SidebarSection, SidebarItem } from '../../../components/@system/Sidebar/Sidebar'
import { info } from '@/config/@system/info'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/@system/Card/Card'
import { EmptyState } from '../../../components/@system/EmptyState/EmptyState'
import { Button } from '../../../components/@system/ui/button'
import { useAuthContext } from '../../../store/@system/auth'
import { HomePageSkeleton } from '../../../components/@system/Skeleton/Skeleton'
import { useMobileSidebar } from '../../../hooks/@system/useMobileSidebar'

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', to: '/app' },
  { icon: Activity, label: 'Activity', to: '/app/activity' },
  { icon: CreditCard, label: 'Billing', to: '/app/billing' },
  { icon: Key, label: 'API Keys', to: '/app/api-keys' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]

export function HomePage() {
  const { user, loading } = useAuthContext()
  const location = useLocation()
  const { mobileOpen, toggleMobile, closeMobile } = useMobileSidebar()

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobile}
          className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* ── Sidebar ── */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile}>
          <SidebarLogo name={info.name} />
          <SidebarSection>
            {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
              <Link to={to} key={to} onClick={closeMobile}>
                <SidebarItem
                  icon={<Icon className="h-4 w-4" />}
                  label={label}
                  active={location.pathname === to}
                />
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/app/admin" onClick={closeMobile}>
                <SidebarItem
                  icon={<Shield className="h-4 w-4" />}
                  label="Admin"
                  active={location.pathname === '/app/admin'}
                />
              </Link>
            )}
          </SidebarSection>
        </Sidebar>

        {/* ── Main content ── */}
        {loading ? (
          <HomePageSkeleton />
        ) : (
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {/* Page header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Here's what's happening with your account.
              </p>
            </div>

            {/* ── Stats row — @custom: replace with real metrics ── */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
              {[
                { label: 'Total Users', value: '—', hint: 'all time' },
                { label: 'Active Subscriptions', value: '—', hint: 'this month' },
                { label: 'Revenue', value: '—', hint: 'this month' },
                { label: 'Requests', value: '—', hint: 'today' },
              ].map(({ label, value, hint }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Recent activity — @custom: replace EmptyState with real data ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                <CardDescription>Your latest actions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="Events will appear here once you start using the app."
                />
              </CardContent>
            </Card>
          </main>
        )}
      </div>
    </div>
  )
}
