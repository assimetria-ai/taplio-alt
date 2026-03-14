import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Planora product routes (AI-powered project management)

const PlanoraDashboardPage = lazy(() =>
  import('../../pages/app/@custom/PlanoraDashboardPage').then(m => ({ default: m.PlanoraDashboardPage }))
)
const ProjectBoardPage = lazy(() =>
  import('../../pages/app/@custom/ProjectBoardPage').then(m => ({ default: m.ProjectBoardPage }))
)
const TaskManagementPage = lazy(() =>
  import('../../pages/app/@custom/TaskManagementPage').then(m => ({ default: m.TaskManagementPage }))
)
const TeamsPage = lazy(() =>
  import('../../pages/app/@custom/TeamsPage').then(m => ({ default: m.TeamsPage }))
)
const TeamDetailPage = lazy(() =>
  import('../../pages/app/@custom/TeamDetailPage').then(m => ({ default: m.TeamDetailPage }))
)

export const customRoutes = [
  // Dashboard — main app home
  <Route
    key="planora-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <PlanoraDashboardPage />
      </ProtectedRoute>
    }
  />,
  // Project Board — Monday.com-style board
  <Route
    key="projects"
    path="/app/projects"
    element={
      <ProtectedRoute>
        <ProjectBoardPage />
      </ProtectedRoute>
    }
  />,
  // Task Management
  <Route
    key="tasks"
    path="/app/tasks"
    element={
      <ProtectedRoute>
        <TaskManagementPage />
      </ProtectedRoute>
    }
  />,
  // Teams
  <Route
    key="teams"
    path="/app/teams"
    element={
      <ProtectedRoute>
        <TeamsPage />
      </ProtectedRoute>
    }
  />,
  // Team detail
  <Route
    key="team-detail"
    path="/app/teams/:id"
    element={
      <ProtectedRoute>
        <TeamDetailPage />
      </ProtectedRoute>
    }
  />,
]
