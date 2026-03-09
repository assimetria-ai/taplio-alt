// products/planora/@custom/dashboard/Settings.jsx
// Settings page - account, workspace, and notification management
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('account'); // account, workspace, notifications, billing
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Account settings state
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Workspace settings state
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'monday'
  });

  // Notification settings state
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    taskAssigned: true,
    taskCompleted: true,
    taskComments: true,
    projectInvites: true,
    weeklyDigest: true,
    pushNotifications: false,
    browserNotifications: true
  });

  useEffect(() => {
    fetchUser();
    fetchProjects();
    fetchWorkspaceSettings();
    fetchNotificationSettings();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAccountData(prev => ({
          ...prev,
          name: data.user.name || '',
          email: data.user.email || ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchWorkspaceSettings = async () => {
    try {
      const res = await fetch('/api/workspace/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceData(data.settings || workspaceData);
      }
    } catch (err) {
      console.error('Failed to fetch workspace settings:', err);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch('/api/user/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotificationData(data.settings || notificationData);
      }
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        name: accountData.name,
        email: accountData.email
      };

      if (accountData.newPassword) {
        if (accountData.newPassword !== accountData.confirmPassword) {
          showMessage('Passwords do not match', 'error');
          setSaving(false);
          return;
        }
        updates.currentPassword = accountData.currentPassword;
        updates.newPassword = accountData.newPassword;
      }

      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        showMessage('Account updated successfully');
        setAccountData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        fetchUser();
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to update account', 'error');
      }
    } catch (err) {
      showMessage('Failed to update account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkspaceUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(workspaceData)
      });

      if (res.ok) {
        showMessage('Workspace settings updated');
      } else {
        showMessage('Failed to update workspace settings', 'error');
      }
    } catch (err) {
      showMessage('Failed to update workspace settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(notificationData)
      });

      if (res.ok) {
        showMessage('Notification preferences updated');
      } else {
        showMessage('Failed to update notifications', 'error');
      }
    } catch (err) {
      showMessage('Failed to update notifications', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'workspace', label: 'Workspace', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'billing', label: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar
        user={user}
        projects={projects}
        currentProject={null}
        onSelectProject={() => {}}
        onCreateProject={() => {}}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your account and workspace preferences</p>
            </div>
          </div>
        </header>

        {/* Message Banner */}
        {message && (
          <div className={`px-6 py-3 ${message.type === 'error' ? 'bg-red-500/10 border-b border-red-500/20' : 'bg-green-500/10 border-b border-green-500/20'}`}>
            <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="flex-1 flex">
          {/* Tabs Sidebar */}
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>

                  <form onSubmit={handleAccountUpdate} className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={accountData.name}
                            onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={accountData.email}
                            onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Profile Picture
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <button
                              type="button"
                              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Upload Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={accountData.currentPassword}
                            onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.newPassword}
                            onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.confirmPassword}
                            onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Confirm your new password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Workspace Settings */}
              {activeTab === 'workspace' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Workspace Settings</h2>

                  <form onSubmit={handleWorkspaceUpdate} className="space-y-6">
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">General</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Workspace Name
                          </label>
                          <input
                            type="text"
                            value={workspaceData.name}
                            onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="My Workspace"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Locale & Formatting</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Timezone
                          </label>
                          <select
                            value={workspaceData.timezone}
                            onChange={(e) => setWorkspaceData({ ...workspaceData, timezone: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                            <option value="America/Chicago">Central Time (US & Canada)</option>
                            <option value="America/Denver">Mountain Time (US & Canada)</option>
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                            <option value="Australia/Sydney">Sydney</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Date Format
                          </label>
                          <select
                            value={workspaceData.dateFormat}
                            onChange={(e) => setWorkspaceData({ ...workspaceData, dateFormat: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY (03/15/2024)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (15/03/2024)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-03-15)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Time Format
                          </label>
                          <select
                            value={workspaceData.timeFormat}
                            onChange={(e) => setWorkspaceData({ ...workspaceData, timeFormat: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="12h">12-hour (2:30 PM)</option>
                            <option value="24h">24-hour (14:30)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Week Starts On
                          </label>
                          <select
                            value={workspaceData.weekStart}
                            onChange={(e) => setWorkspaceData({ ...workspaceData, weekStart: e.target.value })}
                            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="sunday">Sunday</option>
                            <option value="monday">Monday</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>

                  <form onSubmit={handleNotificationUpdate} className="space-y-6">
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Email Notifications</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Enable Email Notifications</div>
                            <div className="text-xs text-slate-400">Receive notifications via email</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.emailNotifications}
                            onChange={(e) => setNotificationData({ ...notificationData, emailNotifications: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>

                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Task Assigned</div>
                            <div className="text-xs text-slate-400">When someone assigns you a task</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.taskAssigned}
                            onChange={(e) => setNotificationData({ ...notificationData, taskAssigned: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                            disabled={!notificationData.emailNotifications}
                          />
                        </label>

                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Task Completed</div>
                            <div className="text-xs text-slate-400">When a task you created is completed</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.taskCompleted}
                            onChange={(e) => setNotificationData({ ...notificationData, taskCompleted: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                            disabled={!notificationData.emailNotifications}
                          />
                        </label>

                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Task Comments</div>
                            <div className="text-xs text-slate-400">When someone comments on your tasks</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.taskComments}
                            onChange={(e) => setNotificationData({ ...notificationData, taskComments: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                            disabled={!notificationData.emailNotifications}
                          />
                        </label>

                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Project Invites</div>
                            <div className="text-xs text-slate-400">When you're invited to a project</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.projectInvites}
                            onChange={(e) => setNotificationData({ ...notificationData, projectInvites: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                            disabled={!notificationData.emailNotifications}
                          />
                        </label>

                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Weekly Digest</div>
                            <div className="text-xs text-slate-400">Weekly summary of your activity</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.weeklyDigest}
                            onChange={(e) => setNotificationData({ ...notificationData, weeklyDigest: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                            disabled={!notificationData.emailNotifications}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Browser Notifications</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Enable Browser Notifications</div>
                            <div className="text-xs text-slate-400">Show desktop notifications in your browser</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.browserNotifications}
                            onChange={(e) => setNotificationData({ ...notificationData, browserNotifications: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Mobile Push Notifications</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">Enable Push Notifications</div>
                            <div className="text-xs text-slate-400">Receive push notifications on mobile devices</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationData.pushNotifications}
                            onChange={(e) => setNotificationData({ ...notificationData, pushNotifications: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Billing & Subscription</h2>

                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-white">Free Plan</div>
                          <div className="text-sm text-slate-400 mt-1">Up to 5 team members</div>
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Upgrade to Pro
                        </button>
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Team Members</div>
                            <div className="text-white font-medium">3 / 5</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Projects</div>
                            <div className="text-white font-medium">Unlimited</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-slate-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Payment Method</h3>
                        <button className="text-sm text-indigo-400 hover:text-indigo-300">
                          Add Payment Method
                        </button>
                      </div>
                      
                      <div className="text-sm text-slate-400">
                        No payment method on file
                      </div>
                    </div>

                    {/* Billing History */}
                    <div className="bg-slate-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Billing History</h3>
                      
                      <div className="text-sm text-slate-400">
                        No billing history available
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
