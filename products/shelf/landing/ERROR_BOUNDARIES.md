# Error Boundary Components

Comprehensive error handling system for the Shelf frontend with context-aware error boundaries and centralized error tracking.

## 📦 Components Overview

### 1. **ErrorBoundary** (Basic)
Generic class-based error boundary for catching JavaScript errors.

**Use when:** You need basic error catching without special handling.

```jsx
import ErrorBoundary from './components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. **SectionErrorBoundary**
Isolates errors to specific UI sections without breaking the entire page.

**Use when:** You have independent sections (header, sidebar, content) that should fail independently.

```jsx
import SectionErrorBoundary from './components/SectionErrorBoundary'

<SectionErrorBoundary sectionName="User Profile">
  <UserProfile />
</SectionErrorBoundary>
```

### 3. **AsyncErrorBoundary**
Handles errors from async operations (promises, fetch, etc.).

**Use when:** Component makes async calls or data fetching.

```jsx
import AsyncErrorBoundary from './components/AsyncErrorBoundary'

<AsyncErrorBoundary 
  onRetry={async () => await fetchData()}
  onError={(error) => console.error(error)}
>
  <DataComponent />
</AsyncErrorBoundary>
```

### 4. **LazyErrorBoundary** ⭐ NEW
Specialized for dynamically imported components (React.lazy) with loading states.

**Use when:** Using code splitting with React.lazy().

```jsx
import LazyErrorBoundary from './components/LazyErrorBoundary'
import { lazy } from 'react'

const LazyComponent = lazy(() => import('./HeavyComponent'))

<LazyErrorBoundary loadingFallback={<Spinner />}>
  <LazyComponent />
</LazyErrorBoundary>
```

**Features:**
- Handles chunk loading errors (common with lazy loading)
- Provides loading fallback UI
- Auto-detects version mismatches and prompts reload

### 5. **FormErrorBoundary** ⭐ NEW
Specialized error boundary for form components with validation and submission error handling.

**Use when:** Wrapping forms, especially complex forms with validation.

```jsx
import FormErrorBoundary from './components/FormErrorBoundary'

<FormErrorBoundary
  onError={(error) => trackFormError(error)}
  onReset={() => resetFormState()}
>
  <ContactForm />
</FormErrorBoundary>
```

**Features:**
- Categorizes validation vs network errors
- Shows field-level errors
- Provides user-friendly error messages
- Includes reset/retry actions

### 6. **NetworkErrorBoundary** ⭐ NEW
Advanced network error handling with retry logic and offline detection.

**Use when:** Component depends on network requests or real-time data.

```jsx
import NetworkErrorBoundary from './components/NetworkErrorBoundary'

<NetworkErrorBoundary
  maxRetries={3}
  retryDelay={1000}
  autoRetryOnline={true}
  onRetry={fetchData}
>
  <RealtimeData />
</NetworkErrorBoundary>
```

**Features:**
- Detects online/offline status
- Exponential backoff retry strategy
- Auto-retry when connection restored
- Shows appropriate UI for network state

### 7. **ErrorContext & ErrorProvider** ⭐ NEW
Centralized error tracking with analytics integration.

**Use when:** You want centralized error logging, statistics, and monitoring.

```jsx
import { ErrorProvider, useError } from './components/ErrorContext'

// Wrap your app
<ErrorProvider 
  maxErrors={100}
  enableAnalytics={true}
  onError={(error) => sendToSentry(error)}
>
  <App />
</ErrorProvider>

// Use in components
function MyComponent() {
  const { logError, errors, errorStats } = useError()
  
  const handleClick = () => {
    try {
      riskyOperation()
    } catch (error) {
      logError(error, { 
        type: 'user-action',
        component: 'MyComponent' 
      })
    }
  }
}
```

**Features:**
- Tracks all errors across the app
- Provides error history and statistics
- Integrates with analytics (Sentry, LogRocket, GA)
- Global error and promise rejection handlers

## 🏗️ Architecture

### Layered Error Boundaries Strategy

```
ErrorProvider (Root - Centralized Tracking)
├── NetworkErrorBoundary (Network Layer)
│   └── App
│       ├── SectionErrorBoundary (Navigation)
│       ├── SectionErrorBoundary (Content)
│       │   ├── FormErrorBoundary (Forms)
│       │   └── LazyErrorBoundary (Code-split components)
│       └── SectionErrorBoundary (Footer)
```

### Current Implementation

**App.jsx:**
```jsx
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorProvider } from './components/ErrorContext'
import { DefaultErrorFallback } from './components/ErrorFallback'
import { LandingPage } from './components/LandingPage'

