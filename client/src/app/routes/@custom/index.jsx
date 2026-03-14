import { Route } from 'react-router-dom'
import { lazy } from 'react'
import { ProtectedRoute } from '../../components/@system/ProtectedRoute/ProtectedRoute'

// @custom — Planora routes (AI-powered project management)

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
const SearchFiltersPage = lazy(() =>
  import('../../pages/app/@custom/SearchFiltersPage').then(m => ({ default: m.SearchFiltersPage }))
)

export const customRoutes = [
  <Route
    key="planora-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <PlanoraDashboardPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="projects"
    path="/app/projects"
    element={
      <ProtectedRoute>
        <ProjectBoardPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="tasks"
    path="/app/tasks"
    element={
      <ProtectedRoute>
        <TaskManagementPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="teams"
    path="/app/teams"
    element={
      <ProtectedRoute>
        <TeamsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="team-detail"
    path="/app/teams/:teamId"
    element={
      <ProtectedRoute>
        <TeamDetailPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="search"
    path="/app/search"
    element={
      <ProtectedRoute>
        <SearchFiltersPage />
      </ProtectedRoute>
    }
  />,
]
