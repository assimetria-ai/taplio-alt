// src/App.jsx - Main application component
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardHome from '../@custom/dashboard/DashboardHome';
import Dashboard from '../@custom/dashboard';
import TeamManagement from '../@custom/team';
import Settings from '../@custom/dashboard/Settings';
import TimeReport from '../@custom/dashboard/TimeReport';
import Sidebar from '../@custom/dashboard/Sidebar';
import Login from '../@custom/auth/login';
import Signup from '../@custom/auth/signup';

// Authenticated layout with sidebar
function AuthenticatedLayout({ user }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0 && !currentProject) {
          setCurrentProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleCreateProject = async () => {
    // Navigate to project creation - handled by child routes
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar
        user={user}
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        onCreateProject={handleCreateProject}
      />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          {/* Public routes - Auth */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
          />

          {/* Protected routes with sidebar layout */}
          {user ? (
            <Route element={<AuthenticatedLayout user={user} />}>
              {/* Dashboard Home */}
              <Route path="/" element={<DashboardHome />} />
              <Route path="/dashboard" element={<DashboardHome />} />

              {/* Projects View */}
              <Route path="/projects" element={<Dashboard />} />
              <Route path="/projects/:projectId" element={<Dashboard />} />

              {/* Task Detail View */}
              <Route path="/tasks/:taskId" element={<Dashboard />} />

              {/* Team Management */}
              <Route path="/team" element={<TeamManagement />} />
              <Route path="/projects/:projectId/team" element={<TeamManagement />} />

              {/* Time Tracking */}
              <Route path="/time" element={<TimeReport />} />
              <Route path="/projects/:projectId/time" element={<TimeReport />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard/settings" element={<Settings />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
