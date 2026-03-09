// products/planora/@custom/dashboard/TaskBoard.jsx
import { useState } from 'react';

export default function TaskBoard({ tasks, onUpdate, onDelete }) {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'slate' },
    { id: 'in-progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'yellow' },
    { id: 'done', title: 'Done', color: 'green' }
  ];

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdate(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const priorityColors = {
    low: 'border-l-slate-400',
    medium: 'border-l-yellow-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-400'
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className={`bg-${column.color}-900/20 border-l-4 border-${column.color}-500 px-4 py-3 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                {tasksByStatus[column.id]?.length || 0}
              </span>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex-1 bg-slate-800/50 rounded-b-lg p-2 space-y-2 min-h-[200px]">
            {tasksByStatus[column.id]?.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className={`bg-slate-800 border-l-4 ${priorityColors[task.priority || 'medium']} rounded-lg p-3 cursor-move hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm flex-1 pr-2">
                    {task.title}
                  </h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Task Meta */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    {/* Assignee */}
                    {task.assignee && (
                      <div
                        className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white"
                        title={task.assignee.name}
                      >
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Comment count */}
                    {task.commentCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{task.commentCount}</span>
                      </div>
                    )}

                    {/* Attachment count */}
                    {task.attachmentCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>{task.attachmentCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Due date */}
                  {task.dueDate && (
                    <span className={`${new Date(task.dueDate) < new Date() ? 'text-red-400' : ''}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add Task Button */}
            <button className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              + Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
