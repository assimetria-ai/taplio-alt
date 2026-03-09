// products/planora/@custom/dashboard/DashboardHome.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [myTasks, setMyTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user info
      const userRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch dashboard stats
      const statsRes = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch my tasks
      const tasksRes = await fetch('/api/dashboard/my-tasks', { credentials: 'include' });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setMyTasks(tasksData.tasks);
      }

      // Fetch activity feed
      const activityRes = await fetch('/api/dashboard/activity', { credentials: 'include' });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-slate-600 text-slate-200',
      'in-progress': 'bg-blue-600 text-white',
      'review': 'bg-amber-600 text-white',
      'done': 'bg-emerald-600 text-white'
    };
    return colors[status] || 'bg-slate-600 text-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-slate-400',
      'medium': 'text-blue-400',
      'high': 'text-amber-400',
      'urgent': 'text-red-400'
    };
    return colors[priority] || 'text-slate-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return <span className="text-red-400">Overdue</span>;
    if (days === 0) return <span className="text-amber-400">Today</span>;
    if (days === 1) return <span className="text-amber-400">Tomorrow</span>;
    if (days < 7) return <span className="text-slate-400">In {days} days</span>;
    
    return <span className="text-slate-400">{date.toLocaleDateString()}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-400">Here's what's happening with your projects</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Projects</span>
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalProjects}</div>
          </div>

          {/* Total Tasks */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Tasks</span>
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalTasks}</div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Completed</span>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completedTasks}</div>
            <div className="text-sm text-emerald-400 mt-1">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Overdue</span>
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">{stats.overdueTasks}</div>
            {stats.overdueTasks > 0 && (
              <div className="text-sm text-red-400 mt-1">Needs attention</div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Tasks - Takes 2 columns */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">My Tasks</h2>
              <Link 
                to="/projects"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                View all →
              </Link>
            </div>
            <div className="p-6">
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No tasks assigned to you yet
                </div>
              ) : (
                <div className="space-y-3">
                  {myTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link 
                            to={`/tasks/${task.id}`}
                            className="text-white font-medium hover:text-indigo-400 transition"
                          >
                            {task.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority} priority
                            </span>
                            <span className="text-xs text-slate-400">
                              {task.project?.name}
                            </span>
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="text-sm ml-4">
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                        {activity.type === 'task_created' && (
                          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        {activity.type === 'task_completed' && (
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {activity.type === 'task_updated' && (
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {activity.type === 'comment_added' && (
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user?.name || 'Someone'}</span>
                          {' '}
                          <span className="text-slate-400">{activity.action}</span>
                        </p>
                        {activity.target && (
                          <Link 
                            to={activity.targetLink || '#'}
                            className="text-sm text-indigo-400 hover:text-indigo-300 truncate block"
                          >
                            {activity.target}
                          </Link>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
