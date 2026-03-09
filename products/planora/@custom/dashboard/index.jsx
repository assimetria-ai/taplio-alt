// products/planora/@custom/dashboard/index.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import TaskBoard from './TaskBoard';
import ProjectHeader from './ProjectHeader';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, board, calendar, timeline
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignee: null,
    search: '',
    tags: []
  });
  const [savedFilters, setSavedFilters] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchProjects();
    fetchSavedFilters();
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

  const fetchSavedFilters = async () => {
    try {
      const res = await fetch('/api/filters', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSavedFilters(data.filters);
      }
    } catch (err) {
      console.error('Failed to fetch filters:', err);
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

  const handleSaveFilter = async (name, filterData) => {
    try {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          filterData,
          projectId: currentProject?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSavedFilters([...savedFilters, data.filter]);
      }
    } catch (err) {
      console.error('Failed to save filter:', err);
    }
  };

  const handleDeleteFilter = async (filterId) => {
    try {
      const res = await fetch(`/api/filters/${filterId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setSavedFilters(savedFilters.filter(f => f.id !== filterId));
      }
    } catch (err) {
      console.error('Failed to delete filter:', err);
    }
  };

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Assignee filter
    if (filters.assignee) {
      filtered = filtered.filter(task => task.assignee?.id === filters.assignee);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        filters.tags.some(tag => task.tags?.includes(tag))
      );
    }

    return filtered;
  }, [tasks, filters]);

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">
                {currentProject ? currentProject.name : 'Dashboard'}
              </h1>
              {currentProject && (
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  {filteredTasks.length} of {tasks.length} tasks
                </span>
              )}
            </div>

            {/* Global Search Bar */}
            <SearchBar />

            {/* View Mode & Actions */}
            <div className="flex items-center space-x-2">
              {/* View Mode Switcher */}
              <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                {['list', 'board', 'calendar', 'timeline'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  >
                    {mode === 'list' && '☰'}
                    {mode === 'board' && '▦'}
                    {mode === 'calendar' && '📅'}
                    {mode === 'timeline' && '📊'}
                  </button>
                ))}
              </div>

              {/* Filter Panel */}
              {currentProject && (
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  onSaveFilter={handleSaveFilter}
                  savedFilters={savedFilters}
                  onLoadFilter={setFilters}
                  onDeleteFilter={handleDeleteFilter}
                />
              )}

              {/* New Task Button */}
              <button
                onClick={() => handleCreateTask({ title: 'New Task', status: 'todo' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                + New Task
              </button>
            </div>
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
          ) : viewMode === 'list' ? (
            <TaskList
              tasks={filteredTasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ) : viewMode === 'board' ? (
            <TaskBoard
              tasks={filteredTasks}
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
