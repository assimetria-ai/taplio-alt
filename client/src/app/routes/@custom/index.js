import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Taplio Alt product routes (LinkedIn growth tool)

const TaplioDashboardPage = lazy(() =>
  import('../../pages/app/@custom/TaplioDashboardPage').then(m => ({ default: m.TaplioDashboardPage }))
)
const PostSchedulerPage = lazy(() =>
  import('../../pages/app/@custom/PostSchedulerPage').then(m => ({ default: m.PostSchedulerPage }))
)
const ContentTemplatesPage = lazy(() =>
  import('../../pages/app/@custom/ContentTemplatesPage')
)
const EngagementAnalyticsPage = lazy(() =>
  import('../../pages/app/@custom/EngagementAnalyticsPage')
)
const AnalyticsDashboardPage = lazy(() =>
  import('../../pages/app/@custom/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage }))
)
const ContentCalendarPage = lazy(() =>
  import('../../pages/app/@custom/ContentCalendarPage').then(m => ({ default: m.ContentCalendarPage }))
)
const AIPostWriterPage = lazy(() =>
  import('../../pages/app/@custom/AIPostWriterPage').then(m => ({ default: m.AIPostWriterPage }))
)
const LeadGenerationPage = lazy(() =>
  import('../../pages/app/@custom/LeadGenerationPage').then(m => ({ default: m.LeadGenerationPage }))
)

export const customRoutes = [
  // Dashboard — main app home
  <Route
    key="taplio-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <TaplioDashboardPage />
      </ProtectedRoute>
    }
  />,
  // Post Scheduler
  <Route
    key="post-scheduler"
    path="/app/scheduler"
    element={
      <ProtectedRoute>
        <PostSchedulerPage />
      </ProtectedRoute>
    }
  />,
  // Content Templates
  <Route
    key="content-templates"
    path="/app/templates"
    element={
      <ProtectedRoute>
        <ContentTemplatesPage />
      </ProtectedRoute>
    }
  />,
  // Engagement Analytics
  <Route
    key="engagement-analytics"
    path="/app/engagement"
    element={
      <ProtectedRoute>
        <EngagementAnalyticsPage />
      </ProtectedRoute>
    }
  />,
  // Analytics Dashboard
  <Route
    key="analytics"
    path="/app/analytics"
    element={
      <ProtectedRoute>
        <AnalyticsDashboardPage />
      </ProtectedRoute>
    }
  />,
  // Content Calendar
  <Route
    key="content-calendar"
    path="/app/calendar"
    element={
      <ProtectedRoute>
        <ContentCalendarPage />
      </ProtectedRoute>
    }
  />,
  // AI Post Writer
  <Route
    key="ai-writer"
    path="/app/writer"
    element={
      <ProtectedRoute>
        <AIPostWriterPage />
      </ProtectedRoute>
    }
  />,
  // Lead Generation
  <Route
    key="lead-generation"
    path="/app/leads"
    element={
      <ProtectedRoute>
        <LeadGenerationPage />
      </ProtectedRoute>
    }
  />,
]
