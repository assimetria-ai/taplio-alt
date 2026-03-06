# Shelf Landing Page

Smart content organization and curation platform landing page with comprehensive error boundary implementation.

## Error Boundary Architecture

This application implements a **multi-layered error boundary strategy** to ensure maximum resilience and user experience:

### 1. Root-Level Error Boundary (`App.jsx`)
- **Purpose**: Catches all uncaught errors at the application level
- **Library**: Uses `react-error-boundary` for modern functional component support
- **Features**:
  - Full-page error fallback UI
  - Error logging to console (easily extensible to error tracking services)
  - Reset functionality to recover from errors
  - Development mode error details

### 2. Section-Level Error Boundaries (`SectionErrorBoundary.jsx`)
- **Purpose**: Isolates errors to specific page sections
- **Benefits**:
  - Prevents entire page from breaking when one section fails
  - Provides contextual error messages
  - Allows users to continue using other sections
- **Usage**:
  ```jsx
  <SectionErrorBoundary sectionName="Hero Section">
    <HeroSection />
  </SectionErrorBoundary>
  ```

### 3. Async Error Boundary (`AsyncErrorBoundary.jsx`)
- **Purpose**: Handles errors from asynchronous operations
- **Features**:
  - Catches promise rejections
  - Provides retry functionality
  - Loading state management
  - Unhandled rejection listener
- **Usage**:
  ```jsx
  <AsyncErrorBoundary onRetry={() => refetchData()}>
    <AsyncContent />
  </AsyncErrorBoundary>
  ```

### 4. Custom Error Boundary (`ErrorBoundary.jsx`)
- **Purpose**: Class-based custom error boundary with full control
- **Features**:
  - Custom fallback UI with props
  - Detailed error information in development
  - Error state management
  - Component stack trace logging

### 5. Error Fallback Components (`ErrorFallback.jsx`)
- **Purpose**: Reusable error UI components
- **Variants**:
  - `DefaultErrorFallback` - Full-page error display
  - `MinimalErrorFallback` - Compact error card
  - `InlineErrorFallback` - Inline error display

## Error Boundary Benefits

### 1. **Improved User Experience**
- App remains functional even when errors occur
- Clear, user-friendly error messages
- Easy recovery with "Try Again" buttons

### 2. **Better Debugging**
- Error details logged to console
- Component stack traces in development mode
- Easy integration with error tracking services (Sentry, LogRocket, etc.)

### 3. **Graceful Degradation**
- Isolated failures don't crash the entire app
- Users can continue using working sections
- Section-specific error messages

### 4. **Production Ready**
- Hides technical details from users in production
- Shows helpful error information in development
- Extensible for error reporting services

## Error Tracking Integration

To integrate with error tracking services, update `App.jsx`:

```jsx
const handleError = (error, errorInfo) => {
  // Sentry example
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  })
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ErrorBoundary.jsx          # Custom class-based error boundary
│   ├── SectionErrorBoundary.jsx   # Section-level error isolation
│   ├── AsyncErrorBoundary.jsx     # Async operation error handling
│   ├── ErrorFallback.jsx          # Reusable error UI components
│   └── LandingPage.jsx            # Main landing page with error boundaries
├── App.jsx                        # Root component with top-level error boundary
├── main.jsx                       # Entry point with global error handlers
└── index.css                      # Global styles
```

## Testing Error Boundaries

To test error boundaries in development, you can temporarily add error-throwing components:

```jsx
function BuggyComponent() {
  throw new Error('Test error boundary')
}

// Wrap with error boundary to test
<SectionErrorBoundary sectionName="Test">
  <BuggyComponent />
</SectionErrorBoundary>
```

## Best Practices

1. **Use multiple boundary layers**: Don't rely on a single root boundary
2. **Provide context**: Tell users which section failed
3. **Enable recovery**: Always provide a way to recover (retry, go home)
4. **Log errors**: Send to error tracking in production
5. **Show details in dev**: Help developers debug issues
6. **Hide details in prod**: Don't expose technical errors to users

## Dependencies

- **react**: ^18.3.1
- **react-dom**: ^18.3.1
- **react-error-boundary**: ^4.0.11 - Modern error boundary utilities
- **vite**: ^5.4.5 - Build tool
- **tailwindcss**: ^3.4.11 - Styling

## Learn More

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [react-error-boundary Library](https://github.com/bvaughn/react-error-boundary)
- [Error Boundary Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
