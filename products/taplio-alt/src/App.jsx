import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/app/store/@system/auth'
import ProtectedRoute from '@/app/components/@system/ProtectedRoute'
import Login from '@/app/pages/static/@system/Login'
import Register from '@/app/pages/static/@system/Register'
import ForgotPassword from '@/app/pages/static/@system/ForgotPassword'
import ResetPassword from '@/app/pages/static/@system/ResetPassword'
import OAuthCallback from '@/app/pages/static/@system/OAuthCallback'
import EmailVerify from '@/app/pages/static/@system/EmailVerify'
import Dashboard from '@/app/pages/app/@system/Dashboard'
import Settings from '@/app/pages/app/@system/Settings'
import Teams from '@/app/pages/app/@system/Teams'
import AcceptInvite from '@/app/pages/app/@system/AcceptInvite'
import Files from '@/app/pages/app/@system/Files'
import Logs from '@/app/pages/app/@system/Logs'
import Email from '@/app/pages/app/@system/Email'
import AuditLog from '@/app/pages/app/@custom/AuditLog'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Email verification — link in verification email lands here */}
          <Route path="/email/verify" element={<EmailVerify />} />

          {/* OAuth callback — backend redirects to /auth/oauth/callback?token=... */}
          <Route path="/auth/oauth/callback" element={<OAuthCallback />} />

          {/* Protected — wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/invites/:token/accept" element={<AcceptInvite />} />
            <Route path="/files" element={<Files />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/email" element={<Email />} />
            <Route path="/activity" element={<AuditLog />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
