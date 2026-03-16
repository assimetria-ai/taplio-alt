import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Lucide-style inline SVG icons ─── */
const Icon = ({ d, size = 24, stroke = '#3A8BFD', strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const LinkIcon = (p) => <Icon {...p} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />;
const BarChartIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
  </svg>
);
const GlobeIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const QRIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M18 18h3v3h-3z" /><path d="M14 18h3v3" /><path d="M18 14h3v3" />
  </svg>
);
const LayoutIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
  </svg>
);
const UsersIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CodeIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const TargetIcon = (p) => (
  <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.stroke||'#3A8BFD'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const CheckIcon = (p) => <Icon {...p} d="M20 6 9 17l-5-5" />;
const ArrowRightIcon = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;
const StarIcon = (p) => (
  <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth={1.5}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ─── Feature data (all 8 product features) ─── */
const features = [
  {
    icon: LinkIcon,
    name: 'Link Shortening',
    description: 'Create short links with custom slugs, automatic slug generation, bulk link creation, link expiration dates, password protection, and flexible redirect rules (301/302/307).'
  },
  {
    icon: BarChartIcon,
    name: 'Click Analytics',
    description: 'Real-time click tracking with geographic breakdown, device and browser detection, referrer attribution, time-series charts, and exportable CSV reports.'
  },
  {
    icon: GlobeIcon,
    name: 'Custom Domains',
    description: 'Connect your own domain for branded short links like go.yourcompany.com. Includes DNS verification, automatic SSL provisioning, and default domain fallback.'
  },
  {
    icon: QRIcon,
    name: 'QR Code Generation',
    description: 'Auto-generate customizable QR codes for every link. Download as PNG or SVG, customize colors and logo overlay, and track QR vs direct clicks separately.'
  },
  {
    icon: LayoutIcon,
    name: 'Link Management Dashboard',
    description: 'Central dashboard to view, search, filter, sort, and bulk-manage all your links. Organize with tags, folders, favorites, archive, and instant search.'
  },
  {
    icon: UsersIcon,
    name: 'Team Workspaces',
    description: 'Multi-user workspaces with role-based access for owners, editors, and viewers. Shared link collections, detailed activity logs, and workspace-level analytics.'
  },
  {
    icon: CodeIcon,
    name: 'API Access',
    description: 'RESTful API for programmatic link creation, management, and analytics retrieval. Scoped API keys, rate limiting, and webhook support for real-time click events.'
  },
  {
    icon: TargetIcon,
    name: 'UTM Builder',
    description: 'Build, save, and reuse UTM parameter templates for campaign tracking. Auto-append UTM tags to links with preset templates for Google Analytics, Meta Ads, and more.'
  }
];

/* ─── Pricing tiers ─── */
const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals and small projects',
    features: ['Up to 1,000 links', '5,000 tracked clicks/mo', 'Basic analytics', 'QR code generation', '1 custom domain', 'Standard support'],
    cta: 'Get Started Free',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing teams and serious marketers',
    features: ['Unlimited links', '100,000 tracked clicks/mo', 'Advanced analytics & exports', 'Custom QR codes with logo', '10 custom domains', 'Team workspaces (up to 5)', 'API access', 'UTM Builder', 'Priority support'],
    cta: 'Start Pro Trial',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/month',
    description: 'For organizations that need full control',
    features: ['Unlimited everything', 'Unlimited tracked clicks', 'White-label branding', 'Unlimited custom domains', 'Unlimited team members', 'Full API with webhooks', 'SSO & SAML', 'Dedicated account manager', 'SLA guarantee', '99.99% uptime'],
    cta: 'Contact Sales',
    highlighted: false
  }
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Growth, Launchpad.io',
    avatar: 'SC',
    text: 'Linkforge replaced three separate tools for us. The analytics depth is incredible — we can see exactly which channels drive conversions and optimize our campaigns in real-time.',
    rating: 5
  },
  {
    name: 'Marcus Williams',
    role: 'Marketing Director, NovaTech',
    avatar: 'MW',
    text: "The custom domains feature alone was worth switching. Our branded links get 34% higher click-through rates. The team workspace keeps everyone aligned without stepping on each other's links.",
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    role: 'Founder, ContentPulse',
    avatar: 'ER',
    text: "We process over 50,000 links a month through Linkforge's API. It's rock-solid, well-documented, and the webhook support means our dashboards update in real-time. Best link infrastructure we've used.",
    rating: 5
  }
];

