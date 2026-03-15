// @custom — Fully custom landing page built from the Marta sketch
import { useState } from 'react';

const C = {
  primary: '#0891B2',
  primaryDark: '#0E7490',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  textDark: '#0f172a',
  textBody: '#1E293B',
  textMuted: '#64748B',
  bgWhite: '#ffffff',
  bgLight: '#f8fafc',
  border: '#E2E8F0',
};

const shadow = {
  sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
};

// ─── Icon helpers ───────────────────────────────────────────────────────────

const CheckIcon = ({ size = 20, color = C.success }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.accent} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronDownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textBody} strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BoltIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

// ─── Stars row ───────────────────────────────────────────────────────────────

const Stars = () => (
  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
  </div>
);

// ─── Section label ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: C.primary, marginBottom: 12,
  }}>{children}</div>
);

// ─── Section header ──────────────────────────────────────────────────────────

const SectionHeader = ({ label, title, subtitle }) => (
  <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 64px' }}>
    {label && <SectionLabel>{label}</SectionLabel>}
    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: C.textDark, letterSpacing: '-0.025em', marginBottom: 16, lineHeight: 1.2 }}>
      {title}
    </h2>
    {subtitle && <p style={{ fontSize: '1.1rem', color: C.textMuted, lineHeight: 1.7 }}>{subtitle}</p>}
  </div>
);

// ─── Feature card icon ───────────────────────────────────────────────────────

