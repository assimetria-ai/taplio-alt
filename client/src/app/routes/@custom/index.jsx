import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Taplio Alt product routes (LinkedIn growth tool)

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
  import('../../pages/app/@custom/ContentTemplatesPage')
)
const EngagementAnalyticsPage = lazy(() =>
  import('../../pages/app/@custom/EngagementAnalyticsPage')
)
const LeadGenerationPage = lazy(() =>
  import('../../pages/app/@custom/LeadGenerationPage').then(m => ({ default: m.LeadGenerationPage }))
)
const AnalyticsDashboardPage = lazy(() =>
  import('../../pages/app/@custom/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage }))
)
const ContentSuggestionsPage = lazy(() =>
  import('../../pages/app/content-suggestions').then(m => ({ default: m.ContentSuggestionsPage }))
)

export const customRoutes = [
  // Dashboard — main app home (LinkedIn content overview)
  <Route
    key="taplio-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <TaplioDashboardPage />
      </ProtectedRoute>
    }
  />,
  // AI Post Writer — generate LinkedIn posts with AI
  <Route
    key="ai-writer"
    path="/app/writer"
    element={
      <ProtectedRoute>
        <AIPostWriterPage />
      </ProtectedRoute>
    }
  />,
  // Content Suggestions — AI-powered LinkedIn content ideas
  <Route
    key="content-suggestions"
    path="/app/content-suggestions"
    element={
      <ProtectedRoute>
        <ContentSuggestionsPage />
      </ProtectedRoute>
    }
  />,
  // Post Scheduler — schedule LinkedIn posts
  <Route
    key="scheduler"
    path="/app/scheduler"
    element={
      <ProtectedRoute>
        <PostSchedulerPage />
      </ProtectedRoute>
    }
  />,
  // Content Calendar — visual calendar of posts
  <Route
    key="calendar"
    path="/app/calendar"
    element={
      <ProtectedRoute>
        <ContentCalendarPage />
      </ProtectedRoute>
    }
  />,
  // Content Templates — pre-built LinkedIn post templates
  <Route
    key="templates"
    path="/app/templates"
    element={
      <ProtectedRoute>
        <ContentTemplatesPage />
      </ProtectedRoute>
    }
  />,
  // Engagement Analytics — track post performance
  <Route
    key="engagement"
    path="/app/engagement"
    element={
      <ProtectedRoute>
        <EngagementAnalyticsPage />
      </ProtectedRoute>
    }
  />,
  // Analytics Dashboard — detailed analytics view
  <Route
    key="analytics"
    path="/app/analytics"
    element={
      <ProtectedRoute>
        <AnalyticsDashboardPage />
      </ProtectedRoute>
    }
  />,
  // Lead Generation — identify leads from post engagement
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
