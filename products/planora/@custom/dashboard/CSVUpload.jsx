// @custom/dashboard/CSVUpload.jsx - CSV Bulk Upload Component
import { useState, useRef } from 'react';

const STATUS_COLORS = {
  'todo': 'bg-slate-500',
  'in-progress': 'bg-blue-500',
  'review': 'bg-yellow-500',
  'stuck': 'bg-red-500',
  'done': 'bg-green-500'
};

const PRIORITY_COLORS = {
  'low': 'text-slate-400',
  'medium': 'text-blue-400',
  'high': 'text-orange-400',
  'urgent': 'text-red-400'
};

export default function CSVUpload({ projectId, onImportComplete, onClose }) {
  const [step, setStep] = useState('upload'); // upload | preview | importing | done
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrors(['Please upload a .csv file']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(e.target.result);
      handlePreview(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePreview = async (text) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await fetch(`/api/csv-upload/preview/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        credentials: 'include',
        body: text
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.error || 'Failed to parse CSV']);
        return;
      }
      setPreview(data);
      setStep('preview');
    } catch (err) {
      setErrors(['Failed to parse CSV. Please check the format.']);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    const validTasks = preview.preview.filter(r => !r.errors);
    if (validTasks.length === 0) {
      setErrors(['No valid tasks to import']);
      return;
    }

    setStep('importing');
    setLoading(true);
    try {
      const res = await fetch(`/api/csv-upload/import/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tasks: validTasks })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.error || 'Import failed']);
        setStep('preview');
        return;
      }
      setImportResult(data);
      setStep('done');
      if (onImportComplete) onImportComplete(data);
    } catch (err) {
      setErrors(['Import failed. Please try again.']);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/csv-upload/template', '_blank');
  };

  const reset = () => {
    setStep('upload');
    setCsvText('');
    setPreview(null);
    setErrors([]);
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Import Tasks from CSV</h2>
            <p className="text-sm text-slate-400 mt-1">
              {step === 'upload' && 'Upload a CSV file to bulk-create tasks'}
              {step === 'preview' && 'Review tasks before importing'}
              {step === 'importing' && 'Importing tasks...'}
              {step === 'done' && 'Import complete'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              {errors.map((e, i) => (
                <p key={i} className="text-red-400 text-sm">{e}</p>
              ))}
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-12 h-12 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-white font-medium mb-1">Drop your CSV file here</p>
                <p className="text-slate-400 text-sm">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>

              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-2">CSV Format</h3>
                <p className="text-slate-400 text-xs mb-3">
                  Your CSV should have a header row. Required column: <span className="text-white">title</span>.
                  Optional: description, status, priority, due_date, tags, assignee_email.
                </p>
                <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                  title,description,status,priority,due_date,tags<br/>
                  "Design homepage","Create responsive layout",todo,high,2026-04-01,"design|ui"<br/>
                  "Write tests","Unit tests for API",in-progress,medium,,
                </div>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download template CSV
                </button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div>
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 p-3 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{preview.totalRows}</p>
                  <p className="text-xs text-slate-400">Total rows</p>
                </div>
                <div className="flex-1 p-3 bg-green-900/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">{preview.validRows}</p>
                  <p className="text-xs text-slate-400">Valid</p>
                </div>
                {preview.invalidRows > 0 && (
                  <div className="flex-1 p-3 bg-red-900/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-400">{preview.invalidRows}</p>
                    <p className="text-xs text-slate-400">With errors</p>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="text-left p-3 text-slate-300 font-medium">#</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Title</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Status</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Priority</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Due Date</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t border-slate-700/50 ${row.errors ? 'bg-red-900/10' : ''}`}
                      >
                        <td className="p-3 text-slate-500">{row.row}</td>
                        <td className="p-3 text-white">
                          {row.title || <span className="text-red-400 italic">Missing</span>}
                        </td>
                        <td className="p-3">
                          {row.status && (
                            <span className={`px-2 py-0.5 rounded text-xs text-white ${STATUS_COLORS[row.status] || 'bg-slate-600'}`}>
                              {row.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium ${PRIORITY_COLORS[row.priority] || 'text-slate-400'}`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 text-xs">
                          {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {(row.tags || []).map((tag, ti) => (
                              <span key={ti} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Validation Errors */}
              {preview.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium mb-2">Warnings ({preview.errors.length})</p>
                  <div className="max-h-32 overflow-y-auto">
                    {preview.errors.map((e, i) => (
                      <p key={i} className="text-yellow-400/80 text-xs">{e}</p>
                    ))}
                  </div>
                  <p className="text-yellow-400/60 text-xs mt-2">
                    Rows with errors will be imported with default values where possible.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Importing {preview?.validRows} tasks...</p>
              <p className="text-slate-400 text-sm mt-1">This may take a moment</p>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && importResult && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Import Complete</h3>
              <p className="text-slate-400">
                Successfully imported <span className="text-green-400 font-medium">{importResult.imported}</span> tasks
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div>
            {step === 'preview' && (
              <button
                onClick={reset}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Upload different file
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              {step === 'done' ? 'Close' : 'Cancel'}
            </button>
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={loading || preview?.validRows === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {preview?.validRows} Task{preview?.validRows !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
