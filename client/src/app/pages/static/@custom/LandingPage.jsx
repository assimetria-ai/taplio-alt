// @custom — Taplio Alt landing page with product-specific features, no fake social proof
import { Link } from 'react-router-dom'
import { ArrowRight, Check, PenLine, Calendar, BarChart3, Users, Clock, FileText, Lock } from 'lucide-react'
import { Button } from '../../../components/@system/ui/button'
import { Header } from '../../../components/@system/Header/Header'
import { Footer } from '../../../components/@system/Footer/Footer'
import { Card, CardContent } from '../../../components/@system/Card/Card'
import { FeaturesSection } from '../../../components/@system/FeaturesSection'
import { OgMeta } from '../../../components/@system/OgMeta/OgMeta'
import { info } from '@/config'

const TAPLIO_FEATURES = [
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Secure email/password signup with one-click LinkedIn OAuth. Connect your LinkedIn account in seconds to unlock scheduling, analytics, and lead tools. Includes forgot-password recovery and session management — so you\'re always in control.',
  },
  {
    icon: PenLine,
    title: 'AI Post Writer',
    description: 'Create scroll-stopping LinkedIn posts in seconds with AI. Choose your topic, tone (professional, casual, or bold), and format (text, listicle, or story) — get a publish-ready post with hashtag suggestions. Rewrite, remix, and generate variations until it\'s perfect.',
  },
  {
    icon: Clock,
    title: 'Post Scheduler',
    description: 'Schedule LinkedIn posts at the perfect time, every time. Pick a date and time or let smart suggestions find your audience\'s peak hours. Drag-and-drop queue management, timezone support, draft-to-scheduled workflow, and bulk scheduling for content batches.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'See your entire content strategy at a glance. Week and month calendar views show scheduled, published, and draft posts color-coded by status. Drag-and-drop to reschedule instantly. Gap detection flags empty days so you never miss a beat.',
  },
  {
    icon: FileText,
    title: 'Content Templates',
    description: 'Never start from a blank page again. Browse proven LinkedIn post templates — listicles, hot takes, storytelling, how-tos, carousel outlines, and engagement hooks. Each template comes with structure, examples, and fill-in prompts. Save your own winning formats.',
  },
  {
    icon: BarChart3,
    title: 'Engagement Analytics',
    description: 'Know exactly what\'s working. Track impressions, likes, comments, shares, and click-through rates for every post. Watch your follower growth over time. See your best-performing content ranked and discover your optimal posting times with data-backed analysis.',
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Turn engagement into pipeline. Automatically identify potential leads from everyone who likes, comments, and shares your posts. See enriched profiles with job title, company, and industry. Filter by engagement level, company size, or role to find ideal prospects.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: ['Up to 10 scheduled posts', 'Basic analytics', 'AI post suggestions', 'Community support'],
    cta: 'Get Started Free',
    ctaLink: '/auth?tab=register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['Unlimited scheduled posts', 'Advanced analytics', 'AI Post Writer', 'Lead generation', 'Content calendar', 'Priority support'],
    cta: 'Start Free Trial',
    ctaLink: '/auth?tab=register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'Team collaboration', 'SLA guarantee', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Sales',
    ctaLink: `mailto:${info.supportEmail}`,
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OgMeta
        title={info.name}
        description={info.tagline}
        url={info.url}
      />
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Schedule smarter,<br />
          <span className="text-primary">grow your audience</span>
        </h1>
        <p className="mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          LinkedIn content creation and scheduling tool. AI-powered post writer, scheduling, analytics, and lead generation — all in one place.
        </p>
        <div className="mt-6 sm:mt-7 md:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
          <Link to="/auth?tab=register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[180px]">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto sm:min-w-[180px]">
              View Pricing
            </Button>
          </a>
        </div>

        {/* Dashboard preview (replaces placeholder) */}
        <div className="mt-10 sm:mt-14 max-w-3xl mx-auto rounded-xl border bg-muted/30 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
            <div className="hidden sm:block border-r bg-muted/30 p-4 space-y-1 text-left">
              <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium">Dashboard</div>
              <div className="px-3 py-1.5 text-xs text-muted-foreground">Post Writer</div>
              <div className="px-3 py-1.5 text-xs text-muted-foreground">Calendar</div>
              <div className="px-3 py-1.5 text-xs text-muted-foreground">Analytics</div>
              <div className="px-3 py-1.5 text-xs text-muted-foreground">Leads</div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts this week</div>
                  <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>12</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Impressions</div>
                  <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>8.4K</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Engagement</div>
                  <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>4.2%</div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 flex items-end gap-1.5 h-28">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features (with product-specific features) */}
      <FeaturesSection
        features={TAPLIO_FEATURES}
        heading="Everything you need to grow on LinkedIn"
        subheading="Powerful features to create content, schedule posts, and generate leads"
      />

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? 'border-primary shadow-lg' : ''}
            >
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6 space-y-3 sm:space-y-4">
                {plan.highlighted && (
                  <span className="inline-block rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xs sm:text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.ctaLink} className="block">
                  <Button
                    className="w-full"
                    size="default"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Built for LinkedIn creators</h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Taplio Alt is a LinkedIn-first scheduling and content creation tool built for B2B sales professionals, founders, and consultants. We combine AI-powered writing with content intelligence so you know not just what was published, but what drove real pipeline.
          </p>
        </div>
      </section>

      {/* CTA (no fake social proof) */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-10 sm:py-14 md:py-16 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to grow your LinkedIn?</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Start creating better content and generating leads today.
          </p>
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center">
            <Link to="/auth?tab=register" className="w-full max-w-xs sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
                Start Your Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