const FeatureIcon = ({ children }) => (
  <div style={{
    width: 48, height: 48, borderRadius: 12,
    background: 'rgba(8,145,178,0.1)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
);

// ─── Benefit icon ─────────────────────────────────────────────────────────────

const BenefitIcon = ({ children }) => (
  <div style={{
    width: 48, height: 48, borderRadius: 12,
    background: 'rgba(8,145,178,0.1)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
);

// ─── Showcase check list item ─────────────────────────────────────────────────

const ShowcaseLi = ({ children }) => (
  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.95rem', color: C.textBody }}>
    <div style={{ flexShrink: 0, marginTop: 2 }}>
      <CheckIcon size={20} />
    </div>
    {children}
  </li>
);

// ─── Pricing feature row ──────────────────────────────────────────────────────

const PricingLi = ({ disabled, children }) => (
  <li style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    fontSize: '0.9rem', color: disabled ? C.textMuted : C.textBody,
    borderBottom: `1px solid ${C.bgLight}`,
  }}>
    {disabled ? <XIcon /> : <CheckIcon size={18} />}
    {children}
  </li>
);

// ─── NAV ─────────────────────────────────────────────────────────────────────

function Nav({ mobileOpen, setMobileOpen }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
      padding: '0 24px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 1280, width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Taplio Alt" style={{ height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: C.textDark }}>Taplio Alt</span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-desktop">
          {[['#features','Features'],['#how-it-works','How It Works'],['#pricing','Pricing'],['#testimonials','Reviews']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.9rem', fontWeight: 500, color: C.textMuted, textDecoration: 'none' }}>
              {label}
            </a>
          ))}
          <a href="#" style={{
            background: C.primary, color: '#fff', padding: '8px 20px',
            borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            Start Free Trial
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Inline responsive style */}
      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      padding: '140px 24px 80px',
      background: 'linear-gradient(135deg, rgba(8,145,178,0.04) 0%, rgba(8,145,178,0.08) 50%, rgba(245,158,11,0.04) 100%)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blob */}
      <div style={{
        position: 'absolute', top: -200, right: -200,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(8,145,178,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(8,145,178,0.1)', color: C.primary,
          padding: '6px 16px', borderRadius: 24, fontSize: '0.85rem', fontWeight: 600,
          marginBottom: 24,
        }}>
          <BoltIcon size={16} />
          AI-powered LinkedIn growth
        </div>

        <h1 style={{ fontSize: '3.25rem', fontWeight: 800, lineHeight: 1.15, color: C.textDark, letterSpacing: '-0.03em', marginBottom: 20 }}>
          Schedule smarter,<br />
          <span style={{ color: C.primary }}>grow your audience</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: C.textMuted, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Create scroll-stopping LinkedIn posts with AI, schedule them at peak times, and track what works. The all-in-one LinkedIn content tool for creators and professionals — at 70% less than the competition.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" style={{
            background: C.primary, color: '#fff', padding: '14px 32px',
            borderRadius: 8, fontWeight: 600, fontSize: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', transition: 'all 150ms ease',
          }}>
            Start Free Trial <ArrowRightIcon size={18} />
          </a>
          <a href="#features" style={{
            background: 'transparent', color: C.textBody, padding: '14px 32px',
            borderRadius: 8, fontWeight: 600, fontSize: '1rem',
            border: `1px solid ${C.border}`,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}>
            <PlayIcon size={18} /> See How It Works
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 48, justifyContent: 'center', marginTop: 56,
          paddingTop: 40, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap',
        }}>
          {[
            { num: '2,400+', label: 'Active creators' },
            { num: '3.2x', label: 'Avg. engagement boost' },
            { num: '$29', label: 'Per month — that\'s it' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: C.textDark }}>{num}</div>
              <div style={{ fontSize: '0.85rem', color: C.textMuted, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────

function SocialProof() {
  const logos = ['HubSpot', 'Salesforce', 'Notion', 'Shopify', 'Figma', 'Stripe'];
  return (
    <section id="social-proof" style={{
      padding: '40px 24px', background: C.bgLight,
      textAlign: 'center', borderBottom: `1px solid ${C.border}`,
    }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, marginBottom: 20 }}>
        Trusted by professionals at
      </p>
      <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', opacity: 0.45 }}>
        {logos.map(name => (
          <span key={name} style={{ fontSize: '1.05rem', fontWeight: 700, color: C.textDark }}>{name}</span>
        ))}
      </div>
    </section>
  );
}

// ─── BENEFITS ────────────────────────────────────────────────────────────────

function Benefits() {
  const items = [
    {
      title: 'Write 10x Faster with AI',
      desc: 'Generate scroll-stopping posts in seconds. The AI learns your tone, industry, and audience — so every draft sounds like you, not a bot.',
      icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    },
    {
      title: 'Post at the Perfect Time',
      desc: 'Our algorithm analyzes when your audience is most active and automatically schedules your posts for maximum reach — no manual research needed.',
      icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    },
    {
      title: 'Know Exactly What Works',
      desc: 'Track impressions, engagement rate, profile views, and follower growth per post. Double down on your best content and cut what doesn\'t convert.',
      icon: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></>,
    },
    {
      title: 'Plan a Month in Minutes',
      desc: 'The visual content calendar lets you drag, drop, and schedule an entire month of posts in one sitting. Batch your content creation and never scramble again.',
      icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
    },
    {
      title: 'Turn Followers into Leads',
      desc: 'Identify who\'s engaging with your posts and automatically track warm leads. Taplio Alt bridges the gap between content and pipeline without leaving the platform.',
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    },
    {
      title: '70% Less Than Competitors',
      desc: 'Get every feature — AI writer, scheduler, analytics, lead tracker — for $29/mo. The category leader charges $149. Same results, a fraction of the cost.',
      icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    },
  ];

  return (
    <section id="benefits" style={{ padding: '96px 24px', background: C.bgWhite }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="Why Taplio Alt"
          title="Grow your LinkedIn presence on autopilot"
          subtitle="Stop spending hours staring at a blank screen. Taplio Alt handles the hard parts — so you stay consistent, relevant, and growing."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 28,
        }}>
          {items.map(({ title, desc, icon }) => (
            <div key={title} style={{
              display: 'flex', flexDirection: 'column', gap: 14, padding: 28,
              borderRadius: 12, background: C.bgLight, border: `1px solid ${C.border}`,
            }}>
              <BenefitIcon>{icon}</BenefitIcon>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.textDark }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: C.textMuted, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES overview grid ───────────────────────────────────────────────────

function FeaturesGrid() {
  const features = [
    {
      title: 'Authentication',
      desc: 'Secure email/password signup with one-click LinkedIn OAuth. Connect your LinkedIn account in seconds to unlock scheduling, analytics, and lead tools. Includes forgot-password recovery and session management — so you\'re always in control.',
      icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    },
    {
      title: 'AI Post Writer',
      desc: 'Create scroll-stopping LinkedIn posts in seconds with AI. Choose your topic, tone (professional, casual, or bold), and format (text, listicle, or story) — get a publish-ready post with hashtag suggestions. Rewrite, remix, and generate variations until it\'s perfect.',
      icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    },
    {
      title: 'Post Scheduler',
      desc: 'Schedule LinkedIn posts at the perfect time, every time. Pick a date and time or let smart suggestions find your audience\'s peak hours. Drag-and-drop queue management, timezone support, and bulk scheduling for content batches.',
      icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    },
    {
      title: 'Content Calendar',
      desc: 'See your entire content strategy at a glance. Week and month calendar views show scheduled, published, and draft posts color-coded by status. Drag-and-drop to reschedule instantly. Gap detection flags empty days so you never miss a beat.',
      icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    },
    {
      title: 'Content Templates',
      desc: 'Never start from a blank page again. Browse proven LinkedIn post templates — listicles, hot takes, storytelling, how-tos, carousel outlines, and engagement hooks. Each template comes with structure, examples, and fill-in prompts. Save your own winning formats.',
      icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    },
    {
      title: 'Engagement Analytics',
      desc: 'Know exactly what\'s working. Track impressions, likes, comments, shares, and click-through rates for every post. Watch your follower growth over time. See your best-performing content ranked and discover your optimal posting times with data-backed analysis.',
      icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    },
    {
      title: 'Lead Generation',
      desc: 'Turn engagement into pipeline. Automatically identify potential leads from everyone who likes, comments, and shares your posts. See enriched profiles with job title, company, and industry. Filter by engagement level, company size, or role to find ideal prospects.',
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    },
  ];

  return (
    <section id="features" style={{ padding: '96px 24px', background: C.bgWhite }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="Features"
          title="Everything you need to dominate LinkedIn"
          subtitle="Seven powerful tools in one platform. Write better, post consistently, and grow your network with data-driven decisions."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {features.map(({ title, desc, icon }) => (
            <div key={title} style={{
              background: C.bgWhite, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 32, position: 'relative',
              transition: 'all 150ms ease',
            }}>
              <FeatureIcon>{icon}</FeatureIcon>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.textDark, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: '0.92rem', color: C.textMuted, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES deep dive ───────────────────────────────────────────────────────

function FeatureShowcase() {
  const showcases = [
    {
      reverse: false,
      title: 'Write posts that get noticed',
      desc: 'The AI Post Writer doesn\'t just generate text — it crafts LinkedIn-native content that drives engagement. Choose your voice, format, and topic, then let AI handle the rest.',
      bullets: [
        'Multiple tones: professional, casual, bold',
        'Text, listicle, and story formats',
        'Auto-generated hashtag suggestions',
        'Unlimited rewrites and variations',
      ],
      visual: (
        <div style={{ width: '100%', padding: 24 }}>
          <div style={{ background: C.bgWhite, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(8,145,178,0.15)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.textDark }}>AI Draft</div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted }}>Professional tone</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: C.textBody, lineHeight: 1.6 }}>
              Most people think LinkedIn growth is about posting every day.<br /><br />
              It's not. It's about posting the <strong>right thing</strong> at the <strong>right time</strong>.<br /><br />
              Here's what actually moves the needle...
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Rewrite', bg: C.primary, color: '#fff' },
              { label: 'Change Tone', bg: C.bgLight, color: C.textMuted, border: `1px solid ${C.border}` },
              { label: 'Add Hashtags', bg: C.bgLight, color: C.textMuted, border: `1px solid ${C.border}` },
            ].map(b => (
              <div key={b.label} style={{ background: b.bg, color: b.color, padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, border: b.border || 'none' }}>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      reverse: true,
      title: 'Plan your week in minutes',
      desc: 'The Content Calendar gives you a bird\'s-eye view of your entire content strategy. Drag, drop, and never miss a posting day again.',
      bullets: [
        'Week and month views',
        'Color-coded post statuses',
        'Gap detection for empty days',
        'Click any slot to start writing',
      ],
      visual: (
        <div style={{ width: '100%', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} style={{ fontSize: '0.7rem', fontWeight: 600, color: C.textMuted, padding: 4 }}>{d}</div>
            ))}
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, margin: '0 auto 4px' }} />Published
            </div>
            <div style={{ background: 'rgba(8,145,178,0.1)', borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, margin: '0 auto 4px' }} />Scheduled
            </div>
            <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, margin: '0 auto 4px' }} />Draft
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, margin: '0 auto 4px' }} />Published
            </div>
            <div style={{ border: `1px dashed ${C.border}`, borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem', color: C.error }}>Gap!</div>
            <div style={{ background: 'rgba(8,145,178,0.1)', borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, margin: '0 auto 4px' }} />Scheduled
            </div>
            <div style={{ borderRadius: 6, padding: '8px 4px', fontSize: '0.7rem', color: C.textMuted }}>—</div>
          </div>
        </div>
      ),
    },
    {
      reverse: false,
      title: 'Understand what resonates',
      desc: 'Engagement Analytics shows you exactly what content drives results — so you can double down on winners and drop what doesn\'t work.',
      bullets: [
        'Track impressions, likes, comments, shares',
        'Follower growth over time',
        'Best-performing content ranked',
        'Export weekly/monthly reports to CSV',
      ],
      visual: (
        <div style={{ width: '100%', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Impressions', val: '24.8K', delta: '+18.3%' },
              { label: 'Engagement', val: '5.2%', delta: '+2.1%' },
              { label: 'Followers', val: '1,247', delta: '+89' },
            ].map(s => (
              <div key={s.label} style={{ background: C.bgWhite, borderRadius: 8, border: `1px solid ${C.border}`, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: C.textMuted }}>{s.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: C.textDark }}>{s.val}</div>
                <div style={{ fontSize: '0.7rem', color: C.success, fontWeight: 600 }}>{s.delta}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 8px' }}>
            {[40,55,45,70,60,85,100].map((h, i) => (
              <div key={i} style={{
                flex: 1,
                background: `rgba(8,145,178,${0.3 + i * 0.1})`,
                height: `${h}%`,
                borderRadius: '3px 3px 0 0',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '0.6rem', color: C.textMuted }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section style={{ padding: '96px 24px', background: C.bgLight }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="Deep Dive"
          title="Powerful tools, simple workflows"
          subtitle="See how Taplio Alt helps you create, schedule, and grow — without the complexity."
        />
        {showcases.map(({ reverse, title, desc, bullets, visual }, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 64,
            marginBottom: idx < showcases.length - 1 ? 80 : 0,
            flexDirection: reverse ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
          }}>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.textDark, marginBottom: 16, letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: '1rem', color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
                {bullets.map(b => <ShowcaseLi key={b}>{b}</ShowcaseLi>)}
              </ul>
            </div>
            {/* Visual */}
            <div style={{
              flex: 1, minWidth: 280, background: C.bgLight, borderRadius: 12,
              border: `1px solid ${C.border}`, overflow: 'hidden',
              minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { num: 1, title: 'Connect LinkedIn', desc: 'Sign up with email or Google, then connect your LinkedIn with one click. Secure OAuth — we never see your password.' },
    { num: 2, title: 'Generate content', desc: 'Use the AI Post Writer to create engaging posts in seconds. Pick a template or start fresh — the AI adapts to your voice.' },
    { num: 3, title: 'Schedule and publish', desc: 'Drop posts into your Content Calendar. Our smart scheduler suggests peak times for maximum reach and engagement.' },
    { num: 4, title: 'Grow and convert', desc: 'Track performance with Engagement Analytics, discover leads from your audience, and build your pipeline automatically.' },
  ];

  return (
    <section id="how-it-works" style={{ padding: '96px 24px', background: C.bgWhite }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="How It Works"
          title="From zero to LinkedIn authority in 4 steps"
          subtitle="Getting started takes less than 2 minutes. No credit card required."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {steps.map(({ num, title, desc }) => (
            <div key={num} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: C.primary, color: '#fff', fontWeight: 800, fontSize: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>{num}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.textDark, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: C.textMuted, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: 'Free', desc: 'For getting started', price: '$0', period: 'Free forever', featured: false,
      features: [
        { label: '5 AI-generated posts per month' },
        { label: 'Basic post scheduling' },
        { label: 'Content Calendar (week view)' },
        { label: '3 content templates' },
        { label: 'Engagement Analytics', disabled: true },
        { label: 'Lead Generation', disabled: true },
      ],
      cta: 'Get Started', ctaStyle: 'outline',
    },
    {
      name: 'Pro', desc: 'For serious creators', price: '$29', period: 'Billed monthly', featured: true,
      features: [
        { label: 'Unlimited AI post generation' },
        { label: 'Advanced scheduling + bulk queue' },
        { label: 'Full Content Calendar (month view)' },
        { label: 'All content templates + custom saves' },
        { label: 'Full Engagement Analytics + export' },
        { label: 'Lead Generation (up to 500/mo)' },
      ],
      cta: 'Start Free Trial', ctaStyle: 'primary',
    },
    {
      name: 'Enterprise', desc: 'For teams and agencies', price: '$79', period: 'Billed monthly', featured: false,
      features: [
        { label: 'Everything in Pro' },
        { label: 'Up to 10 LinkedIn accounts' },
        { label: 'Team collaboration + approvals' },
        { label: 'Custom AI voice training' },
        { label: 'Unlimited Lead Generation + CRM' },
        { label: 'Priority support + onboarding' },
      ],
      cta: 'Contact Sales', ctaStyle: 'outline',
    },
  ];

  return (
    <section id="pricing" style={{ padding: '96px 24px', background: C.bgLight }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="Pricing"
          title="Simple pricing, no surprises"
          subtitle="Start free, upgrade when you're ready. Cancel anytime — no contracts, no tricks."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'start' }}>
          {plans.map(({ name, desc, price, period, featured, features, cta, ctaStyle }) => (
            <div key={name} style={{
              background: C.bgWhite, border: `1px solid ${featured ? C.primary : C.border}`,
              borderRadius: 12, padding: '40px 32px', textAlign: 'center',
              position: 'relative',
              boxShadow: featured ? shadow.lg : 'none',
              transform: featured ? 'scale(1.02)' : 'none',
            }}>
              {featured && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: C.primary, color: '#fff', padding: '4px 20px', borderRadius: 20,
                  fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}>Most Popular</div>
              )}
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.textDark, marginBottom: 8 }}>{name}</div>
              <div style={{ fontSize: '0.85rem', color: C.textMuted, marginBottom: 24 }}>{desc}</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: C.textDark, marginBottom: 4 }}>
                {price}<span style={{ fontSize: '1rem', fontWeight: 500, color: C.textMuted }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: C.textMuted, marginBottom: 32 }}>{period}</div>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 32, padding: 0 }}>
                {features.map(({ label, disabled }) => (
                  <PricingLi key={label} disabled={disabled}>{label}</PricingLi>
                ))}
              </ul>
              <button style={{
                width: '100%', padding: '12px 24px', borderRadius: 8,
                fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                background: ctaStyle === 'primary' ? C.primary : 'transparent',
                color: ctaStyle === 'primary' ? '#fff' : C.textBody,
                border: ctaStyle === 'primary' ? 'none' : `1px solid ${C.border}`,
              }}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    {
      quote: 'I went from 200 impressions per post to 5,000+ in three weeks. The AI writer nails my voice and the scheduling feature means I never miss a day. Best $29 I spend each month.',
      name: 'Sarah Kim', role: 'Marketing Director at Finova', initials: 'SK',
    },
    {
      quote: 'As a startup founder, LinkedIn is my top channel for leads. Taplio Alt\'s Lead Generation feature has replaced two separate tools I was paying $150/mo for. The content templates alone are worth the subscription.',
      name: 'Marcus Reeves', role: 'CEO at CloudSync Labs', initials: 'MR',
    },
    {
      quote: 'The Content Calendar changed how I plan my week. I batch-create posts on Sunday, schedule them all, and focus on engagement the rest of the week. My network has grown 4x in two months.',
      name: 'Ana Lopes', role: 'Freelance Consultant, B2B Strategy', initials: 'AL',
    },
  ];

  return (
    <section id="testimonials" style={{ padding: '96px 24px', background: C.bgWhite }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="Testimonials"
          title="Loved by LinkedIn creators"
          subtitle="See what professionals are saying about Taplio Alt."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {testimonials.map(({ quote, name, role, initials }) => (
            <div key={name} style={{
              background: C.bgWhite, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 32,
            }}>
              <Stars />
              <blockquote style={{ fontSize: '0.95rem', color: C.textBody, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                "{quote}"
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(8,145,178,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem', color: C.primary,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: C.textDark }}>{name}</div>
                  <div style={{ fontSize: '0.8rem', color: C.textMuted }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section id="cta" style={{
      padding: '96px 24px', textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(8,145,178,0.04), rgba(8,145,178,0.08))',
    }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: C.textDark, letterSpacing: '-0.03em', marginBottom: 16 }}>
        Ready to grow your LinkedIn?
      </h2>
      <p style={{ fontSize: '1.15rem', color: C.textMuted, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
        Join 2,400+ creators who schedule smarter and grow faster with Taplio Alt.
      </p>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: C.primary, color: '#fff',
        padding: '16px 40px', borderRadius: 8,
        fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none',
      }}>
        Start Your Free Trial <ArrowRightIcon size={20} />
      </a>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: 'Does Taplio Alt connect directly to my LinkedIn account?',
      a: 'Yes. You connect via LinkedIn\'s official OAuth — no passwords stored, no third-party scraping. Taplio Alt only requests the permissions needed to schedule and publish posts on your behalf.',
    },
    {
      q: 'Will the AI-generated posts sound like me?',
      a: 'The AI analyzes your existing posts to learn your voice, industry, and preferred style. The more you use it, the better it gets. You always review and edit before anything is published.',
    },
    {
      q: 'Is there a free trial? Do I need a credit card?',
      a: 'Yes — you get a 14-day free trial with full access to every feature, no credit card required. If you don\'t love it, you pay nothing.',
    },
    {
      q: 'Can I schedule posts for LinkedIn company pages too?',
      a: 'Yes. You can manage both personal profiles and company pages from the same dashboard. The Pro plan supports up to 3 LinkedIn profiles, and the Team plan is unlimited.',
    },
    {
      q: 'What happens if a scheduled post fails to publish?',
      a: 'You\'ll receive an instant email and in-app alert with the reason for the failure (e.g., token expiry, LinkedIn API issue). The post is queued for a retry and you can reschedule it in one click.',
    },
    {
      q: 'How is Taplio Alt different from Taplio?',
      a: 'Taplio Alt offers equivalent core features — AI writing, scheduling, analytics, lead generation — at $29/mo versus $149/mo for the category leader. We focus on what actually moves the needle, without the bloat.',
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Absolutely. Cancel anytime from your account settings — no calls, no retention forms. Your access continues until the end of the billing period. We don\'t do dark patterns.',
    },
    {
      q: 'Is my LinkedIn data secure?',
      a: 'All data is encrypted in transit and at rest. We never sell your data or use your posts to train models for other customers. Full details are in our privacy policy.',
    },
  ];

  return (
    <section id="faq" style={{ padding: '96px 24px', background: C.bgLight }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          label="FAQ"
          title="Questions before you commit?"
          subtitle="Everything you need to know about Taplio Alt — answered."
        />
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          {faqs.map(({ q, a }, idx) => (
            <div key={idx} style={{ borderBottom: `1px solid ${C.border}`, borderTop: idx === 0 ? `1px solid ${C.border}` : 'none' }}>
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                style={{
                  width: '100%', padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                  fontSize: '1rem', fontWeight: 600, color: C.textDark, textAlign: 'left',
                }}
              >
                {q}
                <div style={{ flexShrink: 0, transition: 'transform 200ms ease', transform: open === idx ? 'rotate(180deg)' : 'none' }}>
                  <ChevronDownIcon size={18} />
                </div>
              </button>
              {open === idx && (
                <div style={{ fontSize: '0.92rem', color: C.textMuted, lineHeight: 1.7, paddingBottom: 20 }}>
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="footer" style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, padding: '64px 24px 32px' }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48,
      }}>
        {/* Brand */}
        <div style={{ gridColumn: 'span 1' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
            <img src="/logo.png" alt="Taplio Alt" style={{ height: 28 }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: C.textDark }}>Taplio Alt</span>
          </a>
          <p style={{ fontSize: '0.9rem', color: C.textMuted, lineHeight: 1.6, maxWidth: 300 }}>
            AI-powered LinkedIn content creation and scheduling. Write better posts, schedule at peak times, and grow your professional audience.
          </p>
        </div>

        {/* Columns */}
        {[
          { heading: 'Product', links: [['#features','Features'],['#pricing','Pricing'],['#','Changelog'],['#','Integrations']] },
          { heading: 'Resources', links: [['#','Blog'],['#','LinkedIn Tips'],['#','API Docs'],['#','Help Center']] },
          { heading: 'Company', links: [['#','About'],['#','Contact'],['#','Privacy Policy'],['#','Terms of Service']] },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: C.textDark, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {heading}
            </h4>
            {links.map(([href, label]) => (
              <a key={label} href={href} style={{ display: 'block', fontSize: '0.9rem', color: C.textMuted, padding: '4px 0', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: 1280, margin: '40px auto 0',
        paddingTop: 24, borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.8rem', color: C.textMuted, flexWrap: 'wrap', gap: 8,
      }}>
        <span>© 2026 Taplio Alt. All rights reserved.</span>
        <span>Made with care for LinkedIn creators.</span>
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: C.textBody, lineHeight: 1.625, background: C.bgWhite, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { transition: color 150ms ease; }
      `}</style>

      {/* 1. NAV */}
      <Nav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* 2. HERO */}
      <Hero />

      {/* 3. SOCIAL PROOF */}
      <SocialProof />

      {/* 4. BENEFITS */}
      <Benefits />

      {/* 5. FEATURES (overview + deep dive) */}
      <FeaturesGrid />
      <FeatureShowcase />

      {/* 6. HOW IT WORKS */}
      <HowItWorks />

      {/* PRICING (from sketch) */}
      <Pricing />

      {/* 7. TESTIMONIALS */}
      <Testimonials />

      {/* 8. CTA */}
      <CTA />

      {/* 9. FAQ */}
      <FAQ />

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
}
