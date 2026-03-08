import { LandingPage } from './components/LandingPage'
import { WaitlistPage } from './components/WaitlistPage'
import { AdminDashboard } from './components/AdminDashboard'

export default function App() {
  // Simple client-side routing
  const path = window.location.pathname

  if (path === '/admin' || path === '/dashboard') {
    return <AdminDashboard />
  }

  if (path === '/waitlist' || path === '/join') {
    return <WaitlistPage />
  }

  return <LandingPage />
}
