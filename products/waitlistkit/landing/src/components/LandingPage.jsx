export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">WaitlistKit</div>
          <nav className="flex gap-4">
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </a>
            <a
              href="/auth"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Beautiful Waitlist Management for Your Next Launch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Collect, manage, and engage with your early adopters. Built for makers who care about
            the launch experience.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <a
              href="/auth?tab=register"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="border border-border px-6 py-3 rounded-md font-medium hover:bg-secondary transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Everything you need to launch</h2>
            <p className="mt-3 text-muted-foreground">
              Simple, powerful tools to build excitement before launch
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <FeatureCard
              icon="📝"
              title="Easy Signup Forms"
              description="Embed beautiful waitlist forms anywhere. Fully customizable and mobile-ready."
            />
            <FeatureCard
              icon="📊"
              title="Analytics Dashboard"
              description="Track signups, conversion rates, and referral performance in real-time."
            />
            <FeatureCard
              icon="🎯"
              title="Referral System"
              description="Turn your waitlist into a growth engine with built-in referral tracking."
            />
            <FeatureCard
              icon="✉️"
              title="Email Campaigns"
              description="Send updates, launch announcements, and invites directly from the dashboard."
            />
            <FeatureCard
              icon="🔗"
              title="API Access"
              description="Full REST API to integrate with your existing tools and workflows."
            />
            <FeatureCard
              icon="🎨"
              title="Custom Branding"
              description="Match your brand with custom colors, logos, and domain names."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$0"
              period="forever"
              features={[
                'Up to 500 signups',
                'Basic analytics',
                'Email support',
                'Standard embed',
              ]}
              cta="Get Started Free"
              ctaLink="/auth?tab=register"
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="/month"
              features={[
                'Unlimited signups',
                'Advanced analytics',
                'Priority support',
                'Custom branding',
                'API access',
              ]}
              cta="Start Free Trial"
              ctaLink="/auth?tab=register"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                'Everything in Pro',
                'SLA guarantee',
                'Dedicated support',
                'Custom integrations',
                'White-label option',
              ]}
              cta="Contact Sales"
              ctaLink="mailto:hello@waitlistkit.com"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">Ready to launch?</h2>
          <p className="mt-3 text-muted-foreground">
            Join hundreds of makers already building hype with WaitlistKit.
          </p>
          <div className="mt-8">
            <a
              href="/auth?tab=register"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-md font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Create Free Account →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="font-bold mb-4">WaitlistKit</div>
              <p className="text-sm text-muted-foreground">
                Beautiful waitlist management for your next launch.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/docs" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WaitlistKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-3">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, period, features, cta, ctaLink, highlighted = false }) {
  return (
    <div
      className={`bg-card border rounded-lg p-6 space-y-6 ${
        highlighted ? 'border-primary shadow-lg' : 'border-border'
      }`}
    >
      {highlighted && (
        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most Popular
        </span>
      )}
      <div>
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-sm text-muted-foreground">{period}</span>}
        </div>
      </div>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <span className="text-primary">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={ctaLink}
        className={`block w-full text-center px-4 py-2 rounded-md font-medium transition-opacity ${
          highlighted
            ? 'bg-primary text-primary-foreground hover:opacity-90'
            : 'border border-border hover:bg-secondary'
        }`}
      >
        {cta}
      </a>
    </div>
  )
}
