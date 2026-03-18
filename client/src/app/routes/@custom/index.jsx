import { Route } from 'react-router-dom'
import { ErrorTrackingPage } from '../../pages/app/@custom/ErrorTrackingPage'
import { CollaboratorsPage } from '../../pages/app/@custom/CollaboratorsPage'
import { BrandSettingsPage } from '../../pages/app/@custom/BrandSettingsPage'
import { ChatbasePage } from '../../pages/app/@custom/ChatbasePage'
import { EmailTrackingPage } from '../../pages/app/@custom/EmailTrackingPage'
import { EmailPreviewPage } from '../../pages/app/@custom/EmailPreviewPage'
import { PrivateRoute } from '@/app/components/@system/PrivateRoute/PrivateRoute'
import { TaplioDashboardPage } from '../../pages/app/@custom/TaplioDashboardPage'
import { AIPostWriterPage } from '../../pages/app/@custom/AIPostWriterPage'
import { PostSchedulerPage } from '../../pages/app/@custom/PostSchedulerPage'
import { ContentCalendarPage } from '../../pages/app/@custom/ContentCalendarPage'
import { AnalyticsDashboardPage } from '../../pages/app/@custom/AnalyticsDashboardPage'
import { LeadGenerationPage } from '../../pages/app/@custom/LeadGenerationPage'
import { ContentTemplatesPage } from '../../pages/app/@custom/ContentTemplatesPage'
import { EngagementAnalyticsPage } from '../../pages/app/@custom/EngagementAnalyticsPage'
import { HashtagResearchPage } from '../../pages/app/@custom/HashtagResearchPage'

// @custom — add your product-specific routes here.
// Wrap with <PrivateRoute> for authenticated pages.
export const customRoutes = [
  <Route
    key="error-tracking"
    path="/app/errors"
    element={
      <PrivateRoute>
        <ErrorTrackingPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="collaborators"
    path="/app/collaborators"
    element={
      <PrivateRoute>
        <CollaboratorsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="brand-settings"
    path="/app/brand"
    element={
      <PrivateRoute>
        <BrandSettingsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="chatbase"
    path="/app/chatbase"
    element={
      <PrivateRoute>
        <ChatbasePage />
      </PrivateRoute>
    }
  />,
  <Route
    key="email-tracking"
    path="/app/emails"
    element={
      <PrivateRoute role="admin">
        <EmailTrackingPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="email-preview"
    path="/app/emails/preview"
    element={
      <PrivateRoute role="admin">
        <EmailPreviewPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="taplio-dashboard"
    path="/app/dashboard"
    element={
      <PrivateRoute>
        <TaplioDashboardPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="ai-writer"
    path="/app/ai-writer"
    element={
      <PrivateRoute>
        <AIPostWriterPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="scheduler"
    path="/app/scheduler"
    element={
      <PrivateRoute>
        <PostSchedulerPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="calendar"
    path="/app/calendar"
    element={
      <PrivateRoute>
        <ContentCalendarPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="analytics"
    path="/app/analytics"
    element={
      <PrivateRoute>
        <AnalyticsDashboardPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="leads"
    path="/app/leads"
    element={
      <PrivateRoute>
        <LeadGenerationPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="templates"
    path="/app/templates"
    element={
      <PrivateRoute>
        <ContentTemplatesPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="engagement"
    path="/app/engagement"
    element={
      <PrivateRoute>
        <EngagementAnalyticsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="hashtags"
    path="/app/hashtags"
    element={
      <PrivateRoute>
        <HashtagResearchPage />
      </PrivateRoute>
    }
  />,
]
