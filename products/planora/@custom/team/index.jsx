// products/planora/@custom/team/index.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import MemberList from './MemberList';
import InviteModal from './InviteModal';
import WorkspaceSettings from './WorkspaceSettings';

export default function TeamManagement() {
  const { projectId } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [workspaceSettings, setWorkspaceSettings] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // members, settings

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId || currentProject) {
      const id = projectId || currentProject?.id;
      if (id) {
        fetchMembers(id);
        fetchSettings(id);
      }
    }
  }, [projectId, currentProject]);

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
        if (!projectId && data.projects.length > 0) {
          setCurrentProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (id) => {
    try {
      const res = await fetch(`/api/team/projects/${id}/members`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchSettings = async (id) => {
    try {
      const res = await fetch(`/api/team/projects/${id}/settings`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceSettings(data.project);
        setUserRole(data.userRole);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleInviteMember = async (email, role) => {
    const id = projectId || currentProject?.id;
    if (!id) return;

    try {
      const res = await fetch(`/api/team/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, role })
      });

      if (res.ok) {
        const data = await res.json();
        setMembers([...members, data.member]);
        setShowInviteModal(false);
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      console.error('Failed to invite member:', err);
      return { success: false, error: 'Server error' };
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    const id = projectId || currentProject?.id;
    if (!id) return;

    try {
      const res = await fetch(`/api/team/projects/${id}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        const data = await res.json();
        setMembers(members.map(m => m.id === memberId ? data.member : m));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const id = projectId || currentProject?.id;
    if (!id) return;

    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const res = await fetch(`/api/team/projects/${id}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMembers(members.filter(m => m.id !== memberId));
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleUpdateSettings = async (updates) => {
    const id = projectId || currentProject?.id;
    if (!id) return;

    try {
      const res = await fetch(`/api/team/projects/${id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setWorkspaceSettings(data.project);
        // Update in projects list
        setProjects(projects.map(p => p.id === id ? { ...p, ...data.project } : p));
        if (currentProject?.id === id) {
          setCurrentProject({ ...currentProject, ...data.project });
        }
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const canManageTeam = userRole === 'owner' || userRole === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const activeProject = projectId 
    ? projects.find(p => p.id === projectId) 
    : currentProject;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        projects={projects}
        currentProject={activeProject}
        onSelectProject={setCurrentProject}
        onCreateProject={() => {/* TODO */}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Team & Workspace
              </h1>
              <p className="text-sm text-slate-400">
                Manage your team members and workspace settings
              </p>
            </div>

            {canManageTeam && activeTab === 'members' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-slate-800 border-b border-slate-700 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Team Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Workspace Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {!activeProject ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-white mb-2">
                No workspace selected
              </h2>
              <p className="text-slate-400">
                Select a workspace from the sidebar to manage team
              </p>
            </div>
          ) : activeTab === 'members' ? (
            <MemberList
              members={members}
              currentUserId={user?.id}
              userRole={userRole}
              canManage={canManageTeam}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
            />
          ) : (
            <WorkspaceSettings
              settings={workspaceSettings}
              userRole={userRole}
              canEdit={canManageTeam}
              onUpdate={handleUpdateSettings}
            />
          )}
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}
    </div>
  );
}
