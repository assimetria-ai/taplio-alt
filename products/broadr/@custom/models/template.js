// @custom/models/template.js - Post Template Model

/**
 * Template Model
 * Handles saving and loading post templates for common formats
 */

const TEMPLATE_TYPE = {
  ANNOUNCEMENT: 'announcement',
  POLL: 'poll',
  CASE_STUDY: 'case_study',
  PRODUCT_LAUNCH: 'product_launch',
  EVENT_INVITE: 'event_invite',
  NEWSLETTER: 'newsletter',
  PROMOTION: 'promotion',
  UPDATE: 'update',
  CUSTOM: 'custom'
};

const TEMPLATE_VISIBILITY = {
  PRIVATE: 'private',    // Only visible to creator
  TEAM: 'team',          // Visible to workspace members
  PUBLIC: 'public'       // System templates, visible to all
};

/**
 * Template Schema
 */
const TemplateSchema = {
  id: 'String (UUID)',
  userId: 'String (creator)',
  workspaceId: 'String (optional)',
  
  // Template Metadata
  name: 'String', // e.g., "Product Launch Announcement"
  description: 'String (optional)', // Brief description of template
  type: TEMPLATE_TYPE.ANNOUNCEMENT,
  visibility: TEMPLATE_VISIBILITY.PRIVATE,
  
  // Template Content Structure
  content: {
    subject: 'String (template)', // Subject line with variables
    body: 'String (HTML/text template)', // Body content with variables
    preview: 'String (optional)', // Email preview text
    
    // Variable definitions
    variables: [
      {
        name: 'String', // e.g., "product_name"
        label: 'String', // e.g., "Product Name"
        type: 'String', // 'text' | 'date' | 'number' | 'url' | 'email'
        required: 'Boolean',
        defaultValue: 'String (optional)',
        placeholder: 'String (optional)'
      }
    ],
    
    // Channel-specific variations
    channelOverrides: {
      sms: {
        body: 'String (shorter SMS version)'
      },
      push: {
        title: 'String',
        body: 'String (brief push notification)'
      },
      social: {
        body: 'String (social media friendly)',
        hashtags: ['String']
      }
    }
  },
  
  // Channel Configuration
  channels: ['email', 'sms', 'push'], // Default enabled channels
  
  // Template Design
  design: {
    theme: 'String', // 'minimal' | 'bold' | 'elegant' | 'modern'
    colors: {
      primary: 'String (hex)',
      secondary: 'String (hex)',
      background: 'String (hex)',
      text: 'String (hex)'
    },
    layout: 'String', // 'single_column' | 'two_column' | 'centered'
    headerImage: 'String (URL, optional)',
    footerText: 'String (optional)'
  },
  
  // Usage Statistics
  stats: {
    usedCount: 0,
    lastUsedAt: 'DateTime (nullable)',
    avgOpenRate: 0,
    avgClickRate: 0
  },
  
  // Tags & Organization
  tags: ['String'], // e.g., ['marketing', 'product', 'urgent']
  category: 'String (optional)', // e.g., 'Sales', 'Support', 'Marketing'
  
  // System Fields
  isSystemTemplate: false, // Built-in templates
  isArchived: false,
  createdAt: 'DateTime',
  updatedAt: 'DateTime',
  createdBy: 'String (userId)',
  updatedBy: 'String (userId)'
};

/**
 * Predefined System Templates
 * Built-in templates for common use cases
 */
