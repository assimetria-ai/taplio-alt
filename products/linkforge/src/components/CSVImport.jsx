/**
 * CSV Import Component
 * Task #10314 - Build bulk link import via CSV
 * 
 * Handles CSV file upload for bulk link creation
 * Features:
 * - Drag and drop upload
 * - CSV validation
 * - Progress tracking
 * - Error reporting
 * - Template download
 */

import React, { useState, useRef } from 'react';
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CSVImport({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setValidation(null);
    setResults(null);
    
    // Auto-validate on selection
    validateFile(selectedFile);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  // Validate CSV file
  const validateFile = async (fileToValidate) => {
    setValidating(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileToValidate);

    try {
      const response = await fetch('/api/import/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Validation failed');
      }

      const data = await response.json();
      setValidation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  // Upload and import CSV
  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import/csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Import failed');
      }

      const data = await response.json();
      setResults(data.results);
      
      if (data.success && onImportComplete) {
        onImportComplete(data.results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    window.location.href = '/api/import/template';
  };

  // Reset form
  const reset = () => {
    setFile(null);
    setValidation(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Bulk Import Links
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV file to create multiple links at once
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn btn-secondary btn-sm flex items-center space-x-2"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* Upload Area */}
      {!results && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your CSV file here, or
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="btn btn-primary cursor-pointer inline-block"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-4">
                CSV files only • Maximum 1000 links • 5MB max
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <DocumentArrowUpIcon className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {validating && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Validating...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      {validation && !results && (
        <div className="card p-6 space-y-4">
          <div className="flex items-start space-x-3">
            {validation.ready ? (
              <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {validation.ready ? 'Ready to Import' : 'Validation Issues Found'}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total rows: {validation.totalRows}</p>
                <p>Valid: <span className="text-green-600 font-medium">{validation.validation.valid}</span></p>
                {validation.validation.invalid > 0 && (
                  <p>Invalid: <span className="text-red-600 font-medium">{validation.validation.invalid}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {validation.validation.preview && validation.validation.preview.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Preview (first 10 rows)</h5>
              <div className="bg-gray-50 rounded border border-gray-200 p-3 max-h-64 overflow-auto">
                {validation.validation.preview.map((item) => (
                  <div key={item.row} className="text-xs font-mono mb-2 pb-2 border-b border-gray-200 last:border-0">
                    <div><span className="text-gray-500">Row {item.row}:</span> {item.slug} → {item.targetUrl}</div>
                    {item.title && <div className="text-gray-600">  Title: {item.title}</div>}
                    {item.tags && item.tags.length > 0 && (
                      <div className="text-gray-600">  Tags: {item.tags.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {validation.validation.errors && validation.validation.errors.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-700 mb-2">
                Errors ({validation.validation.errors.length})
              </h5>
              <div className="bg-red-50 rounded border border-red-200 p-3 max-h-48 overflow-auto">
                {validation.validation.errors.slice(0, 10).map((err, i) => (
                  <div key={i} className="text-xs text-red-700 mb-1">
                    Row {err.row}: {err.error}
                  </div>
                ))}
                {validation.validation.errors.length > 10 && (
                  <div className="text-xs text-red-600 mt-2">
                    ... and {validation.validation.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            {validation.ready ? (
              <button
                onClick={handleImport}
                disabled={uploading}
                className="btn btn-primary flex-1"
              >
                {uploading ? 'Importing...' : `Import ${validation.totalRows} Links`}
              </button>
            ) : (
              <div className="flex-1 text-center py-2 text-sm text-gray-600">
                Fix errors in your CSV and re-upload
              </div>
            )}
            <button onClick={reset} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import Results */}
      {results && (
        <div className="card p-6 space-y-4">
          <div className="flex items-start space-x-3">
            {results.failed === 0 ? (
              <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Import Complete
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.successful}
                  </div>
                  <div className="text-xs text-gray-500">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {results.total}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Created Links */}
          {results.links && results.links.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Created Links ({results.links.length})
              </h5>
              <div className="bg-gray-50 rounded border border-gray-200 p-3 max-h-64 overflow-auto">
                {results.links.slice(0, 20).map((link, i) => (
                  <div key={i} className="text-xs font-mono mb-1 text-gray-700">
                    {link.shortUrl} → {link.targetUrl}
                  </div>
                ))}
                {results.links.length > 20 && (
                  <div className="text-xs text-gray-500 mt-2">
                    ... and {results.links.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {results.errors && results.errors.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-700 mb-2">
                Errors ({results.errors.length})
              </h5>
              <div className="bg-red-50 rounded border border-red-200 p-3 max-h-48 overflow-auto">
                {results.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-700 mb-2 pb-2 border-b border-red-200 last:border-0">
                    <div>Row {err.row}: {err.error}</div>
                    {err.data && (
                      <div className="text-red-600 mt-1 ml-2">
                        Data: {JSON.stringify(err.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={reset}
              className="btn btn-primary flex-1"
            >
              Import Another File
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          CSV Format Guide
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>Required column:</strong> targetUrl (or url, target_url)</p>
          <p><strong>Optional columns:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>slug - Custom short code (auto-generated if omitted)</li>
            <li>title - Link title/description</li>
            <li>tags - Comma-separated tags (e.g., "marketing,campaign")</li>
          </ul>
          <p className="mt-2"><strong>Example:</strong></p>
          <code className="block bg-white p-2 rounded text-xs mt-1">
            targetUrl,slug,title,tags<br />
            https://example.com,promo,Promo Page,"marketing,sale"
          </code>
        </div>
      </div>
    </div>
  );
}
