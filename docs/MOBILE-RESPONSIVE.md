# Mobile Responsiveness Guide

## Overview

This template is built with a mobile-first responsive design approach. All components are optimized for mobile devices while maintaining full desktop functionality.

## Breakpoint System

### Tailwind Breakpoints
- `xs`: 480px (extra small phones)
- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (small desktops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### Usage Example
```jsx
<div className="text-sm sm:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  Responsive grid
</div>
```

## Mobile-Optimized Components

### 1. MobileTable
Automatically switches between table (desktop) and card (mobile) views.

```jsx
import { MobileTable } from '@/app/components/@system/Dashboard/MobileTable'

<MobileTable
  columns={[
    { key: 'name', label: 'Name', primary: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', hideOnMobile: true }
  ]}
  data={users}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>
```

**Features:**
- Card view on mobile (< 1024px)
- Table view on desktop (>= 1024px)
- Touch-friendly tap targets
- Optimized spacing for small screens

### 2. MobileForm
Form wrapper with mobile-specific enhancements.

```jsx
import { MobileForm } from '@/app/components/@system/Form/MobileForm'

<MobileForm onSubmit={handleSubmit}>
  <MobileForm.Section
    title="Personal Information"
    description="Update your profile details"
  >
    <MobileForm.Group>
      <MobileForm.Field label="First Name" required>
        <Input {...register('firstName')} />
      </MobileForm.Field>
      <MobileForm.Field label="Last Name" required>
        <Input {...register('lastName')} />
      </MobileForm.Field>
    </MobileForm.Group>

    <MobileForm.Field
      label="Email"
      description="Your primary email address"
      error={errors.email?.message}
    >
      <Input type="email" {...register('email')} />
    </MobileForm.Field>
  </MobileForm.Section>

  <MobileForm.Actions>
    <Button type="button" variant="outline">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </MobileForm.Actions>
</MobileForm>
```

**Features:**
- Automatic keyboard dismissal on submit
- Full-width inputs on mobile
- Stacked buttons on mobile, horizontal on desktop
- Optimized spacing and touch targets

### 3. MobileModal
Full-screen modals on mobile, centered dialogs on desktop.

```jsx
import { MobileModal } from '@/app/components/@system/Modal/MobileModal'

<MobileModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to continue?"
  size="md"
>
  <MobileModal.Content>
    <p>This action cannot be undone.</p>
  </MobileModal.Content>

  <MobileModal.Actions>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
  </MobileModal.Actions>
</MobileModal>
```

**Features:**
- Full-screen on mobile (< 640px)
- Centered dialog on desktop
- Prevents body scroll when open
- ESC key to close
- Overlay click to close (configurable)

## Mobile-First CSS Utilities

### Touch Targets
All interactive elements should meet the WCAG 2.1 AAA minimum of 44x44px:

```jsx
<button className="touch-target">
  Click me
</button>

// Renders as: min-h-[44px] min-w-[44px] inline-flex items-center justify-center
```

### Safe Area Support
For devices with notches and rounded corners:

```jsx
<div className="safe-padding-top">
  Content respects notch
</div>

<div className="safe-padding-bottom">
  Content respects home indicator
</div>

<div className="safe-padding-x">
  Content respects curved edges
</div>
```

### Mobile-Optimized Text
```jsx
<p className="text-mobile-sm">Small text with relaxed line height</p>
<p className="text-mobile-base">Base text with relaxed line height</p>
<h2 className="text-mobile-lg">Large responsive heading</h2>
```

### Responsive Stacking
```jsx
<div className="mobile-stack">
  {/* Stacks vertically on mobile, horizontal on desktop */}
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## Container System

The template uses responsive container padding:

```jsx
<div className="container">
  {/* 
    Padding:
    - Mobile: 1rem (16px)
    - sm: 1.5rem (24px)
    - md: 2rem (32px)
    - lg: 2.5rem (40px)
    - xl+: 3rem (48px)
  */}
</div>
```

## Layout Patterns

### 1. Responsive Grid
```jsx
// Single column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### 2. Sidebar Layout
```jsx
// Stacked on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="lg:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### 3. Dashboard Stats
```jsx
// 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Users" value="1,234" />
  <StatCard label="Revenue" value="$45,678" />
  <StatCard label="Orders" value="892" />
  <StatCard label="Growth" value="+12%" />
</div>
```

## Best Practices

### 1. Always Test on Real Devices
- iPhone SE (smallest common viewport: 375x667)
- iPhone 14 Pro (notch + dynamic island)
- iPad (tablet breakpoint)
- Android phones (various sizes)

### 2. Touch-Friendly Design
✅ **DO:**
- Minimum 44x44px tap targets
- Spacing between interactive elements
- Large buttons for primary actions
- Easy-to-reach bottom navigation on mobile

❌ **DON'T:**
- Tiny close buttons (< 44px)
- Links/buttons too close together
- Important actions in hard-to-reach corners
- Hover-only interactions (no touch equivalent)

### 3. Typography
✅ **DO:**
- Use responsive text sizes (`text-sm sm:text-base lg:text-lg`)
- Adequate line spacing (leading-relaxed)
- Maximum line length (~60-70 characters)
- Readable contrast ratios (WCAG AA minimum)

❌ **DON'T:**
- Fixed font sizes that don't scale
- Tight line spacing on mobile
- Long paragraphs without breaks
- Low contrast text on mobile

### 4. Images & Media
```jsx
// Responsive images
<img
  src="/hero.jpg"
  srcSet="/hero-mobile.jpg 640w, /hero-tablet.jpg 1024w, /hero-desktop.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Hero image"
  className="w-full h-auto object-cover"
/>

// Video with mobile-friendly controls
<video
  className="w-full h-auto"
  controls
  playsInline // Important for iOS
  poster="/thumbnail.jpg"
>
  <source src="/video.mp4" type="video/mp4" />
</video>
```

### 5. Forms
✅ **DO:**
- Full-width inputs on mobile
- Appropriate input types (`type="email"`, `type="tel"`, etc.)
- Large submit buttons
- Clear error messages
- Auto-focus first input on desktop only

❌ **DON'T:**
- Tiny input fields
- Generic `type="text"` for emails/phones
- Multi-column forms on mobile
- Auto-focus on mobile (triggers keyboard)

### 6. Navigation
```jsx
// Mobile hamburger menu
<Header />

// Dashboard sidebar
<DashboardLayout>
  {/* Hamburger on mobile, persistent sidebar on desktop */}
</DashboardLayout>

// Bottom tab navigation for mobile apps
<div className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-background">
  <nav className="flex justify-around p-2">
    <NavButton icon={Home} label="Home" />
    <NavButton icon={Search} label="Search" />
    <NavButton icon={Settings} label="Settings" />
  </nav>
</div>
```

### 7. Modals & Overlays
```jsx
// Use MobileModal for full-screen on mobile
<MobileModal open={isOpen} onClose={onClose}>
  <MobileModal.Content>
    {/* Content */}
  </MobileModal.Content>
</MobileModal>

// Or use sheet/drawer pattern for mobile
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="bottom" className="h-[80vh]">
    {/* Slides up from bottom on mobile */}
  </SheetContent>
</Sheet>
```

## Performance Optimization

### 1. Lazy Loading
```jsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>
```

### 2. Conditional Rendering
```jsx
// Load mobile vs desktop components conditionally
const isMobile = window.innerWidth < 768

{isMobile ? <MobileTable /> : <DesktopTable />}
```

### 3. Image Optimization
- Use WebP format with JPEG/PNG fallback
- Implement lazy loading for below-fold images
- Compress images appropriately
- Use appropriate sizes for different viewports

## Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPad (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Test in both portrait and landscape
- [ ] Verify touch targets are 44x44px minimum
- [ ] Check for horizontal scroll issues
- [ ] Test with slow 3G connection
- [ ] Verify safe area handling on notched devices
- [ ] Test keyboard interactions on mobile
- [ ] Verify form input types trigger correct keyboards
- [ ] Test swipe gestures don't conflict
- [ ] Check that modals don't trap users
- [ ] Verify animations are smooth (60fps)
- [ ] Test with VoiceOver/TalkBack (accessibility)

## Common Issues & Solutions

### Issue: Horizontal Scroll on Mobile
**Solution:**
```css
/* Add to affected container */
.container {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}
```

### Issue: Fixed Positioning on iOS
**Solution:**
```jsx
// Use dvh (dynamic viewport height) instead of vh
<div className="h-screen"> {/* ❌ Can be buggy on iOS */}
<div style={{ height: '100dvh' }}> {/* ✅ Better */}
```

### Issue: Buttons Too Small on Mobile
**Solution:**
```jsx
// Use the touch-target utility
<button className="touch-target">
  Click me
</button>

// Or add explicit sizing
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  Click me
</Button>
```

### Issue: Text Too Small on Mobile
**Solution:**
```jsx
// Use responsive text utilities
<p className="text-sm sm:text-base">
  Responsive text
</p>

// Or mobile-optimized classes
<p className="text-mobile-base">
  Optimized for mobile
</p>
```

## Resources

- [WebAIM Touch Target Size](https://webaim.org/articles/touch/)
- [WCAG 2.1 Success Criterion 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Touch Targets](https://m3.material.io/foundations/accessible-design/overview)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
