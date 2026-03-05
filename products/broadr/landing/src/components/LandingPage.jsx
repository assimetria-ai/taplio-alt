export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Broadr
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Broadcast your message across multiple channels
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Multi-Channel Broadcasting
            </h2>
            <p className="text-gray-300 mb-6">
              Reach your audience wherever they are. Broadr makes it easy to send messages
              across SMS, email, push notifications, and social media—all from one platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">📱 SMS</h3>
                <p className="text-gray-400 text-sm">Direct text messaging to your users</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">✉️ Email</h3>
                <p className="text-gray-400 text-sm">Beautiful email campaigns</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">🔔 Push</h3>
                <p className="text-gray-400 text-sm">Native push notifications</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">🐦 Social</h3>
                <p className="text-gray-400 text-sm">Cross-post to social platforms</p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Get Started
            </button>
          </section>
        </main>

        <footer className="text-center mt-16 text-gray-400 text-sm">
          <p>&copy; 2024 Broadr. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
