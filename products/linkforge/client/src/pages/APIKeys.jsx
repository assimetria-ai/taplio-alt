import React, { useState } from 'react';
import {
  Key, Plus, Copy, Check, Trash2, Eye, EyeOff, Clock,
  Shield, X, Loader2, AlertTriangle
} from 'lucide-react';

const MOCK_KEYS = [
  {
    id: '1', name: 'Production API', keyPrefix: 'lf_live_...8x4k',
    fullKey: 'lf_live_sk_a1b2c3d4e5f6g7h8x4k',
    permissions: ['links:read', 'links:write', 'analytics:read'],
    lastUsed: '2 minutes ago', created: 'Feb 15, 2026', requests: 12453,
  },
  {
    id: '2', name: 'Staging API', keyPrefix: 'lf_test_...9m2n',
    fullKey: 'lf_test_sk_z9y8x7w6v5u4t3s9m2n',
    permissions: ['links:read', 'links:write'],
    lastUsed: '3 hours ago', created: 'Mar 1, 2026', requests: 891,
  },
  {
    id: '3', name: 'Analytics Read-Only', keyPrefix: 'lf_live_...3p7q',
    fullKey: 'lf_live_sk_j1k2l3m4n5o6p7q3p7q',
    permissions: ['analytics:read'],
    lastUsed: '1 day ago', created: 'Mar 5, 2026', requests: 234,
  },
];

const PERMISSION_LABELS = {
  'links:read': 'Read Links',
  'links:write': 'Write Links',
  'analytics:read': 'Read Analytics',
  'analytics:write': 'Write Analytics',
  'domains:read': 'Read Domains',
  'domains:write': 'Write Domains',
  'webhooks:manage': 'Manage Webhooks',
};

function CreateKeyModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState(['links:read']);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const togglePermission = (perm) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCreate = () => {
    // Mock key creation
    setNewKey('lf_live_sk_' + Array.from({ length: 24 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join(''));
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {newKey ? 'API Key Created' : 'Create API Key'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {newKey ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Copy this key now. You won't be able to see it again.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-100 px-3 py-2.5 rounded-lg text-xs font-mono text-slate-800 break-all">
                {newKey}
              </code>
              <button onClick={copyKey} className="shrink-0 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-500" />}
              </button>
            </div>
            <button onClick={onClose}
              className="w-full h-9 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold hover:bg-blue-600">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Production API"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200
                                              hover:bg-slate-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={permissions.includes(key)}
                      onChange={() => togglePermission(key)}
                      className="rounded text-[#3A8BFD]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose}
                className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!name}
                className="h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                           hover:bg-blue-600 disabled:opacity-50">
                Create Key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function APIKeys() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">API Keys</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 rounded-lg bg-[#3A8BFD] hover:bg-blue-600 text-white
                     text-sm font-semibold flex items-center gap-1.5 transition"
        >
          <Plus size={16} /> Create Key
        </button>
      </div>

      {/* API Docs link */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Shield size={20} className="text-[#3A8BFD]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">API Documentation</p>
          <p className="text-xs text-blue-700">
            Base URL: <code className="bg-blue-100 px-1 rounded">https://api.linkforge.app/v1</code> — Rate limit: 1000 req/min
          </p>
        </div>
        <a href="#" className="text-sm font-medium text-[#3A8BFD] hover:underline">View Docs</a>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {MOCK_KEYS.map(key => (
          <div key={key.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Key size={20} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-slate-900">{key.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  <code className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                    {key.keyPrefix}
                  </code>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> Last used {key.lastUsed}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {key.requests.toLocaleString()} requests
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {key.permissions.map(perm => (
                  <span key={perm} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {PERMISSION_LABELS[perm] || perm}
                  </span>
                ))}
              </div>
              <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500
                                 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Webhooks</h2>
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
          <div className="text-slate-400 mb-2">
            <svg className="mx-auto w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No webhooks configured</p>
          <p className="text-xs text-slate-500 mt-1">Get real-time notifications for click events</p>
          <button className="mt-3 h-8 px-4 rounded-lg border border-slate-200 text-xs font-medium
                             text-slate-600 hover:bg-slate-50">
            Add Webhook
          </button>
        </div>
      </div>

      <CreateKeyModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
