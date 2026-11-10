// ─────────────────────────────────────────────────────────────
// Shared frame for Login and Register: the avatar on a warm
// backdrop on the left (Boutique/Oriel feel), the form on the
// right. On phones the visual panel shrinks to a short banner.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AvatarFigure from './AvatarFigure'
import GlassCard from './GlassCard'
import { ScoreRing } from './LookCard'
import { useProfile } from '../context/ProfileContext'
import { demoLooks } from '../lib/demoLooks'
import { rateLook } from '../lib/stylist'

interface AuthLayoutProps {
  eyebrow: string
  title: ReactNode
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  const { profile } = useProfile()
  const looks = demoLooks(profile.universe)
  const [i, setI] = useState(0)

  // slowly change the outfit on the avatar while the user types
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % looks.length), 3500)
    return () => clearInterval(t)
  }, [looks.length])

  const current = looks[i % looks.length]
  const verdict = rateLook(current.look)

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_1fr]">
      {/* ── visual panel ── */}
      <aside className="relative flex h-56 items-end justify-center overflow-hidden bg-gradient-to-b from-[#efe6d8] to-[#dccab0] lg:h-auto lg:items-center">
        <Link to="/" className="absolute left-6 top-5 z-10 font-serif text-2xl italic text-charcoal lg:left-10 lg:top-8">
          Myrror
        </Link>

        {/* soft floor + giant italic word behind the avatar */}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-[12%] select-none font-serif text-[22vw] italic leading-none text-white/35 lg:text-[11vw]">
          you
        </span>
        <div aria-hidden="true" className="absolute bottom-[9%] hidden h-16 w-72 rounded-[50%] bg-[#cdb89a]/60 blur-sm lg:block" />

        <div key={`${profile.universe}-${i}`} className="relative animate-[stepOut_800ms_cubic-bezier(.2,.8,.2,1)]">
          <AvatarFigure
            look={current.look}
            universe={profile.universe}
            skin={profile.skinTone}
            heightCm={profile.heightCm}
            weightKg={profile.weightKg}
            photo={profile.photo}
            pose="stride"
            walking
            className="h-52 w-20 lg:h-[520px] lg:w-[208px]"
          />
        </div>

        {/* floating cards (desktop only) */}
        <GlassCard label="Today's look" className="absolute right-[8%] top-[22%] hidden w-48 lg:block">
          <p className="font-serif text-xl italic leading-tight text-charcoal">{current.name}</p>
        </GlassCard>
        <GlassCard label="Outfit check" className="absolute bottom-[16%] left-[8%] hidden lg:block">
          <div className="flex items-center gap-3">
            <ScoreRing score={verdict.score} size={36} />
            <div>
              <p className="font-serif text-2xl leading-none text-charcoal">{verdict.score}</p>
              <p className="text-[11px] text-muted">{verdict.label}</p>
            </div>
          </div>
        </GlassCard>
      </aside>

      {/* ── form panel ── */}
      <main className="flex items-start justify-center px-6 py-10 lg:items-center lg:px-16 lg:py-12">
        <div className="w-full max-w-sm animate-[rise_500ms_ease]">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-charcoal">{title}</h1>
          <p className="mt-3 text-sm text-muted">{subtitle}</p>
          <div className="mt-9">{children}</div>
        </div>
      </main>
    </div>
  )
}

// ── form pieces shared by both pages ─────────────────────────

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}

export function AuthField({ id, label, type = 'text', value, onChange, placeholder, autoComplete }: FieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label htmlFor={id} className="text-[10px] tracking-[0.22em] uppercase text-muted">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-2xl border border-charcoal/15 bg-white/70 px-4 py-3 text-sm text-charcoal placeholder:text-muted/60 transition focus:border-terracotta focus:bg-white focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.15em] uppercase text-muted hover:text-charcoal"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  )
}

export function AuthSubmit({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-[11px] tracking-[0.2em] uppercase text-cream transition hover:bg-terracotta disabled:opacity-60"
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />}
      {children}
    </button>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return <p role="alert" className="rounded-2xl bg-terracotta/10 px-4 py-2.5 text-sm text-terracotta">{message}</p>
}
