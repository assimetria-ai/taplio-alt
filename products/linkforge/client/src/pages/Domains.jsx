import React, { useState, useEffect } from 'react';
import {
  Globe, Plus, CheckCircle2, Clock, AlertTriangle, Trash2,
  RefreshCw, Shield, X, Loader2, Copy, Check
} from 'lucide-react';
import { api } from '../lib/api';

const STATUS_CONFIG = {
  active: { icon: CheckCircle2, label: 'Active', color: 'text-green-600 bg-green-50' },
  verified: { icon: CheckCircle2, label: 'Verified', color: 'text-green-600 bg-green-50' },
  pending: { icon: Clock, label: 'Pending DNS', color: 'text-amber-600 bg-amber-50' },
  failed: { icon: AlertTriangle, label: 'Failed', color: 'text-red-500 bg-red-50' },
};

const MOCK_DOMAINS = [
  { id: '1', domain: 'go.acme.com', status: 'active', sslStatus: 'active', verifiedAt: '2026-03-01', linksCount: 423 },
  { id: '2', domain: 'link.brand.io', status: 'active', sslStatus: 'active', verifiedAt: '2026-02-15', linksCount: 187 },
  { id: '3', domain: 'click.startup.co', status: 'pending', sslStatus: 'pending', verifiedAt: null, linksCount: 0 },
  { id: '4', domain: 'go.newsite.com', status: 'pending', sslStatus: 'pending', verifiedAt: null, linksCount: 0 },
];

function AddDomainModal({ open, onClose, onAdded }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.addDomain({ domain });
      onAdded();
      onClose();
      setDomain('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Custom Domain</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
            <input
              type="text" required value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="go.yourcompany.com"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-2">DNS Configuration Required</p>
            <p>After adding, create a CNAME record pointing to <code className="bg-slate-200 px-1 rounded text-xs">links.linkforge.app</code></p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="h-9 px-4 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                         hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Add Domain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Domains() {
  const [domains, setDomains] = useState(MOCK_DOMAINS);
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyDNS = (id) => {
    navigator.clipboard.writeText('links.linkforge.app');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Custom Domains</h1>
          <p className="text-sm text-slate-500 mt-0.5">Connect your own domains for branded short links</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="h-9 px-4 rounded-lg bg-[#3A8BFD] hover:bg-blue-600 text-white
                     text-sm font-semibold flex items-center gap-1.5 transition"
        >
          <Plus size={16} /> Add Domain
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-500">Total Domains</div>
          <div className="text-2xl font-bold text-slate-900">{domains.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {domains.filter(d => d.status === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-500">Pending Verification</div>
          <div className="text-2xl font-bold text-amber-600">
            {domains.filter(d => d.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Domain List */}
      <div className="space-y-4">
        {domains.map(domain => {
          const status = STATUS_CONFIG[domain.status] || STATUS_CONFIG.pending;
          const StatusIcon = status.icon;
          return (
            <div key={domain.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Globe size={20} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-slate-900">{domain.domain}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${status.color}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                    {domain.sslStatus === 'active' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-600">
                        <Shield size={12} /> SSL Active
                      </span>
                    )}
                    {domain.linksCount > 0 && (
                      <span className="text-[11px] text-slate-500">
                        {domain.linksCount} links
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {domain.status === 'pending' && (
                    <div className="text-right mr-4">
                      <div className="text-[11px] text-slate-500 mb-1">CNAME Target:</div>
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700">
                          links.linkforge.app
                        </code>
                        <button
                          onClick={() => copyDNS(domain.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400"
                        >
                          {copiedId === domain.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {domain.status === 'pending' && (
                    <button className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium
                                       text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
                      <RefreshCw size={12} /> Verify
                    </button>
                  )}
                  <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddDomainModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={() => {}} />
    </div>
  );
}
