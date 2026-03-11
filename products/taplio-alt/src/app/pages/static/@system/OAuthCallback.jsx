import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/store/@system/auth'

/** Handles OAuth redirect: /auth/oauth/callback?token=<session_token> */
export default function OAuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')
    if (token) {
      login(token).then(() => navigate('/', { replace: true }))
    } else if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
