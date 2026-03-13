// products/planora/@custom/dashboard/TaskList.jsx
import { useState } from 'react';
import TimeTracker from './TimeTracker';

export default function TaskList({ tasks, onUpdate, onDelete }) {
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTimeTask, setExpandedTimeTask] = useState(null);

  const statusColors = {
    todo: 'bg-slate-600',
    'in-progress': 'bg-blue-600',
    review: 'bg-yellow-600',
    done: 'bg-green-600'
  };

  const priorityColors = {
    low: 'text-slate-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    urgent: 'text-red-400'
  };

  const handleStatusChange = (taskId, newStatus) => {
    onUpdate(taskId, { status: newStatus });
  };

  const handlePriorityChange = (taskId, newPriority) => {
    onUpdate(taskId, { priority: newPriority });
  };

  return (
    <div className="space-y-2">
      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium text-slate-400">
        <div className="col-span-1">
          <input type="checkbox" className="rounded bg-slate-700 border-slate-600" />
        </div>
        <div className="col-span-4">Task</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Task Rows */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No tasks yet. Create one to get started!
        </div>
      ) : (
        tasks.map(task => (
          <div
            key={task.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
          >
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={(e) => handleStatusChange(task.id, e.target.checked ? 'done' : 'todo')}
                className="rounded bg-slate-700 border-slate-600"
              />
            </div>

            {/* Task Name */}
            <div className="col-span-4 flex flex-col">
              <span className={`text-white ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </span>
              {task.description && (
                <span className="text-sm text-slate-400 mt-1">{task.description}</span>
              )}
            </div>

            {/* Assignee */}
            <div className="col-span-2 flex items-center">
              {task.assignee ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{task.assignee.name}</span>
                </div>
              ) : (
                <button className="text-sm text-slate-400 hover:text-white">
                  + Assign
                </button>
              )}
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[task.status] || statusColors.todo} border-0 focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="col-span-2 flex items-center">
              <select
                value={task.priority || 'medium'}
                onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                className={`px-3 py-1 rounded text-xs font-medium bg-slate-700 border-0 focus:ring-2 focus:ring-indigo-500 ${priorityColors[task.priority || 'medium']}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end space-x-2">
              <button
                onClick={() => setExpandedTimeTask(expandedTimeTask === task.id ? null : task.id)}
                className={`${expandedTimeTask === task.id ? 'text-indigo-400' : 'text-slate-400'} hover:text-indigo-300`}
                title="Time tracking"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setEditingTask(task)}
                className="text-slate-400 hover:text-white"
                title="Edit task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-slate-400 hover:text-red-400"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Expanded Time Tracker */}
            {expandedTimeTask === task.id && (
              <div className="col-span-12 mt-2">
                <TimeTracker
                  taskId={task.id}
                  taskTitle={task.title}
                  projectId={task.projectId}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
