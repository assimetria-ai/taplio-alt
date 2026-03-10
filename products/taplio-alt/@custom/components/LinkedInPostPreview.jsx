/**
 * LinkedIn Post Preview Component
 * Task #10308 - Implement post preview with LinkedIn UI mockup
 * 
 * Displays a realistic preview of how a post will appear in the LinkedIn feed.
 * Includes profile photo, name, headline, timestamp, and post content.
 * Matches LinkedIn's visual design for accurate representation.
 */

import React from 'react';

/**
 * LinkedIn Post Preview Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The post text content
 * @param {string} props.profilePhoto - URL to profile photo (optional)
 * @param {string} props.name - User's full name
 * @param {string} props.headline - User's professional headline
 * @param {Array} props.media - Array of media URLs (images/videos) (optional)
 * @param {boolean} props.showActions - Whether to show like/comment/share actions
 */
export default function LinkedInPostPreview({
  content = '',
  profilePhoto = null,
  name = 'Your Name',
  headline = 'Your Professional Headline',
  media = [],
  showActions = true
}) {
  // Default profile photo (LinkedIn default avatar style)
  const defaultAvatar = profilePhoto || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%230A66C2'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='central'%3E${name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;

  return (
    <div className="linkedin-post-preview">
      <style jsx>{`
        .linkedin-post-preview {
          max-width: 552px;
          background: white;
          border: 1px solid #e0dfdc;
          border-radius: 8px;
          font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', Helvetica, Arial, sans-serif;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04);
        }

        .post-header {
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .profile-photo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          line-height: 1.42857;
          margin: 0;
          cursor: pointer;
        }

        .profile-name:hover {
          color: #0a66c2;
          text-decoration: underline;
        }

        .profile-headline {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
          line-height: 1.33333;
          margin: 2px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-timestamp {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .post-timestamp::before {
          content: '•';
          font-weight: bold;
        }

        .post-content {
          padding: 0 16px 12px 16px;
          font-size: 14px;
          line-height: 1.42857;
          color: rgba(0, 0, 0, 0.9);
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .post-content.has-media {
          padding-bottom: 0;
        }

        .post-hashtag {
          color: #0a66c2;
          font-weight: 600;
          cursor: pointer;
        }

        .post-hashtag:hover {
          text-decoration: underline;
        }

        .post-media {
          margin-top: 12px;
          width: 100%;
        }

        .post-media img {
          width: 100%;
          height: auto;
          display: block;
        }

        .post-media-grid {
          display: grid;
          gap: 2px;
        }

        .post-media-grid.grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .post-media-grid.grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .post-media-grid.grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }

        .post-media-item {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .post-stats {
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
        }

        .post-stats-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .reactions-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          margin-left: -4px;
        }

        .reactions-icon:first-child {
          margin-left: 0;
        }

        .reaction-like {
          background: #378fe9;
          color: white;
        }

        .reaction-celebrate {
          background: #6dae4f;
          color: white;
        }

        .reaction-support {
          background: #df704d;
          color: white;
        }

        .post-actions {
          display: flex;
          padding: 4px 8px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .post-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 8px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.6);
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .post-action:hover {
          background-color: rgba(0, 0, 0, 0.08);
        }

        .action-icon {
          width: 20px;
          height: 20px;
        }

        .more-button {
          margin-left: auto;
          padding: 4px;
          background: transparent;
          border: none;
          color: rgba(0, 0, 0, 0.6);
          cursor: pointer;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .more-button:hover {
          background-color: rgba(0, 0, 0, 0.08);
        }

        .preview-label {
          position: absolute;
          top: -32px;
          left: 0;
          font-size: 12px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .preview-container {
          position: relative;
          margin-top: 40px;
        }
      `}</style>

      <div className="preview-container">
        <div className="preview-label">LinkedIn Preview</div>
        
        {/* Post Header */}
        <div className="post-header">
          <img 
            src={defaultAvatar} 
            alt={name} 
            className="profile-photo"
          />
          <div className="profile-info">
            <h3 className="profile-name">{name}</h3>
            <p className="profile-headline">{headline}</p>
            <div className="post-timestamp">
              <span>1m</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(0,0,0,0.6)">
                <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.19a.74.74 0 01.68 0l.38.19a.74.74 0 001.06-.53l.38-1.88a.74.74 0 00-.53-.91 5 5 0 00-2.7.24z"></path>
              </svg>
            </div>
          </div>
          <button className="more-button" aria-label="More options">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
              <path d="M14 12a2 2 0 11-2-2 2 2 0 012 2zM4 10a2 2 0 102 2 2 2 0 00-2-2zm16 0a2 2 0 102 2 2 2 0 00-2-2z"></path>
            </svg>
          </button>
        </div>

        {/* Post Content */}
        <div className={`post-content ${media.length > 0 ? 'has-media' : ''}`}>
          {formatPostContent(content)}
        </div>

        {/* Post Media */}
        {media.length > 0 && (
          <div className="post-media">
            {media.length === 1 ? (
              <img src={media[0]} alt="Post media" />
            ) : (
              <div className={`post-media-grid grid-${Math.min(media.length, 4)}`}>
                {media.slice(0, 4).map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Post media ${index + 1}`}
                    className="post-media-item"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Stats */}
        {showActions && (
          <>
            <div className="post-stats">
              <div className="post-stats-left">
                <span className="reactions-icon reaction-like">👍</span>
                <span className="reactions-icon reaction-celebrate">🎉</span>
                <span className="reactions-icon reaction-support">❤️</span>
                <span style={{ marginLeft: '4px' }}>23</span>
              </div>
              <div className="post-stats-right">
                <span>5 comments</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="post-actions">
              <button className="post-action">
                <svg className="action-icon" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
                  <path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-1.1a.49.49 0 01.08-.7.48.48 0 01.34-.11h7.05l-1.31-3.92A7 7 0 0110 4.86V3.75a.77.77 0 01.75-.75.75.75 0 01.71.51L12 5a9 9 0 002.13 3.5l4.5 4.5H19z"></path>
                </svg>
                <span>Like</span>
              </button>
              <button className="post-action">
                <svg className="action-icon" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
                  <path d="M7 9h10v1H7zm0 4h7v-1H7z"></path>
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18H5v3l6.33-3H20.5a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0020.5 2zM20 16.5a.5.5 0 01-.5.5H11l-4 2v-2H3.5a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5h17a.5.5 0 01.5.5z"></path>
                </svg>
                <span>Comment</span>
              </button>
              <button className="post-action">
                <svg className="action-icon" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
                  <path d="M23 12l-4.61 7H16l4-6H8a3 3 0 01-3-3V4h2v5a1 1 0 001 1h12l-4-6h2.39z"></path>
                </svg>
                <span>Repost</span>
              </button>
              <button className="post-action">
                <svg className="action-icon" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
                  <path d="M21 3L0 10l7.66 4.26L16 8l-6.26 8.34L14 24l7-21z"></path>
                </svg>
                <span>Send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to format post content with hashtags
 */
function formatPostContent(content) {
  if (!content) return null;

  // Split content by hashtags and format them
  const parts = content.split(/(#\w+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="post-hashtag">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
