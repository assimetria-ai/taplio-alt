// products/planora/@custom/components/SearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'task') {
      navigate(`/tasks/${id}`);
    } else if (type === 'project') {
      navigate(`/projects/${id}`);
    } else if (type === 'member') {
      navigate(`/team/${id}`);
    }
  };

  const totalResults = results
    ? results.tasks.length + results.projects.length + results.members.length
    : 0;

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, projects, people... (⌘K)"
          className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-2.5">
            <svg
              className="animate-spin h-5 w-5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results && totalResults > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-h-96 overflow-y-auto z-50">
          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase">
                Tasks ({results.tasks.length})
              </div>
              {results.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleResultClick('task', task.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {task.project.name}
                        {task.assignee && ` • ${task.assignee.name}`}
                      </div>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded ${
                        task.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : task.status === 'in-progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-600 text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div className="p-2 border-t border-slate-700">
              <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase">
                Projects ({results.projects.length})
              </div>
              {results.projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleResultClick('project', project.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="text-white font-medium">{project.name}</div>
                  <div className="text-xs text-slate-400">
                    {project._count.tasks} tasks • {project._count.members} members
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Members */}
          {results.members.length > 0 && (
            <div className="p-2 border-t border-slate-700">
              <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase">
                Team Members ({results.members.length})
              </div>
              {results.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleResultClick('member', member.id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium mr-3">
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.email}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && results && totalResults === 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4 z-50">
          <div className="text-center text-slate-400">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
