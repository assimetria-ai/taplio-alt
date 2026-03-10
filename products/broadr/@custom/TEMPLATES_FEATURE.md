# Post Template Library Feature

## Overview

The Template Library feature enables users to save, manage, and reuse post templates for common formats. This reduces the time spent creating broadcasts by providing pre-built templates for announcements, polls, case studies, and more.

## Features

### 📚 Template Library Browser
- **Search & Filter**: Find templates by name, description, type, category, or visibility
- **Grid/List View**: Toggle between grid cards and compact list view
- **Template Preview**: See template metadata before selecting
- **Usage Statistics**: Track how many times templates are used

### 📝 Template Types

The system includes pre-built templates for:

1. **Product Launch Announcement**
   - Announce new products or features
   - Includes key features list and CTA
   - Multi-channel support (email, SMS, push, social)

2. **Community Poll**
   - Engage audience with polls and surveys
   - Up to 3 voting options with tracking links
   - Deadline and results announcement support

3. **Case Study Showcase**
   - Share customer success stories
   - Challenge-Solution-Results structure
   - Includes metrics and testimonials

4. **Event Invitation**
   - Invite to webinars, conferences, or events
   - Agenda items and RSVP tracking
   - Deadline and capacity management

### 🎨 Template Customization

Each template includes:
- **Variables**: Dynamic fields that get replaced with actual content
- **Channel Overrides**: Custom content for SMS, push, and social
- **Design Settings**: Colors, layout, theme customization
- **Variable Validation**: Required vs optional fields with type checking

### 🔄 Template Operations

- **Use Template**: Apply template to create a new broadcast
- **Duplicate**: Create a copy of system templates to customize
- **Save As**: Save current broadcast as a new template
- **Edit**: Modify existing custom templates
- **Archive**: Hide templates without deleting

## File Structure

```
broadr/
├── @custom/
│   ├── models/
│   │   └── template.js              # Template data model
│   ├── routes/
│   │   └── template.js              # Template API routes
│   ├── ui/
│   │   ├── TemplateLibrary.jsx      # Main library UI
│   │   └── TemplateLibrary.css      # Styling
│   └── TEMPLATES_FEATURE.md         # This file
```

## API Endpoints

### List Templates
```
GET /api/templates?type=poll&category=Marketing&search=product
```

Query Parameters:
- `type` - Filter by template type
- `category` - Filter by category
- `visibility` - Filter by visibility (public/private/team)
- `tags` - Filter by tags (comma-separated)
- `search` - Search by name or description

Response:
```json
{
  "templates": [...],
  "total": 10,
  "filters": { ... }
}
```

### Get Template
```
GET /api/templates/:id
```

### Create Template
```
POST /api/templates
Content-Type: application/json

{
  "name": "Weekly Update",
  "description": "My custom weekly update template",
  "type": "update",
  "visibility": "private",
  "content": {
    "subject": "Weekly Update: {{week_ending}}",
    "body": "<h1>What happened this week</h1><p>{{content}}</p>",
    "variables": [
      { "name": "week_ending", "label": "Week Ending", "type": "date", "required": true },
      { "name": "content", "label": "Content", "type": "text", "required": true }
    ]
  },
  "channels": ["email"],
  "tags": ["weekly", "update"]
}
```

### Update Template
```
PUT /api/templates/:id
```

### Delete/Archive Template
```
DELETE /api/templates/:id
```

### Duplicate Template
```
POST /api/templates/:id/duplicate
```
Creates a copy of a system template as a private template

### Record Usage
```
POST /api/templates/:id/use
```
Increments usage counter when template is applied

### Get Metadata
```
GET /api/templates/meta/types        # List all template types
GET /api/templates/meta/categories   # List all categories
```

## Usage Example

### 1. Browse Templates
```javascript
import { TemplateLibrary } from '@custom/ui/TemplateLibrary';

function BroadcastComposer() {
  const [showTemplates, setShowTemplates] = useState(false);
  
  const handleSelectTemplate = (template) => {
    // Apply template to compose form
    applyTemplate(template);
    setShowTemplates(false);
  };
  
  return (
    <>
      <button onClick={() => setShowTemplates(true)}>
        📚 Browse Templates
      </button>
      
      {showTemplates && (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  );
}
```

### 2. Apply Template Variables
```javascript
function applyTemplate(template) {
  const { content } = template;
  
  // Show variable form to user
  const variableValues = await promptForVariables(content.variables);
  
  // Replace variables in content
  let subject = content.subject;
  let body = content.body;
  
  Object.entries(variableValues).forEach(([key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(pattern, value);
    body = body.replace(pattern, value);
  });
  
  // Set in composer
  setSubject(subject);
  setBody(body);
  setChannels(template.channels);
}
```

