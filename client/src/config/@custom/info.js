// @custom — Taplio Alt product-specific config
// Overrides @system/info.js defaults. Never overwritten during template sync.

export const customInfo = {
  name: 'Taplio Alt',
  tagline: 'Schedule smarter, grow your audience',
  description:
    'LinkedIn content creation and scheduling tool. AI-powered post writer, scheduling, analytics, lead generation from LinkedIn. $99/mo. Very focused niche with high intent buyers.',
  url: import.meta.env.VITE_APP_URL ?? 'https://taplio-web-production.up.railway.app',
  supportEmail: 'support@taplioalt.com',
  brandColor: '#0891B2',
  features: [
    {
      key: 'authentication',
      name: 'Authentication',
      description:
        'Secure email/password signup with one-click LinkedIn OAuth. Connect your LinkedIn account in seconds to unlock scheduling, analytics, and lead tools. Includes forgot-password recovery and session management — so you\'re always in control.',
    },
    {
      key: 'ai-post-writer',
      name: 'AI Post Writer',
      description:
        'Create scroll-stopping LinkedIn posts in seconds with AI. Choose your topic, tone (professional, casual, or bold), and format (text, listicle, or story) — get a publish-ready post with hashtag suggestions. Rewrite, remix, and generate variations until it\'s perfect. All for $29/mo — 70% less than Taplio.',
    },
    {
      key: 'post-scheduler',
      name: 'Post Scheduler',
      description:
        'Schedule LinkedIn posts at the perfect time, every time. Pick a date and time or let smart suggestions find your audience\'s peak hours. Drag-and-drop queue management, timezone support, draft-to-scheduled workflow, and bulk scheduling for content batches — stay consistent without the stress.',
    },
    {
      key: 'content-calendar',
      name: 'Content Calendar',
      description:
        'See your entire content strategy at a glance. Week and month calendar views show scheduled, published, and draft posts color-coded by status. Drag-and-drop to reschedule instantly. Gap detection flags empty days so you never miss a beat. Click any slot to start writing.',
    },
    {
      key: 'content-templates',
      name: 'Content Templates',
      description:
        'Never start from a blank page again. Browse proven LinkedIn post templates — listicles, hot takes, storytelling, how-tos, carousel outlines, and engagement hooks. Each template comes with structure, examples, and fill-in prompts. Save your own winning formats as custom templates. Organized by category: thought leadership, product launch, personal branding, and hiring.',
    },
    {
      key: 'engagement-analytics',
      name: 'Engagement Analytics',
      description:
        'Know exactly what\'s working. Track impressions, likes, comments, shares, and click-through rates for every post. Watch your follower growth over time. See your best-performing content ranked. Discover your optimal posting times with data-backed analysis. Get weekly and monthly performance summaries you can export to CSV.',
    },
    {
      key: 'lead-generation',
      name: 'Lead Generation',
      description:
        'Turn engagement into pipeline. Automatically identify potential leads from everyone who likes, comments, and shares your posts. See enriched profiles with job title, company, and industry. Filter by engagement level, company size, or role to find your ideal prospects. Export lead lists to CSV or manage follow-ups with built-in CRM notes and reminders.',
    },
  ],
}