/* ─── Styles ─── */
const styles = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1E293B',
    overflowX: 'hidden',
    lineHeight: 1.6
  },
  /* ── Nav ── */
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E2E8F0',
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '100%'
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20, color: '#1E293B', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 32, alignItems: 'center' },
  navLink: { color: '#64748B', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.15s' },
  navCTA: {
    background: '#3A8BFD', color: '#fff', padding: '8px 20px', borderRadius: 8,
    fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', textDecoration: 'none',
    transition: 'background 0.15s, box-shadow 0.15s'
  },
  /* ── Hero ── */
  hero: {
    position: 'relative',
    padding: '100px 32px 80px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, rgba(58,139,253,0.04) 0%, #FFFFFF 50%)',
    overflow: 'hidden'
  },
  heroTitle: { fontSize: 52, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 auto 20px', maxWidth: 720 },
  heroAccent: { color: '#3A8BFD' },
  heroSub: { fontSize: 18, color: '#64748B', margin: '0 auto 36px', maxWidth: 560, lineHeight: 1.6 },
  heroCTAs: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  heroPrimary: {
    background: '#3A8BFD', color: '#fff', padding: '14px 32px', borderRadius: 8,
    fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 14px rgba(58,139,253,0.3)', transition: 'all 0.2s'
  },
  heroSecondary: {
    background: 'transparent', color: '#3A8BFD', padding: '14px 32px', borderRadius: 8,
    fontWeight: 600, fontSize: 16, border: '1.5px solid #3A8BFD', cursor: 'pointer', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s'
  },
  heroStats: { display: 'flex', gap: 48, justifyContent: 'center', marginTop: 56 },
  heroStat: { textAlign: 'center' },
  heroStatVal: { fontSize: 32, fontWeight: 700, color: '#1E293B' },
  heroStatLabel: { fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 4 },
  /* ── Sections ── */
  section: (bg) => ({ padding: '80px 32px', background: bg }),
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.01em' },
  sectionSub: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 56, maxWidth: 560, margin: '0 auto 56px' },
  /* ── Features grid ── */
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 },
  featCard: {
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s'
  },
  featIconWrap: {
    width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(58,139,253,0.08)', marginBottom: 16
  },
  featName: { fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1E293B' },
  featDesc: { fontSize: 14, color: '#64748B', lineHeight: 1.6 },
  /* ── Pricing ── */
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' },
  priceCard: (hl) => ({
    background: '#FFFFFF', border: hl ? '2px solid #3A8BFD' : '1px solid #E2E8F0',
    borderRadius: 16, padding: 32, position: 'relative',
    boxShadow: hl ? '0 8px 30px rgba(58,139,253,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
    transform: hl ? 'scale(1.03)' : 'none'
  }),
  priceBadge: {
    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
    background: '#3A8BFD', color: '#fff', padding: '4px 16px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
  },
  priceName: { fontSize: 20, fontWeight: 600, marginBottom: 4, color: '#1E293B' },
  priceVal: { fontSize: 40, fontWeight: 700, color: '#1E293B' },
  pricePer: { fontSize: 16, fontWeight: 400, color: '#64748B' },
  priceDesc: { fontSize: 14, color: '#64748B', marginBottom: 24, marginTop: 8 },
  priceFeature: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1E293B', marginBottom: 12 },
  priceCTA: (hl) => ({
    display: 'block', textAlign: 'center', marginTop: 28, padding: '12px 0', borderRadius: 8,
    fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s',
    background: hl ? '#3A8BFD' : 'transparent',
    color: hl ? '#FFFFFF' : '#3A8BFD',
    border: hl ? 'none' : '1.5px solid #3A8BFD'
  }),
  /* ── Testimonials ── */
  testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 },
  testCard: {
    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  testStars: { display: 'flex', gap: 2, marginBottom: 14 },
  testText: { fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' },
  testAuthor: { display: 'flex', alignItems: 'center', gap: 12 },
  testAvatar: {
    width: 40, height: 40, borderRadius: '50%', background: '#3A8BFD', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14
  },
  testName: { fontSize: 14, fontWeight: 600, color: '#1E293B' },
  testRole: { fontSize: 12, color: '#64748B' },
  /* ── CTA banner ── */
  ctaBanner: {
    background: 'linear-gradient(135deg, #3A8BFD 0%, #1E3A5F 100%)',
    padding: '64px 32px', textAlign: 'center', borderRadius: 0
  },
  ctaTitle: { fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 },
  ctaSub: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' },
  ctaBtn: {
    background: '#FFFFFF', color: '#3A8BFD', padding: '14px 36px', borderRadius: 8,
    fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
  },
  /* ── Footer ── */
  footer: { background: '#0F172A', padding: '48px 32px 32px', color: '#94A3B8' },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 },
  footerCol: { minWidth: 140 },
  footerHeading: { color: '#FFFFFF', fontWeight: 600, fontSize: 14, marginBottom: 16 },
  footerLink: { display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: 13, marginBottom: 10, transition: 'color 0.15s' },
  footerCopy: { maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: 13, color: '#64748B' }
};

