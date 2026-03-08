import { WaitlistSignup } from './WaitlistSignup'

export function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            WaitlistKit
          </a>
          <nav className="flex gap-4">
            <a href="/#features" className="text-sm hover:text-primary transition-colors">
              Features
            </a>
            <a href="/#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section with Signup */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get Early Access to WaitlistKit
            </h1>
            <p className="text-lg text-muted-foreground">
              Join the waitlist and be among the first to experience beautiful waitlist management
              for your next launch.
            </p>
          </div>

          <WaitlistSignup />

          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Trusted by makers worldwide</p>
            <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span>Fast Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💯</span>
                <span>No Spam</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">What you'll get with early access</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <BenefitCard
                icon="⚡"
                title="Priority Access"
                description="Skip the line and get immediate access when we launch."
              />
              <BenefitCard
                icon="💰"
                title="Special Pricing"
                description="Exclusive discounts and lifetime deals for early supporters."
              />
              <BenefitCard
                icon="🎯"
                title="Shape the Product"
                description="Your feedback will directly influence our roadmap."
              />
              <BenefitCard
                icon="🎁"
                title="Launch Bonuses"
                description="Get free credits and extended trial when we go live."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WaitlistKit. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-2">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
