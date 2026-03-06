import SectionErrorBoundary from './SectionErrorBoundary'
import AsyncErrorBoundary from './AsyncErrorBoundary'
import PRODUCT_INFO from '../../../info.js'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Error Boundary */}
      <SectionErrorBoundary sectionName="Hero Section">
        <HeroSection />
      </SectionErrorBoundary>

      {/* Features Section with Error Boundary */}
      <SectionErrorBoundary sectionName="Features Section">
        <FeaturesSection />
      </SectionErrorBoundary>

      {/* Async Content Section (e.g., testimonials, stats) */}
      <AsyncErrorBoundary onRetry={() => console.log('Retrying async content...')}>
        <AsyncContentSection />
      </AsyncErrorBoundary>

      {/* CTA Section with Error Boundary */}
      <SectionErrorBoundary sectionName="CTA Section">
        <CTASection />
      </SectionErrorBoundary>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {PRODUCT_INFO.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {PRODUCT_INFO.tagline}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {PRODUCT_INFO.cta.buttonText}
            </a>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Powerful features to help you organize and share your content
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {PRODUCT_INFO.features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function AsyncContentSection() {
  // Simulated async content - in real app, this would fetch data
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by creators worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of users who organize their digital content with Shelf
          </p>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-indigo-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {PRODUCT_INFO.cta.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
            {PRODUCT_INFO.cta.description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {PRODUCT_INFO.cta.buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
