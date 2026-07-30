import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Logging in with:', email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center mb-2">
          <p className="text-xs tracking-widest uppercase text-muted mb-2">MYRROR</p>
          <h1 className="font-serif text-3xl text-charcoal">
            Your personal fashion
            <br />
            shopping companion.
          </h1>
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} />
        <Button type="submit">Enter Myrror</Button>
        <p className="text-center text-sm text-muted">
          New to Myrror? <a href="#" className="text-charcoal underline">Create an account</a>
        </p>
      </form>
    </div>
  )
}

export default Login
