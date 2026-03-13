// products/planora/@custom/dashboard/TimeReport.jsx - Time Reports UI
import { useState, useEffect } from 'react';

function formatHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function TimeReport({ projectId, projectName }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [view, setView] = useState('user'); // user | task | entries

  useEffect(() => {
    fetchReport();
  }, [projectId, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(
        `/api/time/projects/${projectId}/time-report?${params}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`/api/time/projects/${projectId}/time-report/export?${params}`, '_blank');
  };

  // Set quick date ranges
  const setThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const setThisMonth = () => {
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  if (loading && !report) {
    return <div className="text-slate-400 text-sm p-6">Loading time report...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Time Report — {projectName}
        </h2>
        <button
          onClick={exportCSV}
          className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs">From</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs">To</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={setThisWeek} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px] hover:bg-slate-600">This Week</button>
          <button onClick={setThisMonth} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px] hover:bg-slate-600">This Month</button>
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px] hover:bg-slate-600">All Time</button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Total Time</p>
              <p className="text-white text-2xl font-bold">{formatHours(report.summary.totalSeconds)}h</p>
              <p className="text-slate-500 text-xs">{formatDuration(report.summary.totalSeconds)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Billable Time</p>
              <p className="text-green-400 text-2xl font-bold">{formatHours(report.summary.billableSeconds)}h</p>
              <p className="text-slate-500 text-xs">
                {report.summary.totalSeconds > 0 
                  ? Math.round((report.summary.billableSeconds / report.summary.totalSeconds) * 100)
                  : 0}% billable
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Entries</p>
              <p className="text-white text-2xl font-bold">{report.summary.totalEntries}</p>
              <p className="text-slate-500 text-xs">{report.byUser.length} team members</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 mb-4">
            {['user', 'task', 'entries'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                By {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* By User */}
          {view === 'user' && (
            <div className="space-y-2">
              {report.byUser.map(item => (
                <div key={item.user.id} className="flex items-center justify-between py-2 px-3 rounded bg-slate-900/50">
                  <div>
                    <p className="text-white text-sm font-medium">{item.user.name}</p>
                    <p className="text-slate-500 text-xs">{item.entries} entries</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-mono">{formatHours(item.totalSeconds)}h</p>
                    {item.billableSeconds > 0 && (
                      <p className="text-green-400 text-xs">{formatHours(item.billableSeconds)}h billable</p>
                    )}
                  </div>
                </div>
              ))}
              {report.byUser.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No time entries found</p>
              )}
            </div>
          )}

          {/* By Task */}
          {view === 'task' && (
            <div className="space-y-2">
              {report.byTask.map(item => (
                <div key={item.task.id} className="flex items-center justify-between py-2 px-3 rounded bg-slate-900/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.task.title}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        item.task.status === 'done' ? 'bg-green-900/50 text-green-400' :
                        item.task.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {item.task.status}
                      </span>
                      <span className="text-slate-500">{item.entries} entries</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white text-sm font-mono">{formatHours(item.totalSeconds)}h</p>
                    {item.billableSeconds > 0 && (
                      <p className="text-green-400 text-xs">{formatHours(item.billableSeconds)}h billable</p>
                    )}
                  </div>
                </div>
              ))}
              {report.byTask.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No time entries found</p>
              )}
            </div>
          )}

          {/* All Entries */}
          {view === 'entries' && (
            <div className="space-y-1">
              {report.entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded bg-slate-900/50 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{entry.description || 'No description'}</span>
                      {entry.billable && <span className="text-green-400 text-[10px]">$</span>}
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      {entry.user?.name} &middot; {entry.task?.title} &middot; {new Date(entry.startTime).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-white font-mono ml-4">
                    {entry.duration ? formatDuration(entry.duration) : 'Running'}
                  </span>
                </div>
              ))}
              {report.entries.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No time entries found</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TimeReport;
