import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
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
      navigate('/login')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div className="text-center mb-2">
          <p className="text-xs tracking-widest uppercase text-muted mb-2">
            MYRROR
          </p>
          <h1 className="font-serif text-3xl text-charcoal">
            Create your account
          </h1>
        </div>

        <Input
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="yourname"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />

        {error && (
          <p className="text-sm text-terracotta text-center">{error}</p>
        )}

        <Button type="submit">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <a href="/login" className="text-charcoal underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  )
}

export default Register