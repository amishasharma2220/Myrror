import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthError, AuthField, AuthSubmit } from '../components/AuthLayout'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function Login() {
  const location = useLocation()
  // Register sends the new user's email here so they don't retype it
  const fromRegister = location.state as { email?: string } | null
  const [email, setEmail] = useState(fromRegister?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest(email, password)
      login(data.access_token)
      navigate('/wardrobe')
    } catch (err) {
      if (err instanceof Error) {
        // fetch throws a TypeError when the server can't be reached at all
        setError(err instanceof TypeError ? "Can't reach the server. Is FastAPI running on port 8001?" : err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title={<>Step back <em className="text-terracotta">in.</em></>}
      subtitle="Your avatar and wardrobe are waiting."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {fromRegister?.email && !error && (
          <p className="rounded-2xl bg-[#e9ece6] px-4 py-2.5 text-sm text-charcoal">Account created. Sign in to continue.</p>
        )}

        <AuthField id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <AuthField id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />

        <AuthError message={error} />

        <AuthSubmit loading={loading}>{loading ? 'Entering…' : 'Enter Myrror →'}</AuthSubmit>

        <p className="text-center text-sm text-muted">
          New to Myrror?{' '}
          <Link to="/register" className="text-charcoal underline underline-offset-4 hover:text-terracotta">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Login
