/**
 * Dashboard Page Component
 * Task #10278 - Create dashboard links list UI
 * 
 * Main dashboard showing links table with management features
 */

import React, { useState, useEffect } from 'react';
import LinksTable from '../components/LinksTable';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch links from API
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }

      const data = await response.json();
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete link
  const handleDelete = async (link) => {
    if (!confirm(`Delete link "${link.slug}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      // Remove from local state
      setLinks(links.filter(l => l.id !== link.id));
    } catch (err) {
      alert(`Failed to delete link: ${err.message}`);
    }
  };

  // Handle edit link (placeholder)
  const handleEdit = (link) => {
    console.log('Edit link:', link);
    // TODO: Open edit modal/form
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LinkForge
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your short links
              </p>
            </div>
            <button className="btn btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Create Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Links
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {links.length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Clicks
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {links.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Avg. Clicks/Link
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {links.length > 0
                ? Math.round(links.reduce((sum, link) => sum + link.clicks, 0) / links.length)
                : 0}
            </div>
          </div>
        </div>

        {/* Links Table */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading links...</p>
          </div>
        ) : error ? (
          <div className="card p-6 text-center">
            <div className="text-red-600 mb-2">Error loading links</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchLinks}
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        ) : (
          <LinksTable 
            links={links} 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </main>
    </div>
  );
}
