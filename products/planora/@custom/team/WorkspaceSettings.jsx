// products/planora/@custom/team/WorkspaceSettings.jsx
import { useState, useEffect } from 'react';

const colorOptions = [
  { value: '#6366f1', label: 'Indigo', class: 'bg-indigo-600' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-600' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-600' },
  { value: '#f59e0b', label: 'Amber', class: 'bg-amber-600' },
  { value: '#10b981', label: 'Emerald', class: 'bg-emerald-600' },
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-600' },
  { value: '#ef4444', label: 'Red', class: 'bg-red-600' },
  { value: '#14b8a6', label: 'Teal', class: 'bg-teal-600' }
];

export default function WorkspaceSettings({ settings, userRole, canEdit, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setDescription(settings.description || '');
      setColor(settings.color || '#6366f1');
    }
  }, [settings]);

  const handleSave = () => {
    onUpdate({ name, description, color });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(settings.name || '');
    setDescription(settings.description || '');
    setColor(settings.color || '#6366f1');
    setEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400">Loading workspace settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Workspace Settings
        </h2>
        <p className="text-slate-400">
          Manage workspace information and preferences
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
        {/* Workspace Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Workspace Name
          </label>
          {editing && canEdit ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <div className="px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-700">
              {settings.name}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          {editing && canEdit ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="What is this workspace for?"
            />
          ) : (
            <div className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-700 min-h-[80px]">
              {settings.description || <span className="text-slate-500">No description</span>}
            </div>
          )}
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Color Theme
          </label>
          {editing && canEdit ? (
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    color === opt.value
                      ? 'bg-slate-700 border-white/30'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded ${opt.class}`} />
                  <span className="text-sm text-white">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-700">
              <div 
                className="w-8 h-8 rounded" 
                style={{ backgroundColor: settings.color }}
              />
              <span className="text-white">
                {colorOptions.find(c => c.value === settings.color)?.label || 'Custom'}
              </span>
            </div>
          )}
        </div>

        {/* Workspace Stats */}
        <div className="pt-6 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Workspace Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {settings._count?.members || 0}
              </div>
              <div className="text-xs text-slate-400">Team Members</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {settings._count?.tasks || 0}
              </div>
              <div className="text-xs text-slate-400">Total Tasks</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {userRole}
              </div>
              <div className="text-xs text-slate-400">Your Role</div>
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="pt-6 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Workspace Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Created By:</span>
              <span className="text-white">{settings.createdBy?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span className="text-white">{formatDate(settings.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-white">{formatDate(settings.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div className="pt-6 border-t border-slate-700 flex space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit Settings
              </button>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone (for owners) */}
      {userRole === 'owner' && (
        <div className="mt-8 bg-red-500/5 rounded-lg border border-red-500/20 p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Once you delete a workspace, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete Workspace
          </button>
        </div>
      )}
    </div>
  );
}
