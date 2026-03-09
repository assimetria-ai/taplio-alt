// products/planora/@custom/dashboard/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import TaskBoard from './TaskBoard';
import BoardTable from './BoardTable';
import ProjectHeader from './ProjectHeader';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table, list, kanban, calendar, timeline
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (currentProject) {
      fetchTasks(currentProject.id);
    }
  }, [currentProject]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setCurrentProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData)
      });

      if (res.ok) {
        const data = await res.json();
        setTasks([...tasks, data.task]);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? data.task : t));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        onCreateProject={() => {/* TODO: Open create project modal */}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                {currentProject ? currentProject.name : 'Dashboard'}
              </h1>
              {currentProject && (
                <span className="text-sm text-slate-400">
                  {tasks.length} tasks
                </span>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center space-x-2 bg-slate-700 rounded-lg p-1">
              {['table', 'list', 'kanban', 'calendar', 'timeline'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCreateTask({ title: 'New Task', status: 'todo' })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + New Task
            </button>
          </div>
        </header>

        {/* Project Header (if project selected) */}
        {currentProject && (
          <ProjectHeader
            project={currentProject}
            onUpdate={(updates) => {/* TODO: Update project */}}
          />
        )}

        {/* Main View */}
        <main className="flex-1 overflow-auto p-6">
          {!currentProject ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-white mb-2">
                No projects yet
              </h2>
              <p className="text-slate-400 mb-6">
                Create your first project to get started
              </p>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Project
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <BoardTable
              tasks={tasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onCreate={handleCreateTask}
            />
          ) : viewMode === 'list' ? (
            <TaskList
              tasks={tasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ) : viewMode === 'kanban' ? (
            <TaskBoard
              tasks={tasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ) : (
            <div className="text-center py-12 text-slate-400">
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
