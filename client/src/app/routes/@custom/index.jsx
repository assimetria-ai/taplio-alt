import { Route } from 'react-router-dom'
import { ErrorTrackingPage } from '../../pages/app/@custom/ErrorTrackingPage'
import { CollaboratorsPage } from '../../pages/app/@custom/CollaboratorsPage'
import { BrandSettingsPage } from '../../pages/app/@custom/BrandSettingsPage'
import { ChatbasePage } from '../../pages/app/@custom/ChatbasePage'
import { EmailTrackingPage } from '../../pages/app/@custom/EmailTrackingPage'
import { EmailPreviewPage } from '../../pages/app/@custom/EmailPreviewPage'
import { ClipLibraryPage } from '../../pages/app/@custom/ClipLibraryPage'
import { TeamsPage } from '../../pages/app/@custom/TeamsPage'
import { TeamDetailPage } from '../../pages/app/@custom/TeamDetailPage'
import { PostsList as PostsListPage } from '../../pages/app/@custom/PostsList'
import { PostScheduler as PostSchedulerPage } from '../../pages/app/@custom/PostScheduler'
import { ContentCalendarPage } from '../../pages/app/@custom/ContentCalendarPage'
import ContentTemplatesPage from '../../pages/app/@custom/ContentTemplatesPage'
import EngagementAnalyticsPage from '../../pages/app/@custom/EngagementAnalyticsPage'
import { HashtagResearchPage } from '../../pages/app/@custom/HashtagResearchPage'
import { LeadGenerationPage } from '../../pages/app/@custom/LeadGenerationPage'
import { AIPostWriterPage } from '../../pages/app/@custom/AIPostWriterPage'
import { PrivateRoute } from '@/app/components/@system/PrivateRoute/PrivateRoute'

// @custom — add your product-specific routes here.
// Wrap with <PrivateRoute> for authenticated pages.
export const customRoutes = [
  // Core LinkedIn features
  <Route
    key="ai-writer"
    path="/app/writer"
    element={
      <PrivateRoute>
        <AIPostWriterPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="posts-list"
    path="/app/posts"
    element={
      <PrivateRoute>
        <PostsListPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="post-new"
    path="/app/posts/new"
    element={
      <PrivateRoute>
        <PostSchedulerPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="post-edit"
    path="/app/posts/:id/edit"
    element={
      <PrivateRoute>
        <PostSchedulerPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="content-calendar"
    path="/app/calendar"
    element={
      <PrivateRoute>
        <ContentCalendarPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="content-templates"
    path="/app/templates"
    element={
      <PrivateRoute>
        <ContentTemplatesPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="hashtag-research"
    path="/app/hashtags"
    element={
      <PrivateRoute>
        <HashtagResearchPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="engagement-analytics"
    path="/app/analytics"
    element={
      <PrivateRoute>
        <EngagementAnalyticsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="lead-generation"
    path="/app/leads"
    element={
      <PrivateRoute>
        <LeadGenerationPage />
      </PrivateRoute>
    }
  />,
  // Utility features
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
    key="clip-library"
    path="/app/library"
    element={
      <PrivateRoute>
        <ClipLibraryPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="teams"
    path="/app/teams"
    element={
      <PrivateRoute>
        <TeamsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="team-detail"
    path="/app/teams/:id"
    element={
      <PrivateRoute>
        <TeamDetailPage />
      </PrivateRoute>
    }
  />,
]
