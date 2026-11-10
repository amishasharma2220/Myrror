import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthError, AuthField, AuthSubmit } from '../components/AuthLayout'
import { signup } from '../api/auth'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup(username, email, password)
      // hand the email to the login page so it's pre-filled
      navigate('/login', { state: { email } })
    } catch (err) {
      if (err instanceof Error) {
        setError(err instanceof TypeError ? "Can't reach the server. Is FastAPI running on port 8001?" : err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Join Myrror"
      title={<>Meet your <em className="text-terracotta">mirror.</em></>}
      subtitle="Create an account to save your wardrobe and try it on."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthField id="username" label="Username" value={username} onChange={setUsername} placeholder="yourname" autoComplete="username" />
        <AuthField id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <AuthField id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />

        <AuthError message={error} />

        <AuthSubmit loading={loading}>{loading ? 'Creating account…' : 'Create account →'}</AuthSubmit>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-charcoal underline underline-offset-4 hover:text-terracotta">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register
