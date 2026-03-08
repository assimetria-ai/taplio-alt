# UX Components Guide

This template includes a comprehensive library of reusable UX components covering common patterns for dashboards, onboarding, user settings, and more.

## Component Categories

### 📊 Dashboard Components

#### DashboardLayout
Main layout container with responsive sidebar navigation.

```jsx
import { DashboardLayout } from '@/app/components/@system'

<DashboardLayout>
  <DashboardLayout.Header 
    title="Dashboard" 
    description="Welcome back!"
    actions={<Button>New Item</Button>}
  />
  <DashboardLayout.Content>
    {/* Your content */}
  </DashboardLayout.Content>
</DashboardLayout>
```

#### MetricCard
Display key metrics with trend indicators.

```jsx
import { MetricCard, MetricGroup } from '@/app/components/@system'

<MetricGroup columns={3}>
  <MetricCard
    title="Total Revenue"
    value="$45,231"
    change={12.5}
    trend="up"
    period="vs last month"
    icon={<DollarSign className="h-6 w-6" />}
  />
  <MetricCard
    title="Active Users"
    value="2,345"
    change={-3.2}
    trend="down"
  />
</MetricGroup>
```

#### StatCard, WelcomeCard, QuickActions
Additional dashboard widgets for common patterns.

### 🚀 Onboarding Components

#### OnboardingWizard
Multi-step onboarding flow with progress tracking.

```jsx
import { OnboardingWizard } from '@/app/components/@system'

<OnboardingWizard />
// Handles: welcome, profile, preferences, team invites
```

The wizard automatically:
- Tracks progress across 5 steps
- Saves user data to backend
- Supports skip functionality
- Navigates to dashboard on completion

### ⚙️ User Settings Components

#### UserSettings
Complete settings interface with tabbed navigation.

```jsx
import { UserSettings } from '@/app/components/@system'

<UserSettings defaultTab="profile" />
// Includes: profile, security, notifications, preferences, connections
```

#### SettingsSection & SettingsRow
Reusable building blocks for custom settings pages.

```jsx
import { SettingsSection, SettingsRow } from '@/app/components/@system'

<SettingsSection title="Privacy" description="Control your data">
  <SettingsRow 
    label="Make profile public"
    description="Allow others to see your activity"
  >
    <Switch checked={isPublic} onCheckedChange={setPublic} />
  </SettingsRow>
</SettingsSection>
```

### 🎯 Common UI Components

#### Modal
Accessible modal dialogs with variants.

```jsx
import { Modal, ConfirmModal } from '@/app/components/@system'

// Standard modal
<Modal 
  open={isOpen} 
  onClose={() => setOpen(false)}
  title="Edit Profile"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </>
  }
>
  <p>Modal content...</p>
</Modal>

// Confirmation modal
<ConfirmModal
  open={showConfirm}
  onClose={() => setConfirm(false)}
  onConfirm={handleDelete}
  title="Delete item?"
  description="This action cannot be undone"
  variant="destructive"
/>
```

#### Avatar & AvatarGroup
User avatars with fallback initials and status indicators.

```jsx
import { Avatar, AvatarGroup } from '@/app/components/@system'

<Avatar 
  src="/avatar.jpg" 
  name="John Doe"
  status="online"
  size="md"
/>

<AvatarGroup 
  users={teamMembers}
  max={3}
  size="sm"
/>
```

#### Dropdown Menu
Accessible dropdown with keyboard navigation.

```jsx
import { 
  Dropdown, 
  DropdownItem, 
  DropdownSeparator 
} from '@/app/components/@system'

<Dropdown trigger={<Button>Menu</Button>}>
  <DropdownItem icon={<Edit />} onClick={handleEdit}>
    Edit
  </DropdownItem>
  <DropdownSeparator />
  <DropdownItem 
    icon={<Trash />} 
    onClick={handleDelete}
    variant="danger"
  >
    Delete
  </DropdownItem>
</Dropdown>
```