### 3. Create Custom Template
```javascript
import { TemplateEditor } from '@custom/ui/TemplateLibrary';

function CreateTemplate() {
  const handleSave = async (templateData) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData)
    });
    
    const result = await response.json();
    console.log('Template created:', result);
  };
  
  return (
    <TemplateEditor
      onSave={handleSave}
      onCancel={() => history.back()}
    />
  );
}
```

## Variable System

Templates support dynamic variables using `{{variable_name}}` syntax:

### Variable Types
- **text** - Plain text input
- **date** - Date picker
- **number** - Numeric input
- **url** - URL validation
- **email** - Email validation

### Variable Definition
```javascript
{
  name: 'product_name',        // Used in template: {{product_name}}
  label: 'Product Name',       // Display label in form
  type: 'text',                // Input type
  required: true,              // Validation
  defaultValue: '',            // Optional default
  placeholder: 'e.g., Widget Pro'  // Hint text
}
```

### Channel-Specific Content
```javascript
channelOverrides: {
  sms: {
    body: 'Short SMS version with {{product_name}}'
  },
  push: {
    title: '{{product_name}} is here!',
    body: 'Check it out now'
  },
  social: {
    body: 'Social media friendly text',
    hashtags: ['#product', '#launch']
  }
}
```

## Template Visibility

- **Private**: Only visible to creator
- **Team**: Visible to all workspace members
- **Public**: System templates, visible to everyone

## Best Practices

### Creating Templates
1. Use descriptive names and descriptions
2. Define all necessary variables upfront
3. Mark required vs optional fields
4. Provide placeholder/default values
5. Add relevant tags and categories
6. Test on all target channels

### Variable Naming
- Use snake_case (e.g., `product_name`)
- Be descriptive but concise
- Group related variables (e.g., `event_date`, `event_time`)
- Avoid special characters

### Template Design
- Keep subject lines under 50 characters
- Use responsive HTML for email
- Provide plain text fallback
- Test SMS character limits (160)
- Optimize push notification length

### Organization
- Tag templates consistently
- Use categories effectively
- Archive outdated templates
- Review usage statistics
- Update based on performance

## Database Schema

Templates should be stored with the following structure:

```javascript
{
  id: 'uuid',
  userId: 'user_id',
  workspaceId: 'workspace_id',
  name: 'Template Name',
  description: 'Brief description',
  type: 'announcement',  // TEMPLATE_TYPE enum
  visibility: 'private', // TEMPLATE_VISIBILITY enum
  content: {
    subject: '...',
    body: '...',
    preview: '...',
    variables: [...],
    channelOverrides: {...}
  },
  channels: ['email', 'sms'],
  design: {...},
  stats: {
    usedCount: 0,
    lastUsedAt: null,
    avgOpenRate: 0,
    avgClickRate: 0
  },
  tags: ['tag1', 'tag2'],
  category: 'Marketing',
  isSystemTemplate: false,
  isArchived: false,
  createdAt: '2024-03-10T...',
  updatedAt: '2024-03-10T...',
  createdBy: 'user_id',
  updatedBy: 'user_id'
}
```

## Future Enhancements

- [ ] Template versioning
- [ ] Template sharing marketplace
- [ ] A/B test template variations
- [ ] AI-powered template suggestions
- [ ] Template performance analytics
- [ ] Visual template editor (drag-drop)
- [ ] Template preview across devices
- [ ] Import templates from other platforms
- [ ] Template approval workflows (team plans)
- [ ] Template usage quotas/limits

## Integration Points

The template library integrates with:

1. **Broadcast Composer** - Apply templates when creating broadcasts
2. **Newsletter Editor** - Load templates in newsletter flow
3. **Campaign Builder** - Use templates for campaign sequences
4. **Analytics** - Track template performance metrics
5. **Team Workspace** - Share templates with team members

## Testing

### Manual Testing Checklist
- [ ] Create new template
- [ ] Edit existing template
- [ ] Delete/archive template
- [ ] Search and filter templates
- [ ] Switch between grid/list view
- [ ] Apply template to broadcast
- [ ] Replace variables with values
- [ ] Duplicate system template
- [ ] Test multi-channel overrides
- [ ] Verify usage statistics

### API Testing
```bash
# List templates
curl http://localhost:3000/api/templates

# Get template
curl http://localhost:3000/api/templates/product_launch_announcement

# Create template
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Template", "type": "custom", ...}'

# Duplicate template
curl -X POST http://localhost:3000/api/templates/case_study_showcase/duplicate

# Record usage
curl -X POST http://localhost:3000/api/templates/TEMPLATE_ID/use
```

## License

PROPRIETARY - Part of Broadr platform

## Support

For questions or issues with the template library:
- Email: support@broadr.app
- Docs: https://docs.broadr.app/templates
- API Reference: https://api.broadr.app/docs#templates