export default function App() {
  return (
    <ErrorProvider enableAnalytics={process.env.NODE_ENV === 'production'}>
      <ErrorBoundary
        FallbackComponent={DefaultErrorFallback}
        onError={(error, errorInfo) => console.error('App Error:', error)}
      >
        <LandingPage />
      </ErrorBoundary>
    </ErrorProvider>
  )
}
```

**LandingPage.jsx:**
```jsx
import SectionErrorBoundary from './SectionErrorBoundary'
import AsyncErrorBoundary from './AsyncErrorBoundary'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <SectionErrorBoundary sectionName="Hero">
        <HeroSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Features">
        <FeaturesSection />
      </SectionErrorBoundary>

      <AsyncErrorBoundary onRetry={fetchTestimonials}>
        <TestimonialsSection />
      </AsyncErrorBoundary>
    </div>
  )
}
```

## 📊 Error Types & Categorization

| Error Type | Boundary | Recovery Strategy |
|------------|----------|------------------|
| JavaScript runtime errors | ErrorBoundary | Reset component state |
| Chunk loading failures | LazyErrorBoundary | Reload page |
| Network failures | NetworkErrorBoundary | Retry with backoff |
| Form validation | FormErrorBoundary | Show field errors, allow correction |
| Async/Promise rejection | AsyncErrorBoundary | Retry operation |
| Section-specific | SectionErrorBoundary | Isolate, show inline error |

## 🎯 Best Practices

### 1. **Choose the Right Boundary**
```jsx
// ❌ Too generic
<ErrorBoundary>
  <ComplexForm />
</ErrorBoundary>

// ✅ Context-aware
<FormErrorBoundary>
  <ComplexForm />
</FormErrorBoundary>
```

### 2. **Layer Boundaries Appropriately**
```jsx
// ✅ Good: Layers from general to specific
<NetworkErrorBoundary>
  <SectionErrorBoundary>
    <FormErrorBoundary>
      <ContactForm />
    </FormErrorBoundary>
  </SectionErrorBoundary>
</NetworkErrorBoundary>
```

### 3. **Provide Context in Error Metadata**
```jsx
const { logError } = useError()

try {
  await submitForm(data)
} catch (error) {
  logError(error, {
    type: 'form-submission',
    component: 'ContactForm',
    severity: 'error',
    userId: user.id,
    formData: sanitizedData
  })
}
```

### 4. **Configure Retry Strategies**
```jsx
// Network requests: aggressive retry
<NetworkErrorBoundary maxRetries={5} retryDelay={500}>

// User actions: conservative retry
<FormErrorBoundary maxRetries={2} retryDelay={2000}>
```

### 5. **User-Friendly Messages**
```jsx
// ❌ Technical
"TypeError: Cannot read property 'map' of undefined"

// ✅ User-friendly
"We're having trouble loading your data. Please try again."
```

## 🔧 Configuration

### Environment-Specific Behavior

```jsx
<ErrorProvider
  maxErrors={process.env.NODE_ENV === 'development' ? 100 : 50}
  enableAnalytics={process.env.NODE_ENV === 'production'}
  onError={(error) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error)
    }
  }}
>
```

### Analytics Integration

```javascript
// In ErrorContext.jsx - sendToAnalytics function

// Sentry
if (window.Sentry) {
  window.Sentry.captureException(new Error(errorEntry.message), {
    tags: { type: errorEntry.type, component: errorEntry.component },
    extra: errorEntry.metadata,
  })
}

// Google Analytics
if (window.gtag) {
  window.gtag('event', 'exception', {
    description: errorEntry.message,
    fatal: errorEntry.severity === 'critical',
  })
}
```

## 🧪 Testing Error Boundaries

```jsx
import { ErrorBoundary } from './components/ErrorBoundary'
import { render } from '@testing-library/react'

// Component that throws
function BrokenComponent() {
  throw new Error('Test error')
}

test('catches errors', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <BrokenComponent />
    </ErrorBoundary>
  )
  
  expect(getByText(/something went wrong/i)).toBeInTheDocument()
})
```

## 📈 Monitoring & Analytics

### Error Statistics Dashboard

The `useError` hook provides real-time statistics:

```jsx
function AdminDashboard() {
  const { errorStats } = useError()
  
  return (
    <div>
      <h2>Error Statistics</h2>
      <p>Total Errors: {errorStats.total}</p>
      <ul>
        {Object.entries(errorStats.byType).map(([type, count]) => (
          <li key={type}>{type}: {count}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 🚀 Future Enhancements

- [ ] Error boundary for Suspense boundaries
- [ ] Image loading error boundary
- [ ] WebSocket connection error boundary
- [ ] A/B test error recovery strategies
- [ ] Machine learning error prediction
- [ ] Automated error triage

## 📚 Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [react-error-boundary Library](https://github.com/bvaughn/react-error-boundary)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)

---

**Last Updated:** March 2024
**Maintained by:** Shelf Frontend Team
