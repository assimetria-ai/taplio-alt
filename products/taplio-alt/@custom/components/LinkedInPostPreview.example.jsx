/**
 * LinkedIn Post Preview - Usage Examples
 * Task #10308 - Implement post preview with LinkedIn UI mockup
 * 
 * This file demonstrates various use cases for the LinkedInPostPreview component.
 */

import React, { useState } from 'react';
import LinkedInPostPreview from './LinkedInPostPreview';

/**
 * Example 1: Basic Text Post
 */
export function BasicPostExample() {
  return (
    <LinkedInPostPreview
      content="Just finished an amazing project using React and Node.js! 🚀"
      name="Sarah Johnson"
      headline="Full Stack Developer @ TechStartup"
    />
  );
}

/**
 * Example 2: Post with Hashtags
 */
export function PostWithHashtagsExample() {
  return (
    <LinkedInPostPreview
      content={`Excited to share my thoughts on modern web development! 

Key takeaways:
✅ Performance matters
✅ User experience is everything
✅ Keep learning and growing

#WebDevelopment #JavaScript #React #Developer #TechTips`}
      name="Michael Chen"
      headline="Senior Frontend Engineer | JavaScript Enthusiast"
      profilePhoto="https://i.pravatar.cc/150?img=12"
    />
  );
}

/**
 * Example 3: Post with Single Image
 */
export function PostWithImageExample() {
  return (
    <LinkedInPostPreview
      content="Proud moment for our team! We just launched our redesigned platform. Check it out and let us know what you think! 🎉"
      name="Emily Davis"
      headline="Product Manager @ InnovateApp | Building the future"
      profilePhoto="https://i.pravatar.cc/150?img=5"
      media={['https://picsum.photos/800/600']}
    />
  );
}

/**
 * Example 4: Post with Multiple Images
 */
export function PostWithMultipleImagesExample() {
  return (
    <LinkedInPostPreview
      content="Highlights from last week's product conference! Amazing speakers, great networking, and lots of inspiration. #ProductManagement #Conference2024"
      name="David Wilson"
      headline="VP of Product | Speaker | Mentor"
      profilePhoto="https://i.pravatar.cc/150?img=8"
      media={[
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3',
        'https://picsum.photos/400/300?random=4'
      ]}
    />
  );
}

/**
 * Example 5: Professional Announcement
 */
export function AnnouncementExample() {
  return (
    <LinkedInPostPreview
      content={`🎉 Big news! I'm thrilled to announce that I'm joining Microsoft as a Principal Engineer!

After 8 amazing years at Google, I'm excited to start this new chapter and work on cutting-edge cloud technologies.

Huge thanks to my Google team for the incredible journey. Looking forward to what's ahead!

#NewJob #Microsoft #Career #TechIndustry`}
      name="Alex Thompson"
      headline="Principal Engineer @ Microsoft | Cloud & AI"
      profilePhoto="https://i.pravatar.cc/150?img=33"
    />
  );
}

/**
 * Example 6: Thought Leadership Post
 */
export function ThoughtLeadershipExample() {
  return (
    <LinkedInPostPreview
      content={`The future of AI in software development 🤖

After working with AI tools for the past year, here are my key observations:

1. AI is a tool, not a replacement
2. Understanding fundamentals is more important than ever
3. The human touch in problem-solving remains irreplaceable

What's your experience with AI in your workflow?

#AI #SoftwareDevelopment #FutureOfWork #TechTrends`}
      name="Dr. Rachel Martinez"
      headline="CTO @ AI Solutions | PhD in Computer Science | Speaker"
      profilePhoto="https://i.pravatar.cc/150?img=45"
    />
  );
}

/**
 * Example 7: Content Preview Mode (No Actions)
 */
export function PreviewModeExample() {
  return (
    <LinkedInPostPreview
      content="This is how your post will look in the LinkedIn feed. Review it before publishing!"
      name="Preview Mode"
      headline="This is your headline"
      showActions={false}
    />
  );
}

/**
 * Example 8: Interactive Post Composer
 * Real-time preview as user types
 */
export function InteractiveComposerExample() {
  const [content, setContent] = useState('');
  const [name, setName] = useState('Your Name');
  const [headline, setHeadline] = useState('Your Professional Headline');

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px' }}>
      <div style={{ flex: 1 }}>
        <h3>Compose Your Post</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Your Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          <div style={{ 
            marginTop: '4px', 
            fontSize: '12px', 
            color: '#666',
            textAlign: 'right'
          }}>
            {content.length} / 3000 characters
          </div>
        </div>

        <button
          style={{
            padding: '12px 24px',
            background: '#0a66c2',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Post to LinkedIn
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Live Preview</h3>
        <LinkedInPostPreview
          content={content || 'Start typing to see your post preview...'}
          name={name}
          headline={headline}
        />
      </div>
    </div>
  );
}

/**
 * Example 9: All Examples Gallery
 */
export function ExamplesGallery() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>LinkedIn Post Preview Examples</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Task #10308 - Various examples of the LinkedInPostPreview component
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <section>
          <h2>1. Basic Text Post</h2>
          <BasicPostExample />
        </section>

        <section>
          <h2>2. Post with Hashtags</h2>
          <PostWithHashtagsExample />
        </section>

        <section>
          <h2>3. Post with Single Image</h2>
          <PostWithImageExample />
        </section>

        <section>
          <h2>4. Post with Multiple Images</h2>
          <PostWithMultipleImagesExample />
        </section>

        <section>
          <h2>5. Professional Announcement</h2>
          <AnnouncementExample />
        </section>

        <section>
          <h2>6. Thought Leadership</h2>
          <ThoughtLeadershipExample />
        </section>

        <section>
          <h2>7. Preview Mode (No Actions)</h2>
          <PreviewModeExample />
        </section>

        <section>
          <h2>8. Interactive Composer</h2>
          <InteractiveComposerExample />
        </section>
      </div>
    </div>
  );
}

export default ExamplesGallery;
