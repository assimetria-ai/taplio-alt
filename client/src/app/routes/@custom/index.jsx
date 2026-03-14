import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Taplio Alt product routes (LinkedIn content creation & scheduling)

const TaplioDashboardPage = lazy(() =>
  import('../../pages/app/@custom/TaplioDashboardPage').then(m => ({ default: m.TaplioDashboardPage }))
)
const AIPostWriterPage = lazy(() =>
  import('../../pages/app/@custom/AIPostWriterPage').then(m => ({ default: m.AIPostWriterPage }))
)
const PostsListPage = lazy(() =>
  import('../../pages/app/@custom/PostsListPage').then(m => ({ default: m.PostsListPage }))
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
  // Posts list
  <Route
    key="posts"
    path="/app/posts"
    element={
      <ProtectedRoute>
        <PostsListPage />
      </ProtectedRoute>
    }
  />,
  // Post scheduler (create/edit)
  <Route
    key="post-new"
    path="/app/posts/new"
    element={
      <ProtectedRoute>
        <PostSchedulerPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="post-edit"
    path="/app/posts/:id/edit"
    element={
      <ProtectedRoute>
        <PostSchedulerPage />
      </ProtectedRoute>
    }
  />,
  // Content Calendar
  <Route
    key="calendar"
    path="/app/calendar"
    element={
      <ProtectedRoute>
        <ContentCalendarPage />
      </ProtectedRoute>
    }
  />,
  // Content Templates
  <Route
    key="templates"
    path="/app/templates"
    element={
      <ProtectedRoute>
        <ContentTemplatesPage />
      </ProtectedRoute>
    }
  />,
  // Engagement Analytics
  <Route
    key="analytics"
    path="/app/analytics"
    element={
      <ProtectedRoute>
        <EngagementAnalyticsPage />
      </ProtectedRoute>
    }
  />,
  // Lead Generation
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
