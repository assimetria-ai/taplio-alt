// products/planora/@custom/dashboard/ProjectHeader.jsx
import { useState } from 'react';
import CSVUpload from './CSVUpload';

export default function ProjectHeader({ project, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Project Info */}
        <div className="flex items-center space-x-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          {project.description && (
            <p className="text-sm text-slate-400">{project.description}</p>
          )}
        </div>

        {/* Project Actions */}
        <div className="flex items-center space-x-3">
          {/* Members */}
          <div className="flex -space-x-2">
            {project.members?.slice(0, 5).map((member, idx) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-medium"
                title={member.name}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members?.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-slate-300 text-xs">
                +{project.members.length - 5}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCSVUpload(true)}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors flex items-center gap-1.5"
            title="Import tasks from CSV"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import CSV
          </button>

          <button className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors">
            + Invite
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-10">
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">
                  Edit Project
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">
                  Project Settings
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">
                  Duplicate
                </button>
                <button
                  onClick={() => { setShowCSVUpload(true); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
                >
                  Import from CSV
                </button>
                <hr className="my-1 border-slate-600" />
                <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600">
                  Archive Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <CSVUpload
          projectId={project.id}
          onImportComplete={() => {
            if (onUpdate) onUpdate();
          }}
          onClose={() => setShowCSVUpload(false)}
        />
      )}
    </div>
  );
}
