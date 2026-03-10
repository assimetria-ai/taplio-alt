/**
 * Import Page Component
 * Task #10314 - Build bulk link import via CSV
 * 
 * Dedicated page for CSV bulk import
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CSVImport from '../components/CSVImport';

export default function Import() {
  const navigate = useNavigate();

  const handleImportComplete = (results) => {
    console.log('Import complete:', results);
    // Could show a success notification here
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bulk Import Links
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file to create multiple short links at once
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CSVImport onImportComplete={handleImportComplete} />
      </main>
    </div>
  );
}
