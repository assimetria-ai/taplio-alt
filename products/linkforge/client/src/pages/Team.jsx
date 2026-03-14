import React, { useState } from 'react';
import {
  Users, Plus, Crown, Shield, Eye, MoreHorizontal, Mail,
  X, Loader2, Trash2, ChevronDown
} from 'lucide-react';

const ROLES = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-600 bg-amber-50' },
  editor: { label: 'Editor', icon: Shield, color: 'text-blue-600 bg-blue-50' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-slate-600 bg-slate-100' },
};

const MOCK_MEMBERS = [
  { id: '1', name: 'Rui Pedro', email: 'rui@acme.com', role: 'owner', avatar: 'RP', linksCreated: 342, lastActive: '2 min ago' },
  { id: '2', name: 'Ana Silva', email: 'ana@acme.com', role: 'editor', avatar: 'AS', linksCreated: 187, lastActive: '1 hour ago' },
  { id: '3', name: 'Marco Santos', email: 'marco@acme.com', role: 'editor', avatar: 'MS', linksCreated: 95, lastActive: '3 hours ago' },
  { id: '4', name: 'Sofia Costa', email: 'sofia@acme.com', role: 'viewer', avatar: 'SC', linksCreated: 0, lastActive: '1 day ago' },
  { id: '5', name: 'Pedro Almeida', email: 'pedro@acme.com', role: 'editor', avatar: 'PA', linksCreated: 124, lastActive: '5 hours ago' },
];

const MOCK_ACTIVITY = [
  { user: 'Ana Silva', action: 'created link', target: 'lnk.to/spring', time: '2 hours ago' },
  { user: 'Marco Santos', action: 'deleted link', target: 'lnk.to/old-promo', time: '3 hours ago' },
  { user: 'Rui Pedro', action: 'added domain', target: 'go.acme.com', time: '1 day ago' },
  { user: 'Pedro Almeida', action: 'created link', target: 'lnk.to/meeting', time: '1 day ago' },
  { user: 'Ana Silva', action: 'updated link', target: 'lnk.to/demo', time: '2 days ago' },
];

function InviteModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Invite Team Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role} onChange={e => setRole(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="editor">Editor — can create and manage links</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose}
              className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button className="h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold hover:bg-blue-600
                               flex items-center gap-2">
              <Mail size={14} /> Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage workspace members and roles</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="h-9 px-4 rounded-lg bg-[#3A8BFD] hover:bg-blue-600 text-white
                     text-sm font-semibold flex items-center gap-1.5 transition"
        >
          <Plus size={16} /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Members */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Members ({MOCK_MEMBERS.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_MEMBERS.map(member => {
              const role = ROLES[member.role];
              const RoleIcon = role.icon;
              return (
                <div key={member.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A8BFD] to-purple-500
                                  flex items-center justify-center text-sm font-semibold text-white">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${role.color}`}>
                    <RoleIcon size={12} /> {role.label}
                  </span>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-700">{member.linksCreated} links</div>
                    <div className="text-xs text-slate-400">{member.lastActive}</div>
                  </div>
                  {member.role !== 'owner' && (
                    <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500
                                       opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Activity Log</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_ACTIVITY.map((item, i) => (
              <div key={i} className="px-5 py-3">
                <div className="text-sm text-slate-700">
                  <span className="font-medium">{item.user}</span>{' '}
                  <span className="text-slate-500">{item.action}</span>{' '}
                  <span className="font-mono text-xs text-[#3A8BFD]">{item.target}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}
