# UX Patterns & Components

This document describes the reusable UX patterns and components available in the Product Template. All components are located in `client/src/app/components/@system/`.

## 📊 Dashboard UX Patterns

### WelcomeCard

**Location:** `Dashboard/WelcomeCard.jsx`

A friendly welcome card that shows onboarding tasks and tracks user progress. Auto-hides when all tasks are complete.

**Features:**
- Progress bar with percentage
- Interactive task checklist
- Dismissible
- Personalized greeting
- Auto-hide on completion

**Usage:**
```jsx
import { WelcomeCard } from '@/app/components/@system/Dashboard'

const tasks = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add a photo and bio',
    completed: false
  },
  {
    id: 'billing',
    title: 'Add payment method',
    description: 'Get started with a free trial',
    completed: false
  }
]

<WelcomeCard
  user={user}
  tasks={tasks}
  onTaskClick={(task) => handleTaskAction(task)}
  onDismiss={() => setDismissed(true)}
/>
```

### FiltersBar

**Location:** `Dashboard/FiltersBar.jsx`

Flexible filters bar for data tables with search, dropdown filters, multi-select, and date ranges.

**Features:**
- Search input with clear button
- Multiple filter types (select, multi-select)
- Active filter pills with individual dismiss
- Date range selector
- Clear all functionality
- Responsive collapse/expand

**Usage:**
```jsx
import { FiltersBar } from '@/app/components/@system/Dashboard'

const filters = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    id: 'category',
    label: 'Category',
    type: 'multi',
    options: [
      { value: 'tech', label: 'Technology' },
      { value: 'business', label: 'Business' }
    ]
  }
]

<FiltersBar
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search items..."
  filters={filters}
  activeFilters={activeFilters}
  onFilterChange={(key, value) => setActiveFilters({ ...activeFilters, [key]: value })}
  onClearAll={() => { setSearch(''); setActiveFilters({}); }}
  showDateRange={true}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
/>
```

### BulkActions

**Location:** `Dashboard/BulkActions.jsx`

Appears when items are selected in a table, providing bulk operations.

**Features:**
- Selection count display
- "Select all" option
- Customizable action buttons
- Built-in common actions (delete, archive, export)
- Destructive action confirmation
- Slide-in animation

**Usage:**
```jsx
import { BulkActions, commonBulkActions } from '@/app/components/@system/Dashboard'

const actions = [
  commonBulkActions.archive,
  { type: 'separator' },
  commonBulkActions.export,
  { type: 'separator' },
  {
    ...commonBulkActions.delete,
    onClick: (count) => handleBulkDelete(selectedItems)
  }
]

<BulkActions
  selectedCount={selectedItems.length}
  totalCount={totalItems}
  onDeselectAll={() => setSelectedItems([])}
  onSelectAll={() => setSelectedItems(allItems)}
  actions={actions}
/>
```

---

## 🎯 Onboarding Patterns

### OnboardingWizard

**Location:** `Onboarding/OnboardingWizard.jsx`

Multi-step wizard for first-time user onboarding. Already exists in the template.

**Features:**
- Step-by-step progress
- Smooth animations between steps
- Data collection (name, use case, referral)
- API integration
- Auto-redirect on completion

### GuidedTour

**Location:** `Onboarding/GuidedTour.jsx`

Interactive product tour with spotlight effects and position-aware tooltips.

**Features:**
- Spotlight effect on target elements
- Smart tooltip positioning (adapts to viewport)
- Step navigation (next/previous)
- Skip tour option
- LocalStorage persistence
- Keyboard navigation support

**Usage:**
```jsx
import { GuidedTour } from '@/app/components/@system/Onboarding'

const tourSteps = [
  {
    selector: '[data-tour="dashboard"]',
    title: 'Your Dashboard',
    content: 'This is your command center. View key metrics and recent activity at a glance.'
  },
  {
    selector: '[data-tour="create-button"]',
    title: 'Create Something New',
    content: 'Click here to create a new project. You can also use Cmd+N.'
  },
  {
    selector: '[data-tour="search"]',
    title: 'Quick Search',
    content: 'Use this to quickly find anything. Press Cmd+K to open from anywhere.'
  }
]

<GuidedTour
  steps={tourSteps}
  isActive={showTour}
  onComplete={() => setShowTour(false)}
  onSkip={() => setShowTour(false)}
  storageKey="app-tour-completed"
/>
```

**Best Practices:**
- Use data attributes for tour targets: `data-tour="element-name"`
- Keep tour short (3-5 steps maximum)
- Make it skippable
- Only show on first visit
- Focus on core features only

### ProgressChecklist