#### ProgressBar
Visual progress indicators with variants.

```jsx
import { ProgressBar, CircularProgress } from '@/app/components/@system'

<ProgressBar 
  value={75}
  label="Uploading..."
  showPercentage
  variant="success"
  animated
/>

<CircularProgress
  value={85}
  size="lg"
/>
```

### 🧭 Navigation Components

#### Breadcrumbs
Path navigation with auto-generation from URL.

```jsx
import { 
  Breadcrumbs, 
  BreadcrumbItem,
  BreadcrumbsFromPath 
} from '@/app/components/@system'

// Manual breadcrumbs
<Breadcrumbs>
  <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/app/settings">Settings</BreadcrumbItem>
  <BreadcrumbItem>Profile</BreadcrumbItem>
</Breadcrumbs>

// Auto-generated from current path
<BreadcrumbsFromPath 
  basePath="/app"
  labels={{ settings: 'My Settings' }}
  showHome
/>
```

#### Pagination
Page navigation with responsive design.

```jsx
import { Pagination, SimplePagination } from '@/app/components/@system'

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  siblingCount={1}
/>

// Simpler variant
<SimplePagination
  currentPage={1}
  totalPages={10}
  onPageChange={handlePageChange}
/>
```

#### CommandPalette
Cmd+K style quick navigation.

```jsx
import { CommandPalette, useCommandPalette } from '@/app/components/@system'

function App() {
  const { open, setOpen } = useCommandPalette()

  const commands = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      category: 'Navigation',
      href: '/app',
      icon: Home,
      shortcut: '⌘D'
    },
    {
      id: 'settings',
      label: 'Settings',
      category: 'Navigation',
      href: '/app/settings',
      icon: Settings
    }
  ]

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open ⌘K</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
      />
    </>
  )
}
```

## Design Patterns

### Responsive Design
All components are mobile-first and responsive:
- Stack vertically on mobile
- Use hamburger menus for navigation
- Touch-friendly hit areas
- Adaptive typography

### Accessibility
Components follow WCAG guidelines:
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

### Loading States
Most components support loading states:

```jsx
<MetricCard loading />
<DataTable loading />
<Skeleton className="h-20" />
```

### Empty States

```jsx
import { EmptyState } from '@/app/components/@system'

<EmptyState
  icon={<Inbox />}
  title="No messages"
  description="You're all caught up!"
  action={<Button>Compose</Button>}
/>
```

## Customization

### Styling
All components accept `className` prop for Tailwind customization:

```jsx
<Card className="border-primary shadow-lg">
  {/* content */}
</Card>
```

### Variants
Many components support variant props:

```jsx
<Button variant="destructive" size="lg">Delete</Button>
<Alert variant="warning">Warning message</Alert>
<Badge variant="success">Active</Badge>
```

## Best Practices

### Component Composition
Build complex UIs by composing simple components:

```jsx
<DashboardLayout>
  <DashboardLayout.Header title="Analytics" />
  <DashboardLayout.Content>
    <MetricGroup columns={3}>
      <MetricCard {...} />
      <MetricCard {...} />
      <MetricCard {...} />
    </MetricGroup>
    
    <Card className="mt-6">
      <DataTable {...} />
    </Card>
  </DashboardLayout.Content>
</DashboardLayout>
```

### Reusability
Extract common patterns into custom components:

```jsx
// components/DashboardPage.jsx
export function DashboardPage({ title, children }) {
  return (
    <DashboardLayout>
      <DashboardLayout.Header title={title} />
      <DashboardLayout.Content>
        {children}
      </DashboardLayout.Content>
    </DashboardLayout>
  )
}
```

### Performance
- Use `loading` states for async operations
- Implement skeleton screens for better perceived performance
- Lazy load heavy components

## Examples

See `/e2e` tests for comprehensive usage examples of all components.

## Support

For questions or issues with components, check:
- Component source code in `/client/src/app/components/@system`
- Test examples in `/e2e/@system`
- This documentation
