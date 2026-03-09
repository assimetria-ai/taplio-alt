# Search & Filters Feature Documentation

## Overview

The Search & Filters feature provides powerful capabilities for finding and organizing tasks, projects, and team members in Planora.

## Components

### 1. Global Search Bar (`SearchBar.jsx`)

Located in the dashboard header, provides real-time search across:
- **Tasks**: Search by title and description
- **Projects**: Search by name and description  
- **Team Members**: Search by name and email

**Features:**
- Real-time search with 300ms debounce
- Keyboard shortcut support (⌘K placeholder for future implementation)
- Type-specific filtering
- Click-outside to close
- Loading indicator
- Navigate to results directly

**API Endpoint:** `GET /api/search?q=<query>&type=<optional>`

**Response Format:**
```json
{
  "results": {
    "tasks": [...],
    "projects": [...],
    "members": [...]
  }
}
```

### 2. Filter Panel (`FilterPanel.jsx`)

Advanced filtering for task lists and boards.

**Filter Options:**
- **Status**: todo, in-progress, review, done
- **Priority**: low, medium, high, urgent
- **Assignee**: Filter by assigned user
- **Tags**: Filter by task tags
- **Search**: Text search within filtered results

**Features:**
- Save custom filter combinations
- Load saved filters
- Delete saved filters
- Clear all filters
- Active filter count badge
- Responsive dropdown panel

**API Endpoints:**
- `GET /api/filters` - Get user's saved filters
- `POST /api/filters` - Save a new filter
- `DELETE /api/filters/:id` - Delete a saved filter

### 3. Dashboard Integration

The dashboard (`dashboard/index.jsx`) now includes:
- Integrated SearchBar in header
- FilterPanel next to view switcher
- Real-time task filtering with `useMemo`
- Task count display (filtered/total)
- Saved filter management

## Database Schema

### SavedFilter Model

```prisma
model SavedFilter {
  id         String   @id @default(cuid())
  name       String
  filterData Json     // Stores filter configuration
  projectId  String?  // Optional project association
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("saved_filters")
}
```

**Migration:** `003_add_saved_filters.sql`

## Usage Examples

### Search Usage

```javascript
// User types in search bar
// Automatic API call after 300ms debounce
GET /api/search?q=user+input

// Filter by type
GET /api/search?q=meeting&type=tasks
```

### Filter Usage

```javascript
// Apply filters
const filters = {
  status: ['todo', 'in-progress'],
  priority: ['high', 'urgent'],
  assignee: 'user-id-123',
  tags: ['frontend', 'urgent']
};

// Save filter
POST /api/filters
{
  "name": "My High Priority Tasks",
  "filterData": filters,
  "projectId": "project-id"
}

// Load saved filter
const savedFilter = await fetch('/api/filters');
setFilters(savedFilter.filterData);
```

### Dashboard Integration

```javascript
// Filtered tasks computed automatically
const filteredTasks = useMemo(() => {
  let filtered = [...tasks];
  
  if (filters.status.length > 0) {
    filtered = filtered.filter(task => 
      filters.status.includes(task.status)
    );
  }
  
  // ... other filters
  
  return filtered;
}, [tasks, filters]);
```

## Performance Considerations

1. **Search Debouncing**: 300ms delay prevents excessive API calls
2. **Memoization**: `useMemo` for filtered tasks prevents unnecessary re-renders
3. **Database Indexes**: Indexes on `user_id` and `project_id` in saved_filters
4. **Search Limits**: Results limited to 10 per category
5. **Case-insensitive Search**: Uses Prisma's `mode: 'insensitive'`

## Security

- All endpoints require authentication via `requireAuth` middleware
- Users can only search within their accessible projects
- Saved filters are user-scoped
- Filter deletion requires ownership verification

## Future Enhancements

- [ ] Keyboard shortcuts (⌘K for search)
- [ ] Advanced search operators (AND, OR, NOT)
- [ ] Search history
- [ ] Filter presets (team templates)
- [ ] Export filtered results
- [ ] Bulk actions on filtered tasks
- [ ] Smart filters (AI-powered suggestions)
- [ ] Search within comments and attachments

## Testing

### Manual Testing Checklist

**Search:**
- [ ] Search returns results for tasks
- [ ] Search returns results for projects
- [ ] Search returns results for team members
- [ ] Empty search shows no results
- [ ] Search updates on text input
- [ ] Click outside closes dropdown
- [ ] Navigation to results works

**Filters:**
- [ ] Status filter works
- [ ] Priority filter works
- [ ] Multiple filters combine correctly (AND logic)
- [ ] Clear all filters works
- [ ] Save filter creates new entry
- [ ] Load saved filter applies correctly
- [ ] Delete filter removes from list
- [ ] Active filter count is accurate

**Integration:**
- [ ] Filtered task count displays correctly
- [ ] TaskList shows filtered results
- [ ] TaskBoard shows filtered results
- [ ] Filters persist during view changes
- [ ] Search and filters work together

## Troubleshooting

### Search not working
- Check authentication token
- Verify user has project access
- Check console for API errors
- Ensure search term is 2+ characters

### Filters not applying
- Verify filter state is updating
- Check filtered tasks computation
- Ensure filter data structure matches expected format
- Check browser console for errors

### Saved filters not persisting
- Verify database connection
- Check user authentication
- Ensure filter name is provided
- Check API response for errors
