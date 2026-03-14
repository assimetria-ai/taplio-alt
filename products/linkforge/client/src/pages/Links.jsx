import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import LinksTable from '../components/LinksTable';
import CreateLinkModal from '../components/CreateLinkModal';

export default function Links() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to fetch links');
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) =>
        l.slug?.toLowerCase().includes(q) ||
        l.targetUrl?.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q) ||
        l.customDomain?.domain?.toLowerCase().includes(q)
    );
  }, [links, search]);

  const handleCreate = async (data) => {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create link');
    }
    await fetchLinks();
  };

  const handleDelete = async (link) => {
    if (!confirm(`Delete link /${link.slug}?`)) return;
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Links</h1>
          <p className="text-slate-500 mt-1">
            {links.length} link{links.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 bg-[#3A8BFD] text-white rounded-lg text-sm font-medium hover:bg-[#2b7ae8] transition-colors"
        >
          <Plus size={16} />
          Create Link
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A8BFD]/30 focus:border-[#3A8BFD] transition-colors"
          />
        </div>
        {search && (
          <span className="text-sm text-slate-500">
            {filteredLinks.length} of {links.length} links
          </span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
          {error}
          <button onClick={fetchLinks} className="ml-3 underline">
            Retry
          </button>
        </div>
      ) : (
        <LinksTable
          links={filteredLinks}
          loading={loading}
          onDelete={handleDelete}
        />
      )}

      <CreateLinkModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
