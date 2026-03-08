import { useState, useEffect } from 'react'

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [statsRes, entriesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/waitlist'),
      ])

      if (!statsRes.ok || !entriesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const statsData = await statsRes.json()
      const entriesData = await entriesRes.json()

      setStats(statsData)
      setEntries(entriesData.entries || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            WaitlistKit Admin
          </a>
          <nav className="flex gap-4">
            <a href="/" className="text-sm hover:text-primary transition-colors">
              Home
            </a>
            <a href="/waitlist" className="text-sm hover:text-primary transition-colors">
              Join Waitlist
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Waitlist Dashboard</h1>

          {loading && (
            <div className="text-muted-foreground">Loading...</div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 text-destructive">
              Error: {error}
            </div>
          )}

          {stats && (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <StatCard
                title="Total Signups"
                value={stats.total}
                icon="👥"
              />
              <StatCard
                title="This Week"
                value={stats.thisWeek}
                icon="📅"
              />
              <StatCard
                title="Today"
                value={stats.today}
                icon="⚡"
              />
            </div>
          )}
        </div>

        {/* Entries Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Entries</h2>
            <button
              onClick={fetchData}
              className="text-sm text-primary hover:underline"
            >
              Refresh
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No entries yet. Share your waitlist page to start collecting signups!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">#</th>
                    <th className="text-left p-4 font-medium text-sm">Name</th>
                    <th className="text-left p-4 font-medium text-sm">Email</th>
                    <th className="text-left p-4 font-medium text-sm">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.position} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4 text-sm font-medium">{entry.position}</td>
                      <td className="p-4 text-sm">{entry.name || '-'}</td>
                      <td className="p-4 text-sm font-mono">{entry.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export/Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              const csv = [
                'Position,Name,Email,Joined',
                ...entries.map(e => 
                  `${e.position},"${e.name}","${e.email}","${e.createdAt}"`
                )
              ].join('\n')
              
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-sm text-primary hover:underline"
          >
            Export as CSV
          </button>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
