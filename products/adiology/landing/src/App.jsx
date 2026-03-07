import { useState } from 'react'
import PRODUCT_INFO from '../../info.js'

function App() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle email signup
    console.log('Email submitted:', email)
    alert(`Thanks for your interest! We'll reach out to ${email} soon.`)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Name */}
          <h1 className="text-6xl font-bold text-purple-900 mb-4">
            {PRODUCT_INFO.name}
          </h1>
          
          {/* Tagline */}
          <p className="text-2xl text-purple-700 mb-8">
            {PRODUCT_INFO.tagline}
          </p>
          
          {/* Description */}
          <p className="text-xl text-gray-700 mb-12">
            {PRODUCT_INFO.description}
          </p>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {PRODUCT_INFO.cta.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {PRODUCT_INFO.cta.description}
            </p>
            
            {/* Email Signup */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                {PRODUCT_INFO.cta.buttonText}
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {PRODUCT_INFO.features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-4">
                  {feature.icon === 'radio' && '📻'}
                  {feature.icon === 'mic' && '🎙️'}
                  {feature.icon === 'chart' && '📊'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {PRODUCT_INFO.plans[0].name} Plan
            </h2>
            <p className="text-gray-600 mb-6">
              {PRODUCT_INFO.plans[0].description}
            </p>
            
            <div className="mb-6">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                ${PRODUCT_INFO.pricing.monthly.price}
                <span className="text-2xl text-gray-600">/month</span>
              </div>
              <div className="text-gray-600">
                or ${PRODUCT_INFO.pricing.yearly.price}/year (save 2 months)
              </div>
            </div>

            <ul className="text-left mb-8 space-y-3">
              {PRODUCT_INFO.plans[0].features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 transition-colors">
              Start Free Trial
            </button>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-purple-200">
            <div className="flex justify-center gap-6 mb-4">
              <a href={PRODUCT_INFO.links.docs} className="text-purple-600 hover:text-purple-700">
                Documentation
              </a>
              <a href={PRODUCT_INFO.links.faq} className="text-purple-600 hover:text-purple-700">
                FAQ
              </a>
              <a href={`mailto:${PRODUCT_INFO.supportEmail}`} className="text-purple-600 hover:text-purple-700">
                Support
              </a>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 {PRODUCT_INFO.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
