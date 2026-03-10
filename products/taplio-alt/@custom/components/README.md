# Taplio-Alt Components

## LinkedInPostPreview

**Task #10308 - Implement post preview with LinkedIn UI mockup**

A realistic LinkedIn post preview component that shows how posts will appear in the LinkedIn feed.

### Features

- ✅ Authentic LinkedIn UI styling
- ✅ Profile photo with default avatar fallback
- ✅ Name and headline display
- ✅ Post content with hashtag formatting
- ✅ Media support (single image or grid)
- ✅ Like, comment, share, and send actions
- ✅ Engagement stats display
- ✅ Responsive design

### Usage

```jsx
import LinkedInPostPreview from '@custom/components/LinkedInPostPreview';

function PostComposer() {
  return (
    <LinkedInPostPreview
      content="Excited to share my latest project! 🚀 #WebDevelopment #React"
      profilePhoto="https://example.com/photo.jpg"
      name="John Doe"
      headline="Software Engineer | Building amazing products"
      media={['https://example.com/image.jpg']}
      showActions={true}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | string | `''` | The post text content |
| `profilePhoto` | string | `null` | URL to profile photo (uses default avatar if not provided) |
| `name` | string | `'Your Name'` | User's full name |
| `headline` | string | `'Your Professional Headline'` | User's professional headline |
| `media` | Array | `[]` | Array of media URLs (images) |
| `showActions` | boolean | `true` | Whether to show like/comment/share actions |

### Examples

#### Basic Post

```jsx
<LinkedInPostPreview
  content="Just launched our new feature! Check it out."
  name="Jane Smith"
  headline="Product Manager @ TechCorp"
/>
```

#### Post with Hashtags

```jsx
<LinkedInPostPreview
  content="Sharing some insights on #ProductManagement and #Agile methodologies. What are your thoughts?"
  name="Jane Smith"
  headline="Product Manager @ TechCorp"
/>
```

#### Post with Single Image

```jsx
<LinkedInPostPreview
  content="Proud to share our team's achievement! 🎉"
  name="Jane Smith"
  headline="Product Manager @ TechCorp"
  media={['https://example.com/team-photo.jpg']}
/>
```

#### Post with Multiple Images (Grid)

```jsx
<LinkedInPostPreview
  content="Highlights from our recent conference"
  name="Jane Smith"
  headline="Product Manager @ TechCorp"
  media={[
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
    'https://example.com/photo3.jpg',
    'https://example.com/photo4.jpg'
  ]}
/>
```

#### Preview Without Actions (Content Focus)

```jsx
<LinkedInPostPreview
  content="Draft post preview"
  name="Jane Smith"
  headline="Product Manager @ TechCorp"
  showActions={false}
/>
```

### Styling

The component uses scoped CSS-in-JS (styled-jsx) to prevent style conflicts. It matches LinkedIn's official design system:

- **Colors**: LinkedIn blue (#0a66c2), standard grays
- **Typography**: System font stack matching LinkedIn
- **Spacing**: Exact padding and margins from LinkedIn
- **Icons**: SVG icons matching LinkedIn's design

### Features

#### Hashtag Formatting

Hashtags are automatically detected and styled with LinkedIn's blue color:

```jsx
// Input
content="Check out my new #React project using #TypeScript"

// Renders with clickable blue hashtags
```

#### Default Avatar

If no `profilePhoto` is provided, the component generates a default avatar with the user's initial:

```jsx
// No profilePhoto provided
<LinkedInPostPreview name="John Doe" />
// Shows circular avatar with "J" on LinkedIn blue background
```

#### Media Grid

Multiple images are displayed in a grid layout (up to 4 images):
- 1 image: Full width
- 2 images: 2-column grid
- 3 images: 3-column grid
- 4 images: 2x2 grid
- 5+ images: Shows first 4 in 2x2 grid

### Integration with Post Composer

Recommended usage in a post composition interface:

```jsx
import { useState } from 'react';
import LinkedInPostPreview from '@custom/components/LinkedInPostPreview';

function PostComposer({ userProfile }) {
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);

  return (
    <div className="composer">
      <div className="editor">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What do you want to talk about?"
        />
        
        <MediaUploader onUpload={setSelectedMedia} />
        
        <button onClick={handlePublish}>
          Publish to LinkedIn
        </button>
      </div>

      <div className="preview">
        <LinkedInPostPreview
          content={postContent}
          profilePhoto={userProfile.photo}
          name={userProfile.name}
          headline={userProfile.headline}
          media={selectedMedia}
        />
      </div>
    </div>
  );
}
```

### Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance

- Lightweight: ~13KB component
- No external dependencies (except React)
- Optimized SVG icons
- Efficient CSS scoping

---

**Related Tasks:**
- Task #10273: LinkedIn OAuth connection flow
- Task #10266: LinkedIn OAuth integration

**Last Updated:** Task #10308
