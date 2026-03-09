// products/planora/@custom/components/FilterPanel.jsx
import { useState, useEffect } from 'react';

export default function FilterPanel({ filters, onFilterChange, onSaveFilter, savedFilters, onLoadFilter, onDeleteFilter }) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const statuses = ['todo', 'in-progress', 'review', 'done'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    
    if (Array.isArray(newFilters[key])) {
      if (newFilters[key].includes(value)) {
        newFilters[key] = newFilters[key].filter(v => v !== value);
      } else {
        newFilters[key] = [...newFilters[key], value];
      }
    } else {
      newFilters[key] = value;
    }
    
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: [],
      priority: [],
      assignee: null,
      search: '',
      tags: []
    });
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    
    await onSaveFilter(filterName, filters);
    setFilterName('');
    setShowSaveModal(false);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.status?.length > 0) count++;
    if (filters.priority?.length > 0) count++;
    if (filters.assignee) count++;
    if (filters.search) count++;
    if (filters.tags?.length > 0) count++;
    return count;
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isOpen || activeFilterCount() > 0
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>Filters</span>
        {activeFilterCount() > 0 && (
          <span className="bg-white text-indigo-600 text-xs rounded-full px-2 py-0.5 font-semibold">
            {activeFilterCount()}
          </span>
        )}
      </button>

      {/* Filter Panel Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-40">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status)}
                      onChange={() => handleFilterChange('status', status)}
                      className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-white capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority?.includes(priority)}
                      onChange={() => handleFilterChange('priority', priority)}
                      className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-white capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Saved Filters */}
            {savedFilters && savedFilters.length > 0 && (
              <div className="mb-4 pt-4 border-t border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Saved Filters
                </label>
                <div className="space-y-1">
                  {savedFilters.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-700"
                    >
                      <button
                        onClick={() => onLoadFilter(saved.filterData)}
                        className="flex-1 text-left text-white text-sm"
                      >
                        {saved.name}
                      </button>
                      <button
                        onClick={() => onDeleteFilter(saved.id)}
                        className="text-slate-400 hover:text-red-400 ml-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Current Filter */}
            <div className="pt-4 border-t border-slate-700">
              {!showSaveModal ? (
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={activeFilterCount() === 0}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Current Filter
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Filter name..."
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveFilter}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveModal(false);
                        setFilterName('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