**Location:** `Onboarding/ProgressChecklist.jsx`

Compact, persistent checklist that tracks user progress through setup tasks.

**Features:**
- Collapsible/expandable
- Progress bar
- Task completion tracking
- Individual task actions
- Estimated time per task
- Icons for visual clarity
- Dismissible when complete

**Usage:**
```jsx
import { ProgressChecklist } from '@/app/components/@system/Onboarding'
import { User, CreditCard, Settings, Users } from 'lucide-react'

const tasks = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your photo and bio',
    icon: User,
    completed: false,
    estimatedTime: '2 min'
  },
  {
    id: 'billing',
    title: 'Set up billing',
    description: 'Add a payment method',
    icon: CreditCard,
    completed: false,
    estimatedTime: '3 min'
  },
  {
    id: 'preferences',
    title: 'Configure preferences',
    description: 'Customize your experience',
    icon: Settings,
    completed: true,
    estimatedTime: '1 min'
  },
  {
    id: 'invite',
    title: 'Invite team members',
    description: 'Collaborate with your team',
    icon: Users,
    completed: false,
    estimatedTime: '2 min'
  }
]

<ProgressChecklist
  title="Getting Started"
  tasks={tasks}
  onTaskClick={(task) => navigate(task.route)}
  onDismiss={() => setDismissed(true)}
  initialCollapsed={false}
  showProgress={true}
/>
```

---

## ⚙️ User Settings Patterns

### KeyboardShortcuts

**Location:** `UserSettings/KeyboardShortcuts.jsx`

Displays all available keyboard shortcuts with search and customization.

**Features:**
- Search shortcuts
- Grouped by category
- Platform-aware (Mac vs Windows)
- Visual keyboard combo display
- Custom shortcut support
- Fixed vs editable shortcuts

**Usage:**
```jsx
import { KeyboardShortcuts } from '@/app/components/@system/UserSettings'

const shortcuts = [
  {
    id: 'search',
    category: 'General',
    description: 'Open search',
    keys: isMac ? ['⌘K'] : ['Ctrl+K'],
    fixed: true
  },
  {
    id: 'new',
    category: 'General',
    description: 'Create new item',
    keys: isMac ? ['⌘N'] : ['Ctrl+N']
  },
  {
    id: 'save',
    category: 'Editing',
    description: 'Save changes',
    keys: isMac ? ['⌘S'] : ['Ctrl+S'],
    fixed: true
  }
]

<KeyboardShortcuts
  shortcuts={shortcuts}
  customShortcuts={customShortcuts}
  onCustomize={(id, keys) => setCustomShortcuts({ ...customShortcuts, [id]: keys })}
  editable={true}
/>
```

**Shortcut Format:**
- Use platform-specific symbols: `⌘` (Cmd), `⌃` (Ctrl), `⌥` (Alt), `⇧` (Shift)
- Multiple alternatives: `keys: ['⌘Z', '⌘Y']` (shown as "or")
- Fixed shortcuts cannot be changed by users

### DataExport

**Location:** `UserSettings/DataExport.jsx`

Comprehensive data export interface with format selection and granular controls.

**Features:**
- Multiple export formats (JSON, CSV, PDF)
- Granular category selection
- Estimated file sizes
- Metadata toggle
- Last export timestamp
- Privacy notice
- Success feedback

**Usage:**
```jsx
import { DataExport } from '@/app/components/@system/UserSettings'
import { User, Mail, CreditCard, FileText } from 'lucide-react'

const categories = [
  {
    id: 'profile',
    label: 'Profile Information',
    description: 'Name, email, avatar, bio',
    icon: User,
    defaultSelected: true,
    estimatedSize: '2 KB'
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'All your sent and received messages',
    icon: Mail,
    defaultSelected: false,
    estimatedSize: '15 MB'
  },
  {
    id: 'billing',
    label: 'Billing History',
    description: 'Invoices and payment records',
    icon: CreditCard,
    defaultSelected: true,
    estimatedSize: '500 KB'
  }
]

<DataExport
  dataCategories={categories}
  onExport={async (options) => {
    // Handle export
    const { format, categories, includeMetadata } = options
    await exportData(format, categories, includeMetadata)
  }}
  loading={exporting}
  lastExport={lastExportDate}
/>
```

### ConnectedAccounts

**Location:** `UserSettings/ConnectedAccounts.jsx`

Manages third-party integrations and OAuth connections.

**Features:**
- Connected vs available accounts
- Connection details (email, permissions)
- Connect/disconnect actions
- External management links
- Privacy assurance
- Loading states

