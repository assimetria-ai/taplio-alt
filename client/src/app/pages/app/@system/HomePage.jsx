// @system — main app dashboard page with modern UX components
// @custom — add your dashboard widgets/sections in the main content area
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, DollarSign, Activity as ActivityIcon, TrendingUp, FileText } from 'lucide-react'
import { useAuthContext } from '../../../store/@system/auth'
import { HomePageSkeleton } from '../../../components/@system/Skeleton/Skeleton'
import { Button } from '../../../components/@system/ui/button'
import {
  DashboardLayout,
  StatCard,
  StatCardGrid,
  RecentActivityList,
  QuickActions,
  DataTable,
  WelcomeCard,
} from '../../../components/@system/Dashboard'
import { CommandPalette } from '../../../components/@system/CommandPalette/CommandPalette'
import { GuidedTour } from '../../../components/@system/Onboarding/GuidedTour'
import { AnnouncementBanner } from '../../../components/@system/AnnouncementBanner/AnnouncementBanner'

// @custom — Replace with real data from your API
const MOCK_STATS = [
  {
    label: 'Total Users',
    value: '2,543',
    trend: { value: 12.5, direction: 'up' },
    description: 'vs last month',
    icon: Users,
  },
  {
    label: 'Revenue',
    value: '$45,234',
    trend: { value: 8.2, direction: 'up' },
    description: 'this month',
    icon: DollarSign,
  },
  {
    label: 'Active Sessions',
    value: '156',
    trend: { value: 3.1, direction: 'down' },
    description: 'right now',
    icon: ActivityIcon,
  },
  {
    label: 'Conversion Rate',
    value: '3.2%',
    trend: { value: 0.4, direction: 'up' },
    description: 'last 7 days',
    icon: TrendingUp,
  },
]

// @custom — Replace with real activity from your API
const MOCK_ACTIVITY = [
  {
    id: 1,
    icon: Users,
    title: 'New user signed up',
    description: 'john@example.com',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    variant: 'success',
  },
  {
    id: 2,
    icon: DollarSign,
    title: 'Payment received',
    description: '$49.99 from Premium plan',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    variant: 'success',
  },
  {
    id: 3,
    icon: FileText,
    title: 'New document created',
    description: 'Project proposal draft',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    variant: 'default',
  },
  {
    id: 4,
    icon: Users,
    title: 'User upgraded plan',
    description: 'Free → Premium',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    variant: 'success',
  },
  {
    id: 5,
    icon: ActivityIcon,
    title: 'API usage spike',
    description: '1,234 requests in last hour',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    variant: 'warning',
  },
]

// @custom — Replace with real actions relevant to your app
const MOCK_QUICK_ACTIONS = [
  {
    id: 'create-user',
    icon: Users,
    label: 'Add User',
    onClick: () => console.log('Add user'),
  },
  {
    id: 'create-invoice',
    icon: FileText,
    label: 'New Invoice',
    onClick: () => console.log('New invoice'),
  },
  {
    id: 'view-reports',
    icon: TrendingUp,
    label: 'View Reports',
    onClick: () => console.log('View reports'),
  },
  {
    id: 'api-docs',
    icon: FileText,
    label: 'API Docs',
    onClick: () => console.log('API docs'),
  },
]

// @custom — Replace with real table data from your API
const MOCK_TABLE_DATA = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    plan: 'Premium',
    joined: '2024-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active',
    plan: 'Free',
    joined: '2024-02-20',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'inactive',
    plan: 'Premium',
    joined: '2024-01-08',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    status: 'active',
    plan: 'Business',
    joined: '2024-03-01',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    status: 'active',
    plan: 'Free',
    joined: '2024-02-14',
  },
]

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {value}
      </span>
    ),
  },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'joined', label: 'Joined', sortable: true },
]