const SYSTEM_TEMPLATES = [
  {
    name: 'Product Launch Announcement',
    description: 'Announce a new product or feature to your audience',
    type: TEMPLATE_TYPE.PRODUCT_LAUNCH,
    visibility: TEMPLATE_VISIBILITY.PUBLIC,
    isSystemTemplate: true,
    content: {
      subject: 'Introducing {{product_name}} 🚀',
      body: `
        <h1>We're excited to announce {{product_name}}!</h1>
        
        <p>{{product_description}}</p>
        
        <p><strong>Key Features:</strong></p>
        <ul>
          <li>{{feature_1}}</li>
          <li>{{feature_2}}</li>
          <li>{{feature_3}}</li>
        </ul>
        
        <p>Available starting {{launch_date}}.</p>
        
        <a href="{{cta_url}}" style="background: #5B4CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          {{cta_text}}
        </a>
      `,
      preview: 'Big news! We just launched {{product_name}}',
      variables: [
        { name: 'product_name', label: 'Product Name', type: 'text', required: true },
        { name: 'product_description', label: 'Product Description', type: 'text', required: true },
        { name: 'feature_1', label: 'Feature 1', type: 'text', required: true },
        { name: 'feature_2', label: 'Feature 2', type: 'text', required: false },
        { name: 'feature_3', label: 'Feature 3', type: 'text', required: false },
        { name: 'launch_date', label: 'Launch Date', type: 'date', required: true },
        { name: 'cta_url', label: 'Call-to-Action URL', type: 'url', required: true },
        { name: 'cta_text', label: 'Button Text', type: 'text', required: false, defaultValue: 'Learn More' }
      ],
      channelOverrides: {
        sms: {
          body: '🚀 {{product_name}} is here! {{product_description}} Learn more: {{cta_url}}'
        },
        push: {
          title: 'Introducing {{product_name}}',
          body: '{{product_description}}'
        }
      }
    },
    channels: ['email', 'sms', 'push', 'social'],
    tags: ['product', 'launch', 'announcement'],
    category: 'Marketing'
  },
  
  {
    name: 'Community Poll',
    description: 'Engage your audience with a poll or survey',
    type: TEMPLATE_TYPE.POLL,
    visibility: TEMPLATE_VISIBILITY.PUBLIC,
    isSystemTemplate: true,
    content: {
      subject: 'We want your input: {{poll_question}}',
      body: `
        <h2>{{poll_question}}</h2>
        
        <p>{{poll_context}}</p>
        
        <p><strong>Cast your vote:</strong></p>
        <div style="margin: 20px 0;">
          <a href="{{option_1_url}}" style="display: block; padding: 12px; margin: 8px 0; background: #f3f4f6; text-align: center; text-decoration: none; color: #1f2937; border-radius: 6px;">
            {{option_1}}
          </a>
          <a href="{{option_2_url}}" style="display: block; padding: 12px; margin: 8px 0; background: #f3f4f6; text-align: center; text-decoration: none; color: #1f2937; border-radius: 6px;">
            {{option_2}}
          </a>
          <a href="{{option_3_url}}" style="display: block; padding: 12px; margin: 8px 0; background: #f3f4f6; text-align: center; text-decoration: none; color: #1f2937; border-radius: 6px;">
            {{option_3}}
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">Voting closes {{deadline}}. Results will be shared soon!</p>
      `,
      preview: 'We need your opinion on {{poll_question}}',
      variables: [
        { name: 'poll_question', label: 'Poll Question', type: 'text', required: true },
        { name: 'poll_context', label: 'Context/Description', type: 'text', required: false },
        { name: 'option_1', label: 'Option 1', type: 'text', required: true },
        { name: 'option_1_url', label: 'Option 1 Vote Link', type: 'url', required: true },
        { name: 'option_2', label: 'Option 2', type: 'text', required: true },
        { name: 'option_2_url', label: 'Option 2 Vote Link', type: 'url', required: true },
        { name: 'option_3', label: 'Option 3', type: 'text', required: false },
        { name: 'option_3_url', label: 'Option 3 Vote Link', type: 'url', required: false },
        { name: 'deadline', label: 'Voting Deadline', type: 'date', required: false }
      ],
      channelOverrides: {
        sms: {
          body: '📊 {{poll_question}} Vote now: {{option_1_url}}'
        }
      }
    },
    channels: ['email', 'social'],
    tags: ['poll', 'engagement', 'feedback'],
    category: 'Engagement'
  },
  
  {
    name: 'Case Study Showcase',
    description: 'Share customer success stories and case studies',
    type: TEMPLATE_TYPE.CASE_STUDY,
    visibility: TEMPLATE_VISIBILITY.PUBLIC,
    isSystemTemplate: true,
    content: {
      subject: 'How {{company_name}} achieved {{result}} with {{product_name}}',
      body: `
        <h1>Case Study: {{company_name}}</h1>
        
        <p style="font-size: 18px; color: #6b7280;">{{headline}}</p>
        
        <h2>The Challenge</h2>
        <p>{{challenge}}</p>
        
        <h2>The Solution</h2>
        <p>{{solution}}</p>
        
        <h2>The Results</h2>
        <ul>
          <li><strong>{{metric_1_label}}:</strong> {{metric_1_value}}</li>
          <li><strong>{{metric_2_label}}:</strong> {{metric_2_value}}</li>
          <li><strong>{{metric_3_label}}:</strong> {{metric_3_value}}</li>
        </ul>
        
        <blockquote style="border-left: 4px solid #5B4CFF; padding-left: 16px; margin: 24px 0; font-style: italic; color: #4b5563;">
          "{{testimonial}}"
          <br><br>
          — {{testimonial_author}}, {{testimonial_role}} at {{company_name}}
        </blockquote>
        
        <a href="{{cta_url}}" style="background: #5B4CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Read Full Case Study
        </a>
      `,
      preview: 'See how {{company_name}} achieved {{result}}',
      variables: [
        { name: 'company_name', label: 'Company Name', type: 'text', required: true },
        { name: 'product_name', label: 'Your Product Name', type: 'text', required: true },
        { name: 'headline', label: 'Headline', type: 'text', required: true },
        { name: 'result', label: 'Key Result (brief)', type: 'text', required: true },
        { name: 'challenge', label: 'The Challenge', type: 'text', required: true },
        { name: 'solution', label: 'The Solution', type: 'text', required: true },
        { name: 'metric_1_label', label: 'Metric 1 Label', type: 'text', required: true },
        { name: 'metric_1_value', label: 'Metric 1 Value', type: 'text', required: true },
        { name: 'metric_2_label', label: 'Metric 2 Label', type: 'text', required: false },
        { name: 'metric_2_value', label: 'Metric 2 Value', type: 'text', required: false },
        { name: 'metric_3_label', label: 'Metric 3 Label', type: 'text', required: false },
        { name: 'metric_3_value', label: 'Metric 3 Value', type: 'text', required: false },
        { name: 'testimonial', label: 'Customer Quote', type: 'text', required: true },
        { name: 'testimonial_author', label: 'Quote Author Name', type: 'text', required: true },
        { name: 'testimonial_role', label: 'Author Role/Title', type: 'text', required: true },
        { name: 'cta_url', label: 'Full Case Study URL', type: 'url', required: true }
      ]
    },
    channels: ['email', 'social'],
    tags: ['case-study', 'testimonial', 'success-story'],
    category: 'Sales'
  },
  
  {
    name: 'Event Invitation',
    description: 'Invite your audience to webinars, conferences, or events',
    type: TEMPLATE_TYPE.EVENT_INVITE,
    visibility: TEMPLATE_VISIBILITY.PUBLIC,
    isSystemTemplate: true,
    content: {
      subject: 'You're invited: {{event_name}} on {{event_date}}',
      body: `
        <h1>🎉 You're Invited!</h1>
        
        <h2>{{event_name}}</h2>
        
        <p>{{event_description}}</p>
        
        <p><strong>📅 When:</strong> {{event_date}} at {{event_time}}</p>
        <p><strong>📍 Where:</strong> {{event_location}}</p>
        
        <p><strong>What to expect:</strong></p>
        <ul>
          <li>{{agenda_1}}</li>
          <li>{{agenda_2}}</li>
          <li>{{agenda_3}}</li>
        </ul>
        
        <a href="{{rsvp_url}}" style="background: #5B4CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          RSVP Now
        </a>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">Limited spots available. Register by {{rsvp_deadline}}.</p>
      `,
      preview: 'Join us for {{event_name}} on {{event_date}}',
      variables: [
        { name: 'event_name', label: 'Event Name', type: 'text', required: true },
        { name: 'event_description', label: 'Event Description', type: 'text', required: true },
        { name: 'event_date', label: 'Event Date', type: 'date', required: true },
        { name: 'event_time', label: 'Event Time', type: 'text', required: true },
        { name: 'event_location', label: 'Location (or "Online")', type: 'text', required: true },
        { name: 'agenda_1', label: 'Agenda Item 1', type: 'text', required: true },
        { name: 'agenda_2', label: 'Agenda Item 2', type: 'text', required: false },
        { name: 'agenda_3', label: 'Agenda Item 3', type: 'text', required: false },
        { name: 'rsvp_url', label: 'RSVP Link', type: 'url', required: true },
        { name: 'rsvp_deadline', label: 'RSVP Deadline', type: 'date', required: false }
      ],
      channelOverrides: {
        sms: {
          body: '🎉 You're invited to {{event_name}} on {{event_date}}! RSVP: {{rsvp_url}}'
        },
        push: {
          title: 'Event Invitation: {{event_name}}',
          body: '{{event_date}} at {{event_time}}. Tap to RSVP.'
        }
      }
    },
    channels: ['email', 'sms', 'push'],
    tags: ['event', 'invitation', 'webinar'],
    category: 'Events'
  }
];

module.exports = {
  TemplateSchema,
  TEMPLATE_TYPE,
  TEMPLATE_VISIBILITY,
  SYSTEM_TEMPLATES
};