**Usage:**
```jsx
import { ConnectedAccounts } from '@/app/components/@system/UserSettings'
import { Github, Google, Slack, Twitter } from 'lucide-react'

const accounts = [
  {
    id: 'google',
    provider: 'Google',
    description: 'Sign in with Google and sync your calendar',
    icon: Google,
    connected: true,
    connectedEmail: 'user@gmail.com',
    connectedAt: '2024-01-15T10:30:00Z',
    permissions: ['Read email', 'Calendar access'],
    manageUrl: 'https://myaccount.google.com/connections'
  },
  {
    id: 'github',
    provider: 'GitHub',
    description: 'Connect repositories and enable CI/CD integrations',
    icon: Github,
    connected: false
  },
  {
    id: 'slack',
    provider: 'Slack',
    description: 'Receive notifications in your Slack workspace',
    icon: Slack,
    connected: true,
    connectedEmail: 'workspace.slack.com',
    connectedAt: '2024-02-20T14:15:00Z',
    permissions: ['Post messages', 'Read channels'],
    manageUrl: 'https://slack.com/apps/manage'
  }
]

<ConnectedAccounts
  accounts={accounts}
  onConnect={async (accountId) => {
    // Initiate OAuth flow
    window.location.href = `/api/oauth/connect/${accountId}`
  }}
  onDisconnect={async (accountId) => {
    // Revoke connection
    await api.delete(`/api/integrations/${accountId}`)
    refreshAccounts()
  }}
  loading={loading}
/>
```

---

## 🎨 Design Principles

### Consistency

All UX components follow the same design patterns:

1. **Color scheme:** Uses design tokens from Tailwind (primary, muted, accent, etc.)
2. **Spacing:** Consistent padding/margins (p-4, gap-3, etc.)
3. **Typography:** Standard text sizes (text-sm, text-lg, font-medium)
4. **Animations:** Smooth transitions with duration-200/300/500
5. **Feedback:** Loading states, success messages, error alerts

### Accessibility

All components include:

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- Sufficient color contrast

### Responsiveness

Components adapt to different screen sizes:

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly tap targets
- Collapsible sections on mobile
- Horizontal scrolling where needed

---

## 🚀 Integration Guide

### Adding to Existing Pages

1. **Import the component:**
   ```jsx
   import { WelcomeCard } from '@/app/components/@system/Dashboard'
   ```

2. **Prepare the data:**
   ```jsx
   const tasks = [/* ... */]
   ```

3. **Render with props:**
   ```jsx
   <WelcomeCard
     user={user}
     tasks={tasks}
     onTaskClick={handleTask}
   />
   ```

### Creating Custom Variations

All components accept `className` prop for custom styling:

```jsx
<WelcomeCard
  className="shadow-lg border-2 border-primary"
  // ... other props
/>
```

### Combining Components

Components are designed to work together:

```jsx
function Dashboard() {
  return (
    <div className="space-y-6">
      <WelcomeCard tasks={tasks} />
      <ProgressChecklist tasks={setupTasks} />
      <FiltersBar filters={filters} />
      <DataTable data={data} />
      <BulkActions selectedCount={selected.length} />
    </div>
  )
}
```

---

## 📋 Component Checklist

Use this checklist when adding new UX components:

- [ ] Component lives in `@system` directory
- [ ] Exported from index.js
- [ ] Accepts className prop
- [ ] Uses Tailwind design tokens
- [ ] Includes loading states
- [ ] Handles empty states
- [ ] Keyboard accessible
- [ ] Mobile responsive
- [ ] TypeScript types (optional)
- [ ] JSDoc comments
- [ ] Example usage in comments

---

## 🔧 Maintenance

### Updating Components

When updating template components:

1. Make changes in `@system` directories only
2. Test in isolation
3. Update this documentation
4. Add example to comments
5. Commit with descriptive message

### Creating New Components

Follow the established patterns:

```jsx
// @system — Component description
// Brief explanation of what it does and when to use it.

import { useState } from 'react'
import { Icon } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

export function ComponentName({
  prop1,
  prop2,
  onAction,
  className
}) {
  return (
    <div className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  )
}

// Example usage:
// const example = ...
```

---

## 🆘 Troubleshooting

### Component not displaying

1. Check import path is correct
2. Verify component is exported from index.js
3. Check console for errors
4. Ensure all required props are passed

### Styling issues

1. Verify Tailwind classes are correct
2. Check for conflicting CSS
3. Use browser devtools to inspect
4. Test className prop override

### Animation glitches

1. Check AnimatePresence wrapping
2. Verify key prop uniqueness
3. Test with reduced motion preference
4. Check for CSS conflicts

---

## 📚 Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
