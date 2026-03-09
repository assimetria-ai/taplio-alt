// products/planora/@custom/landing/LandingPage.jsx
// Pixel-for-pixel replication of Marta's landing page HTML
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-white">
                Planora
              </Link>
              <div className="hidden md:flex space-x-6">
                <a href="#features" className="text-slate-300 hover:text-white transition">
                  Features
                </a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition">
                  Pricing
                </a>
                <Link to="/docs" className="text-slate-300 hover:text-white transition">
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Project Management
            <br />
            <span className="text-indigo-500">That Adapts to Your Team</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Beautiful, intuitive project management built for modern teams. Plan, track, and
            collaborate without the complexity.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-lg text-lg font-medium transition"
            >
              Start Free Trial
            </Link>
            <a
              href="#demo"
              className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-lg text-lg font-medium transition"
            >
              Watch Demo
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required • Free forever for up to 5 team members
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Everything you need to manage projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold mb-3">Multiple Views</h3>
              <p className="text-slate-400">
                Visualize your work your way: List, Board, Timeline, Calendar, and Gantt chart
                views
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
              <p className="text-slate-400">
                Work together seamlessly with live updates, comments, and @mentions
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Smart Automations</h3>
              <p className="text-slate-400">
                Automate repetitive tasks and workflows to focus on what matters
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Custom Fields</h3>
              <p className="text-slate-400">
                Tailor your workspace with custom statuses, tags, dates, and more
              </p>
            </div>
            {/* Feature 5 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-3">Time Tracking</h3>
              <p className="text-slate-400">
                Track time spent on tasks and generate detailed reports for clients
              </p>
            </div>
            {/* Feature 6 */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-3">Powerful Integrations</h3>
              <p className="text-slate-400">
                Connect with Slack, GitHub, Google Drive, and 100+ other tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, transparent pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-400 mb-6">Perfect for small teams</p>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-slate-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">Up to 5 team members</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">Unlimited projects</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">Basic views</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-indigo-600 p-8 rounded-lg transform scale-105 shadow-xl">
              <div className="bg-indigo-500 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-indigo-100 mb-6">For growing teams</p>
              <div className="text-4xl font-bold mb-6">
                $12<span className="text-lg text-indigo-200">/user/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-white mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-white mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white">Unlimited team members</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-white mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white">All views & automations</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-white mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white">Priority support</span>
                </li>
              </ul>
              <Link
                to="/signup?plan=pro"
                className="block w-full text-center bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-6">For large organizations</p>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">SSO & SAML</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-300">Dedicated support</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Start Planning Smarter</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of teams using Planora to manage projects with clarity and confidence
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg text-lg font-medium transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/changelog" className="hover:text-white">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/api" className="hover:text-white">
                    API
                  </Link>
                </li>
                <li>
                  <Link to="/templates" className="hover:text-white">
                    Templates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 Planora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
