// src/App.jsx - Main application component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardHome from '../@custom/dashboard/DashboardHome';
import Dashboard from '../@custom/dashboard';
import TeamManagement from '../@custom/team';
import Sidebar from '../@custom/dashboard/Sidebar';

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
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Planora</h1>
          <p className="text-slate-400 mb-6">Please log in to continue</p>
          <a 
            href="/login" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Routes>
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
          
          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
