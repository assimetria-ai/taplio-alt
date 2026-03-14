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
  // Dashboard — main app home with KPI cards, activity feed, my tasks
  <Route
    key="planora-dashboard"
    path="/app/dashboard"
    element={
      <ProtectedRoute>
        <PlanoraDashboardPage />
      </ProtectedRoute>
    }
  />,
  // Project Board — Monday.com-style table board with kanban/table views
  <Route
    key="project-board"
    path="/app/board"
    element={
      <ProtectedRoute>
        <ProjectBoardPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="project-board-id"
    path="/app/board/:projectId"
    element={
      <ProtectedRoute>
        <ProjectBoardPage />
      </ProtectedRoute>
    }
  />,
  // Task Management — create, edit, assign, status, priority, subtasks
  <Route
    key="tasks"
    path="/app/tasks"
    element={
      <ProtectedRoute>
        <TaskManagementPage />
      </ProtectedRoute>
    }
  />,
  // Teams & Workspace — team management, invites, roles
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
]
