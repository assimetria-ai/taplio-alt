// products/planora/@custom/dashboard/TimeTracker.jsx - Time Tracking UI
import { useState, useEffect, useRef } from 'react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatHours(seconds) {
  return (seconds / 3600).toFixed(1) + 'h';
}

function TimeTracker({ taskId, taskTitle, projectId }) {
  const [entries, setEntries] = useState([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [runningEntry, setRunningEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualBillable, setManualBillable] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchEntries();
    fetchCurrent();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [taskId]);

  useEffect(() => {
    if (runningEntry) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const start = new Date(runningEntry.startTime);
        setElapsed(Math.round((now - start) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runningEntry]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/time/tasks/${taskId}/time`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.timeEntries);
        setTotalSeconds(data.totalSeconds);
      }
    } catch (err) {
      console.error('Error fetching time entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrent = async () => {
    try {
      const res = await fetch('/api/time/time/current', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.timeEntry && data.timeEntry.taskId === taskId) {
          setRunningEntry(data.timeEntry);
        }
      }
    } catch (err) {
      console.error('Error fetching current timer:', err);
    }
  };

  const startTimer = async () => {
    try {
      const res = await fetch(`/api/time/tasks/${taskId}/time/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description, billable })
      });
      if (res.ok) {
        const data = await res.json();
        setRunningEntry(data.timeEntry);
        setDescription('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start timer');
      }
    } catch (err) {
      console.error('Error starting timer:', err);
    }
  };

  const stopTimer = async () => {
    if (!runningEntry) return;
    try {
      const res = await fetch(`/api/time/time/${runningEntry.id}/stop`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setRunningEntry(null);
        fetchEntries();
      }
    } catch (err) {
      console.error('Error stopping timer:', err);
    }
  };

  const pauseTimer = async () => {
    if (!runningEntry) return;
    try {
      const res = await fetch(`/api/time/time/${runningEntry.id}/pause`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setRunningEntry(null);
        fetchEntries();
      }
    } catch (err) {
      console.error('Error pausing timer:', err);
    }
  };

  const addManualEntry = async () => {
    const hours = parseFloat(manualHours);
    if (isNaN(hours) || hours <= 0) {
      alert('Please enter a valid number of hours');
      return;
    }
    const duration = Math.round(hours * 3600);
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - duration * 1000);

    try {
      const res = await fetch(`/api/time/tasks/${taskId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          description: manualDesc || null,
          billable: manualBillable
        })
      });
      if (res.ok) {
        setManualHours('');
        setManualDesc('');
        setManualBillable(false);
        setShowManual(false);
        fetchEntries();
      }
    } catch (err) {
      console.error('Error adding manual entry:', err);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      const res = await fetch(`/api/time/time/${entryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm p-4">Loading time entries...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Time Tracking
        </h3>
        <span className="text-xs text-slate-400">
          Total: {formatHours(totalSeconds + (runningEntry ? elapsed : 0))}
        </span>
      </div>

      {/* Timer Control */}
      {runningEntry ? (
        <div className="bg-slate-900 rounded-lg p-3 mb-4 border border-indigo-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs font-medium">Timer Running</span>
            </div>
            <span className="text-white font-mono text-lg">{formatDuration(elapsed)}</span>
          </div>
          {runningEntry.description && (
            <p className="text-slate-400 text-xs mb-2">{runningEntry.description}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={pauseTimer}
              className="flex-1 px-3 py-1.5 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded text-xs hover:bg-yellow-600/30 transition-colors"
            >
              Pause
            </button>
            <button
              onClick={stopTimer}
              className="flex-1 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-xs hover:bg-red-600/30 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={billable}
                onChange={e => setBillable(e.target.checked)}
                className="rounded border-slate-600"
              />
              $
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startTimer}
              className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors font-medium"
            >
              Start Timer
            </button>
            <button
              onClick={() => setShowManual(!showManual)}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors"
            >
              + Manual
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {showManual && (
        <div className="bg-slate-900 rounded-lg p-3 mb-4 border border-slate-600">
          <h4 className="text-slate-300 text-xs font-medium mb-2">Add Manual Entry</h4>
          <div className="space-y-2">
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={manualHours}
              onChange={e => setManualHours(e.target.value)}
              placeholder="Hours (e.g. 1.5)"
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualBillable}
                  onChange={e => setManualBillable(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Billable
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManual(false)}
                  className="px-3 py-1 text-slate-400 text-xs hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={addManualEntry}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-1">
          <h4 className="text-slate-400 text-xs font-medium mb-2">
            Recent Entries ({entries.length})
          </h4>
          {entries.slice(0, 10).map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-900/50 hover:bg-slate-900 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-xs truncate">
                    {entry.description || 'No description'}
                  </span>
                  {entry.billable && (
                    <span className="text-green-400 text-[10px] font-medium">$</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{entry.user?.name}</span>
                  <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-mono">
                  {entry.duration ? formatDuration(entry.duration) : 'Running'}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {entries.length > 10 && (
            <p className="text-slate-500 text-[10px] text-center pt-1">
              +{entries.length - 10} more entries
            </p>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-xs text-center py-2">No time entries yet</p>
      )}
    </div>
  );
}

export default TimeTracker;
