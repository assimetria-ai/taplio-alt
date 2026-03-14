import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save } from 'lucide-react';

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [defaultDomain, setDefaultDomain] = useState('lnk.to');
  const [defaultRedirect, setDefaultRedirect] = useState('301');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your workspace and account preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-blue-50 text-[#3A8BFD]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {tab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Workspace Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
                    <input
                      type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Domain</label>
                    <select
                      value={defaultDomain} onChange={e => setDefaultDomain(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="lnk.to">lnk.to</option>
                      <option value="go.acme.com">go.acme.com</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Redirect Type</label>
                    <select
                      value={defaultRedirect} onChange={e => setDefaultRedirect(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="301">301 (Permanent)</option>
                      <option value="302">302 (Temporary)</option>
                      <option value="307">307 (Temporary Redirect)</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                                   hover:bg-blue-600 flex items-center gap-2">
                  <Save size={14} /> Save Changes
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">Permanently delete this workspace and all its data.</p>
                <button className="h-9 px-4 rounded-lg border border-red-200 text-sm font-medium
                                   text-red-600 hover:bg-red-50">
                  Delete Workspace
                </button>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Profile</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3A8BFD] to-purple-500
                                flex items-center justify-center text-xl font-bold text-white">
                  RP
                </div>
                <button className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium
                                   text-slate-600 hover:bg-slate-50">
                  Change Avatar
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" defaultValue="Rui Pedro"
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" defaultValue="rui@acme.com"
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <button className="h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                                   hover:bg-blue-600 flex items-center gap-2">
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email digest of weekly analytics', desc: 'Get a summary of clicks and top links every Monday' },
                  { label: 'Link milestone alerts', desc: 'Notify when a link reaches 100, 1K, 10K clicks' },
                  { label: 'Team activity', desc: 'New members, link changes, domain updates' },
                  { label: 'API usage alerts', desc: 'Alert when nearing rate limits' },
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 2}
                      className="mt-0.5 rounded text-[#3A8BFD] focus:ring-blue-500/20" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Change Password</h3>
                <div className="space-y-3 max-w-sm">
                  <input type="password" placeholder="Current password"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="password" placeholder="New password"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="password" placeholder="Confirm new password"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <button className="h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold hover:bg-blue-600">
                    Update Password
                  </button>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-500 mb-3">Add an extra layer of security to your account.</p>
                <button className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
