// products/planora/@custom/dashboard/BoardTable.jsx
// Monday.com-style table view for project board
import { useState } from 'react';

export default function BoardTable({ tasks, onUpdate, onDelete, onCreate }) {
  const [groupBy, setGroupBy] = useState('status'); // status, priority, assignee, none
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingCell, setEditingCell] = useState(null);
  const [newTaskRow, setNewTaskRow] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  });

  // Status options
  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-slate-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'review', label: 'Review', color: 'bg-yellow-500' },
    { value: 'done', label: 'Done', color: 'bg-green-500' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-slate-400' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-400' },
    { value: 'high', label: 'High', color: 'bg-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ];

  // Group tasks
  const groupTasks = (tasks) => {
    if (groupBy === 'none') {
      return { 'All Tasks': tasks };
    }

    const grouped = {};
    
    tasks.forEach(task => {
      let key;
      if (groupBy === 'status') {
        const status = statusOptions.find(s => s.value === task.status);
        key = status ? status.label : 'Unknown';
      } else if (groupBy === 'priority') {
        const priority = priorityOptions.find(p => p.value === task.priority);
        key = priority ? priority.label : 'Medium';
      } else if (groupBy === 'assignee') {
        key = task.assignee ? task.assignee.name : 'Unassigned';
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });

    return grouped;
  };

  // Sort tasks
  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'dueDate') {
        aVal = aVal ? new Date(aVal) : new Date('9999-12-31');
        bVal = bVal ? new Date(bVal) : new Date('9999-12-31');
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const groupedTasks = groupTasks(tasks);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCellEdit = (taskId, field, value) => {
    onUpdate(taskId, { [field]: value });
    setEditingCell(null);
  };

  const handleCreateTask = () => {
    if (newTaskData.title.trim()) {
      onCreate(newTaskData);
      setNewTaskData({
        title: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      });
      setNewTaskRow(false);
    }
  };

  const StatusCell = ({ task }) => {
    const status = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const isEditing = editingCell === `${task.id}-status`;

    if (isEditing) {
      return (
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => handleCellEdit(task.id, 'status', e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <button
        onClick={() => setEditingCell(`${task.id}-status`)}
        className="w-full text-left"
      >
        <span className={`${status.color} text-white text-xs px-3 py-1 rounded-full inline-block`}>
          {status.label}
        </span>
      </button>
    );
  };

  const PriorityCell = ({ task }) => {
    const priority = priorityOptions.find(p => p.value === task.priority) || priorityOptions[1];
    const isEditing = editingCell === `${task.id}-priority`;

    if (isEditing) {
      return (
        <div className="relative">
          <select
            value={task.priority}
            onChange={(e) => handleCellEdit(task.id, 'priority', e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <button
        onClick={() => setEditingCell(`${task.id}-priority`)}
        className="w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
          <span className="text-sm text-slate-300">{priority.label}</span>
        </div>
      </button>
    );
  };

  const DueDateCell = ({ task }) => {
    const isEditing = editingCell === `${task.id}-dueDate`;
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date();

    if (isEditing) {
      return (
        <input
          type="date"
          value={task.dueDate ? task.dueDate.split('T')[0] : ''}
          onChange={(e) => handleCellEdit(task.id, 'dueDate', e.target.value)}
          onBlur={() => setEditingCell(null)}
          autoFocus
          className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
        />
      );
    }

    return (
      <button
        onClick={() => setEditingCell(`${task.id}-dueDate`)}
        className={`w-full text-left text-sm ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}
      >
        {dueDate ? dueDate.toLocaleDateString() : 'Set date'}
      </button>
    );
  };

  const AssigneeCell = ({ task }) => {
    return (
      <div className="flex items-center space-x-2">
        {task.assignee ? (
          <>
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300">{task.assignee.name}</span>
          </>
        ) : (
          <span className="text-sm text-slate-500">Unassigned</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-slate-400">Group by:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded px-3 py-1"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setNewTaskRow(true)}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="mb-6">
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div className="bg-slate-900/30 px-4 py-2 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{groupName}</h3>
                  <span className="text-xs text-slate-400">{groupTasks.length} tasks</span>
                </div>
              </div>
            )}

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/30 border-b border-slate-700">
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      <span>Task</span>
                      {sortBy === 'title' && (
                        <svg className={`w-3 h-3 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left w-40">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      <span>Status</span>
                      {sortBy === 'status' && (
                        <svg className={`w-3 h-3 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left w-32">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      <span>Priority</span>
                      {sortBy === 'priority' && (
                        <svg className={`w-3 h-3 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left w-48">
                    <span className="text-xs font-semibold text-slate-400">Assignee</span>
                  </th>
                  <th className="px-4 py-3 text-left w-32">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      <span>Due Date</span>
                      {sortBy === 'dueDate' && (
                        <svg className={`w-3 h-3 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left w-16">
                    <span className="text-xs font-semibold text-slate-400">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* New Task Row */}
                {newTaskRow && (
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={newTaskData.title}
                        onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                        placeholder="Task name"
                        autoFocus
                        className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newTaskData.status}
                        onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value })}
                        className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newTaskData.priority}
                        onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                        className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
                      >
                        {priorityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">Unassigned</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={newTaskData.dueDate}
                        onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                        className="bg-slate-700 text-white text-sm rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateTask}
                          className="text-green-400 hover:text-green-300"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setNewTaskRow(false)}
                          className="text-slate-400 hover:text-slate-300"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Task Rows */}
                {sortTasks(groupTasks).map(task => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-700 hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusCell task={task} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityCell task={task} />
                    </td>
                    <td className="px-4 py-3">
                      <AssigneeCell task={task} />
                    </td>
                    <td className="px-4 py-3">
                      <DueDateCell task={task} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {groupTasks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                      No tasks in this group
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