/* ─── Component ─── */
export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div style={styles.page}>
      {/* ── Navigation ── */}
      <nav style={styles.nav}>
        <a href="/" style={styles.navBrand}>
          <LinkIcon size={24} stroke="#3A8BFD" />
          Linkforge
        </a>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#pricing" style={styles.navLink}>Pricing</a>
          <a href="#testimonials" style={styles.navLink}>Testimonials</a>
          <Link to="/login" style={styles.navLink}>Log In</Link>
          <Link to="/dashboard" style={styles.navCTA}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Links engineered to <span style={styles.heroAccent}>convert</span>
        </h1>
        <p style={styles.heroSub}>
          Shorten, brand, track, and optimize every link. Linkforge gives your team
          the analytics and control to turn every click into a measurable outcome.
        </p>
        <div style={styles.heroCTAs}>
          <Link to="/dashboard" style={styles.heroPrimary}>
            Start for Free <ArrowRightIcon size={18} stroke="#fff" />
          </Link>
          <a href="#features" style={styles.heroSecondary}>See Features</a>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <div style={styles.heroStatVal}>12M+</div>
            <div style={styles.heroStatLabel}>Links created</div>
          </div>
          <div style={styles.heroStat}>
            <div style={styles.heroStatVal}>480M+</div>
            <div style={styles.heroStatLabel}>Clicks tracked</div>
          </div>
          <div style={styles.heroStat}>
            <div style={styles.heroStatVal}>8,200+</div>
            <div style={styles.heroStatLabel}>Teams worldwide</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={styles.section('#F8FAFC')}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Everything you need for link management</h2>
          <p style={styles.sectionSub}>
            From shortening to analytics, QR codes to team workspaces — Linkforge
            packs enterprise-grade link infrastructure into a delightfully simple tool.
          </p>
          <div style={styles.featGrid}>
            {features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div
                  key={i}
                  style={{
                    ...styles.featCard,
                    ...(hoveredFeature === i ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' } : {})
                  }}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div style={styles.featIconWrap}><FIcon size={22} /></div>
                  <div style={styles.featName}>{f.name}</div>
                  <div style={styles.featDesc}>{f.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={styles.section('#FFFFFF')}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p style={styles.sectionSub}>
            Start free and scale as you grow. No hidden fees, no credit card required.
          </p>
          <div style={styles.pricingGrid}>
            {pricingTiers.map((tier, i) => (
              <div key={i} style={styles.priceCard(tier.highlighted)}>
                {tier.highlighted && <div style={styles.priceBadge}>Most Popular</div>}
                <div style={styles.priceName}>{tier.name}</div>
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <span style={styles.priceVal}>{tier.price}</span>
                  <span style={styles.pricePer}>{tier.period}</span>
                </div>
                <div style={styles.priceDesc}>{tier.description}</div>
                <div>
                  {tier.features.map((feat, j) => (
                    <div key={j} style={styles.priceFeature}>
                      <CheckIcon size={16} stroke="#10B981" strokeWidth={2.5} />
                      {feat}
                    </div>
                  ))}
                </div>
                <a href="#" style={styles.priceCTA(tier.highlighted)}>{tier.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={styles.section('#F8FAFC')}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Loved by teams everywhere</h2>
          <p style={styles.sectionSub}>
            Thousands of marketing teams, developers, and creators trust Linkforge to power their links.
          </p>
          <div style={styles.testGrid}>
            {testimonials.map((t, i) => (
              <div key={i} style={styles.testCard}>
                <div style={styles.testStars}>
                  {Array.from({ length: t.rating }, (_, k) => <StarIcon key={k} size={16} />)}
                </div>
                <div style={styles.testText}>"{t.text}"</div>
                <div style={styles.testAuthor}>
                  <div style={styles.testAvatar}>{t.avatar}</div>
                  <div>
                    <div style={styles.testName}>{t.name}</div>
                    <div style={styles.testRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={styles.ctaBanner}>
        <h2 style={styles.ctaTitle}>Ready to forge better links?</h2>
        <p style={styles.ctaSub}>
          Join 8,200+ teams using Linkforge. Free to start, no credit card needed.
        </p>
        <Link to="/dashboard" style={styles.ctaBtn}>
          Get Started Free <ArrowRightIcon size={18} stroke="#3A8BFD" />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerCol}>
            <div style={styles.footerHeading}>Product</div>
            <a href="#features" style={styles.footerLink}>Features</a>
            <a href="#pricing" style={styles.footerLink}>Pricing</a>
            <a href="#" style={styles.footerLink}>Changelog</a>
            <a href="#" style={styles.footerLink}>Integrations</a>
          </div>
          <div style={styles.footerCol}>
            <div style={styles.footerHeading}>Resources</div>
            <a href="#" style={styles.footerLink}>Documentation</a>
            <a href="#" style={styles.footerLink}>API Reference</a>
            <a href="#" style={styles.footerLink}>Blog</a>
            <a href="#" style={styles.footerLink}>Guides</a>
          </div>
          <div style={styles.footerCol}>
            <div style={styles.footerHeading}>Company</div>
            <a href="#" style={styles.footerLink}>About</a>
            <a href="#" style={styles.footerLink}>Careers</a>
            <a href="#" style={styles.footerLink}>Contact</a>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
          </div>
          <div style={styles.footerCol}>
            <div style={styles.footerHeading}>Connect</div>
            <a href="#" style={styles.footerLink}>Twitter</a>
            <a href="#" style={styles.footerLink}>GitHub</a>
            <a href="#" style={styles.footerLink}>Discord</a>
            <a href="#" style={styles.footerLink}>LinkedIn</a>
          </div>
        </div>
        <div style={styles.footerCopy}>
          &copy; {new Date().getFullYear()} Linkforge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
