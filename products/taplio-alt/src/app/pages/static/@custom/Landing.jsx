import { Link } from 'react-router-dom'
import {
  PenLine, Calendar, BarChart3, Users, Zap, Clock,
  ArrowRight, Check, Sparkles, Send, Target, TrendingUp,
} from 'lucide-react'

const BRAND = '#0891B2'

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg text-gray-900"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND }}>
            <PenLine className="w-4 h-4 text-white" />
          </div>
          Taplio Alt
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link to="/register"
            className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{ background: BRAND }}>
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered LinkedIn growth
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Schedule smarter,<br />
          <span style={{ color: BRAND }}>grow your audience</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Write better LinkedIn posts with AI, schedule them at the perfect time,
          and track what works. All for a fraction of the cost.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register"
            className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-lg text-base transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: BRAND }}>
            Start writing for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-500">No credit card required</span>
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    icon: PenLine,
    title: 'AI Post Writer',
    desc: 'Generate high-quality LinkedIn posts in seconds. Choose your tone, format, and length. Get hashtag suggestions and variations.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    desc: 'Schedule posts at optimal times based on audience activity. Drag-and-drop queue management with timezone support.',
  },
  {
    icon: BarChart3,
    title: 'Engagement Analytics',
    desc: 'Track impressions, likes, comments, and shares. See your best-performing content and optimal posting times.',
  },
  {
    icon: Target,
    title: 'Lead Generation',
    desc: 'Identify potential leads from post engagement. Profile enrichment with job title, company, and industry data.',
  },
  {
    icon: Zap,
    title: 'Content Templates',
    desc: 'Library of proven LinkedIn post templates: listicles, stories, hot takes, how-tos. Save your own custom templates.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    desc: 'Follower growth charts, weekly performance summaries, and content gap detection to keep your calendar full.',
  },
]

function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything you need to grow on LinkedIn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From AI-powered writing to analytics and lead generation — one tool to rule your LinkedIn presence.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-cyan-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${BRAND}15` }}>
                <f.icon className="w-5 h-5" style={{ color: BRAND }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Premium LinkedIn growth tools at a price that makes sense.
        </p>
        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-gray-200 p-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-4">Get started, no commitment</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              $0<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['5 AI posts per month', 'Basic scheduling', 'Post performance stats'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register"
              className="block text-center text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Sign up free
            </Link>
          </div>
          {/* Pro */}
          <div className="rounded-xl border-2 p-8 text-left relative" style={{ borderColor: BRAND }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ background: BRAND }}>
              Most popular
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Pro</h3>
            <p className="text-sm text-gray-500 mb-4">For serious LinkedIn creators</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              $29<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited AI posts',
                'Smart scheduling + queue',
                'Full analytics dashboard',
                'Lead generation',
                'Content templates',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BRAND }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register"
              className="block text-center text-sm font-medium text-white px-4 py-2.5 rounded-lg transition-colors hover:opacity-90"
              style={{ background: BRAND }}>
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: BRAND }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Ready to grow your LinkedIn presence?
        </h2>
        <p className="text-lg text-cyan-100 mb-8">
          Join creators who write better, post smarter, and grow faster.
        </p>
        <Link to="/register"
          className="inline-flex items-center gap-2 bg-white font-medium px-6 py-3 rounded-lg text-base transition-all hover:shadow-lg"
          style={{ color: BRAND }}>
          Get started for free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: BRAND }}>
            <PenLine className="w-3 h-3 text-white" />
          </div>
          Taplio Alt
        </div>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Taplio Alt. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
