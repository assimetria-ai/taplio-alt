/**
 * Links Table Component
 * Task #10278 - Create dashboard links list UI
 * 
 * Displays links in a table with:
 * - Short URL, target URL, click count, created date
 * - Search and filter functionality
 * - Copy-to-clipboard for short URLs
 */

import React, { useState, useMemo } from 'react';
import { 
  ClipboardIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  TrashIcon,
  PencilIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function LinksTable({ links, onDelete, onEdit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [copiedId, setCopiedId] = useState(null);

  // Filter and sort links
  const filteredAndSortedLinks = useMemo(() => {
    let filtered = links;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = links.filter(link =>
        link.slug.toLowerCase().includes(query) ||
        link.targetUrl.toLowerCase().includes(query) ||
        (link.customDomain?.domain || '').toLowerCase().includes(query)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle dates
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle numbers
      if (sortField === 'clicks') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [links, searchQuery, sortField, sortDirection]);

  // Copy short URL to clipboard
  const copyToClipboard = async (link) => {
    const shortUrl = getShortUrl(link);
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download QR code
  const downloadQRCode = async (link, format = 'png') => {
    try {
      const url = `/api/qrcode/${link.slug}?format=${format}&size=500&download=1`;
      
      // Open in new tab to trigger download
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  // Get full short URL
  const getShortUrl = (link) => {
    const domain = link.customDomain?.domain || window.location.host;
    const protocol = link.customDomain?.sslStatus === 'active' ? 'https' : 'http';
    return `${protocol}://${domain}/${link.slug}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Truncate long URLs
  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort indicator
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-xs">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (links.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-gray-400 mb-4">
          <ChartBarIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No links yet
        </h3>
        <p className="text-gray-500 mb-6">
          Create your first short link to get started
        </p>
        <button className="btn btn-primary">
          Create Link
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search links by slug, URL, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredAndSortedLinks.length} of {links.length} links
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('slug')}
              >
                Short URL <SortIndicator field="slug" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target URL
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('clicks')}
              >
                Clicks <SortIndicator field="clicks" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Created <SortIndicator field="createdAt" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedLinks.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                {/* Short URL */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === link.id ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClipboardIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <a
                        href={getShortUrl(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {link.customDomain?.domain ? 
                          `${link.customDomain.domain}/` : 
                          ''}
                        {link.slug}
                      </a>
                    </div>
                  </div>
                </td>

                {/* Target URL */}
                <td className="px-6 py-4">
                  <a
                    href={link.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                    title={link.targetUrl}
                  >
                    {truncateUrl(link.targetUrl)}
                  </a>
                </td>

                {/* Click Count */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {link.clicks.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(link.createdAt)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(link.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => downloadQRCode(link, 'png')}
                      className="p-2 hover:bg-purple-50 text-purple-600 rounded transition-colors"
                      title="Download QR code"
                    >
                      <QrCodeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(link)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                      title="Edit link"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(link)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                      title="Delete link"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing {filteredAndSortedLinks.length} of {links.length} links
          </div>
          <div className="text-gray-600">
            Total clicks: {links.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
