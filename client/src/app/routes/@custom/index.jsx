import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Taplio Alt routes (LinkedIn content creation & scheduling)

const TaplioDashboardPage = lazy(() =>
  import('../../pages/app/@custom/TaplioDashboardPage').then(m => ({ default: m.TaplioDashboardPage }))
)
const AIPostWriterPage = lazy(() =>
  import('../../pages/app/@custom/AIPostWriterPage').then(m => ({ default: m.AIPostWriterPage }))
)
const PostSchedulerPage = lazy(() =>
  import('../../pages/app/@custom/PostSchedulerPage').then(m => ({ default: m.PostSchedulerPage }))
)
const ContentCalendarPage = lazy(() =>
  import('../../pages/app/@custom/ContentCalendarPage').then(m => ({ default: m.ContentCalendarPage }))
)
const ContentTemplatesPage = lazy(() =>
  import('../../pages/app/@custom/ContentTemplatesPage').then(m => ({ default: m.ContentTemplatesPage }))
)
const EngagementAnalyticsPage = lazy(() =>
  import('../../pages/app/@custom/EngagementAnalyticsPage').then(m => ({ default: m.EngagementAnalyticsPage }))
)
const LeadGenerationPage = lazy(() =>
  import('../../pages/app/@custom/LeadGenerationPage').then(m => ({ default: m.LeadGenerationPage }))
)

export const customRoutes = [
  <Route
    key="taplio-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <TaplioDashboardPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="ai-writer"
    path="/app/ai-writer"
    element={
      <ProtectedRoute>
        <AIPostWriterPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="scheduler"
    path="/app/scheduler"
    element={
      <ProtectedRoute>
        <PostSchedulerPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="calendar"
    path="/app/calendar"
    element={
      <ProtectedRoute>
        <ContentCalendarPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="templates"
    path="/app/templates"
    element={
      <ProtectedRoute>
        <ContentTemplatesPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="analytics"
    path="/app/analytics"
    element={
      <ProtectedRoute>
        <EngagementAnalyticsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="leads"
    path="/app/leads"
    element={
      <ProtectedRoute>
        <LeadGenerationPage />
      </ProtectedRoute>
    }
  />,
]
