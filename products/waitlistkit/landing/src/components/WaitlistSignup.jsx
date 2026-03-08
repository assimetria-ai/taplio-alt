import { useState } from 'react'

export function WaitlistSignup({ embedded = false }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setResult(data)
      setEmail('')
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className={`rounded-lg p-8 ${embedded ? 'bg-card border border-border' : 'bg-muted/50 border-2 border-primary/20'} text-center space-y-4`}>
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold">You're on the list!</h3>
        <p className="text-muted-foreground">
          You're <span className="font-bold text-primary">#{result.position}</span> on the waitlist
        </p>
        <p className="text-sm text-muted-foreground">
          We'll send updates to <span className="font-medium">{result.email}</span>
        </p>
        <button
          onClick={() => setResult(null)}
          className="text-sm text-primary hover:underline"
        >
          Sign up another email
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-8 ${embedded ? 'bg-card border border-border' : 'bg-muted/50'}`}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <h3 className="text-2xl font-bold mb-2">Join the Waitlist</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to know when we launch. No spam, ever.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Join Waitlist'}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By signing up, you agree to receive updates from WaitlistKit
        </p>
      </form>
    </div>
  )
}
