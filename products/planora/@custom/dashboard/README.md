# Dashboard Components

## Views

### BoardTable (Monday.com-style Table View)
`BoardTable.jsx` - The default board view for Planora

**Features:**
- Spreadsheet-like table layout
- Inline editing for status, priority, and due dates
- Sortable columns (click column headers to sort)
- Grouping by status, priority, or assignee
- Quick task creation with inline form
- Color-coded status badges and priority indicators
- Responsive design with dark theme

**Usage:**
```jsx
<BoardTable
  tasks={tasks}
  onUpdate={handleUpdateTask}
  onDelete={handleDeleteTask}
  onCreate={handleCreateTask}
/>
```

### TaskBoard (Kanban View)
`TaskBoard.jsx` - Kanban-style board with drag-and-drop

### TaskList (Simple List View)
`TaskList.jsx` - Traditional list view

## View Modes

Available in the dashboard:
- **Table** (default) - Monday.com-style spreadsheet view
- **List** - Simple task list
- **Kanban** - Drag-and-drop board
- **Calendar** - Coming soon
- **Timeline** - Coming soon