// @custom — Configure guided tour steps for your product
const TOUR_STEPS = [
  {
    selector: '[data-tour="stats"]',
    title: 'Your Key Metrics',
    content: 'Track important numbers at a glance. These update in real-time as your data changes.',
  },
  {
    selector: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Access your most-used features in one click. You can also press ⌘K to search for any action.',
  },
  {
    selector: '[data-tour="activity"]',
    title: 'Recent Activity',
    content: 'Stay on top of everything happening in your account with the activity feed.',
  },
  {
    selector: '[data-tour="data-table"]',
    title: 'Data Tables',
    content: 'Search, sort, and filter your data. Click any row to view details.',
  },
]

// @custom — Configure onboarding tasks for new users
const ONBOARDING_TASKS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name and photo',
    route: '/app/settings',
  },
  {
    id: 'billing',
    title: 'Set up billing',
    description: 'Add a payment method',
    route: '/app/billing',
  },
  {
    id: 'invite',
    title: 'Invite your team',
    description: 'Collaborate with teammates',
    route: '/app/teams',
  },
  {
    id: 'api-key',
    title: 'Create an API key',
    description: 'Start integrating',
    route: '/app/api-keys',
  },
]

export function HomePage() {
  const { user, loading } = useAuthContext()
  const navigate = useNavigate()
  const [tourActive, setTourActive] = useState(false)

  // @custom — Replace with real completion logic from your API
  const tasks = ONBOARDING_TASKS.map((task) => ({
    ...task,
    completed: user?.onboardingCompleted ? true : false,
  }))

  const handleTaskClick = useCallback(
    (task) => {
      if (task.route) navigate(task.route)
    },
    [navigate]
  )

  if (loading) {
    return <HomePageSkeleton />
  }

  return (
    <DashboardLayout>
      {/* Announcement banner — @custom: change message/variant as needed */}
      <AnnouncementBanner
        id="welcome-v1"
        message="🎉 Welcome to the new dashboard! Check out our latest features."
        variant="gradient"
        action={{ label: 'Learn more', href: '/help' }}
      />

      {/* Command palette — available globally via ⌘K */}
      <CommandPalette />

      {/* Guided tour — starts on demand */}
      <GuidedTour
        steps={TOUR_STEPS}
        isActive={tourActive}
        onComplete={() => setTourActive(false)}
        onSkip={() => setTourActive(false)}
        storageKey="dashboard-tour-completed"
      />

      <DashboardLayout.Content>
        {/* Welcome card with onboarding checklist for new users */}
        {!user?.onboardingCompleted && (
          <div className="mb-6">
            <WelcomeCard
              user={user}
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onDismiss={() => {}}
            />
          </div>
        )}

        {/* Page header */}
        <DashboardLayout.Header
          title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
          description="Here's what's happening with your account today."
          actions={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTourActive(true)}
                className="text-muted-foreground"
              >
                Take a tour
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </Button>
            </>
          }
        />

        {/* Stats grid */}
        <StatCardGrid data-tour="stats">
          {MOCK_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </StatCardGrid>

        {/* Two-column layout for Quick Actions and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <DashboardLayout.Section
            title="Quick Actions"
            description="Frequently used features"
            className="[&]:mb-0"
            data-tour="quick-actions"
          >
            <QuickActions actions={MOCK_QUICK_ACTIONS} />
          </DashboardLayout.Section>

          <DashboardLayout.Section
            title="Recent Activity"
            description="Latest updates and events"
            className="[&]:mb-0"
            data-tour="activity"
          >
            <RecentActivityList items={MOCK_ACTIVITY} limit={5} />
          </DashboardLayout.Section>
        </div>

        {/* Recent users table */}
        <DashboardLayout.Section
          data-tour="data-table"
          title="Recent Users"
          description="Newest account registrations"
          actions={
            <Button variant="outline" size="sm">
              View All
            </Button>
          }
        >
          <DataTable
            columns={TABLE_COLUMNS}
            data={MOCK_TABLE_DATA}
            searchable
            paginated
            onRowClick={(row) => console.log('Clicked row:', row)}
          />
        </DashboardLayout.Section>
      </DashboardLayout.Content>
    </DashboardLayout>
  )
}
