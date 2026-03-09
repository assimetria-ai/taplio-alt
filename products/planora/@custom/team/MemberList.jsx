// products/planora/@custom/team/MemberList.jsx
import { useState } from 'react';

const roleColors = {
  owner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  member: 'bg-green-500/10 text-green-400 border-green-500/20',
  viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Can manage team and settings' },
  { value: 'member', label: 'Member', description: 'Can create and edit tasks' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view tasks' }
];

export default function MemberList({ 
  members, 
  currentUserId, 
  userRole, 
  canManage, 
  onUpdateRole, 
  onRemoveMember 
}) {
  const [editingRole, setEditingRole] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRoleChange = (memberId, newRole) => {
    onUpdateRole(memberId, newRole);
    setEditingRole(null);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Team Members
        </h2>
        <p className="text-slate-400">
          Manage who has access to this workspace
        </p>
      </div>

      {/* Members Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Joined
              </th>
              {canManage && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white flex items-center">
                        {member.user.name}
                        {member.userId === currentUserId && (
                          <span className="ml-2 text-xs text-slate-400">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingRole === member.id && canManage && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                      className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      onClick={() => canManage && member.role !== 'owner' && setEditingRole(member.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        roleColors[member.role]
                      } ${canManage && member.role !== 'owner' ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {formatDate(member.createdAt)}
                </td>
                {canManage && (
                  <td className="px-6 py-4 text-right text-sm">
                    {member.role !== 'owner' && member.userId !== currentUserId && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Descriptions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleOptions.map(role => (
          <div key={role.value} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                roleColors[role.value]
              }`}>
                {role.label}
              </span>
            </div>
            <p className="text-sm text-slate-400">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
