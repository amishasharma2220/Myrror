// ─────────────────────────────────────────────────────────────
// Landing page, modelled on Modulify's "Boutique" template:
// a crowd of faded figures, one avatar stepping out of it, and a
// floating "complete look" card beside it.
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import AvatarFigure from '../components/AvatarFigure'
import LookCard from '../components/LookCard'
import GlassCard, { StatRow } from '../components/GlassCard'
import Rack from '../components/Rack'
import { useProfile } from '../context/ProfileContext'
import { crowd, demoLooks } from '../lib/demoLooks'
import { DEMO_RACK, wear } from '../lib/garments'
import type { Garment, Look } from '../lib/garments'

export default function Landing() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const looks = demoLooks(profile.universe)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const people = useMemo(() => crowd(21), [])

  // Cycle the hero look every 4s (pauses while you hover the card)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % looks.length), 4000)
    return () => clearInterval(t)
  }, [paused, looks.length])

  const current = looks[index % looks.length]

  // A tiny interactive demo for the "rack" section
  // (stored with its universe, so switching Women/Men resets it without an effect)
  const [demo, setDemo] = useState<{ universe: string; look: Look } | null>(null)
  const demoLook = demo && demo.universe === profile.universe ? demo.look : looks[0].look
  const tryOnDemo = (g: Garment) => setDemo({ universe: profile.universe, look: wear(demoLook, g) })

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[100svh]">
        {/* faded crowd */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-5 gap-x-2 gap-y-6 px-4 pt-24 opacity-[0.22] grayscale-[35%] md:grid-cols-7 md:px-10">
          {people.map((p, i) => (
            <AvatarFigure
              key={i}
              look={p.look}
              universe={p.universe}
              skin={p.skin}
              pose={p.pose}
              className={`h-[150px] w-full md:h-[200px] ${i % 7 === 3 ? 'invisible' : ''}`}
            />
          ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(249,246,241,0.95)_0%,rgba(249,246,241,0.7)_35%,rgba(249,246,241,0)_75%)]" />

        <Nav />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-6 px-5 pb-20 pt-4 md:grid-cols-[1fr_auto_1fr] md:px-10 md:pt-6">
          {/* headline */}
          <div className="order-1 text-center md:text-left">
            <p className="mb-4 text-[10px] tracking-[0.3em] uppercase text-muted">
              Style Universe · {profile.universe === 'women' ? "Women's" : "Men's"} edit
            </p>
            <h1 className="font-serif text-5xl leading-[0.95] text-charcoal md:text-[60px] lg:text-7xl">
              See it on <em className="text-terracotta">you</em>
              <br />
              before you buy.
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted md:mx-0">
              Build an avatar with your height, build and skin tone. Try on pieces from your wardrobe, then ask Myrror if it works.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link to="/avatar" className="rounded-full bg-terracotta px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-cream transition hover:bg-charcoal">
                {profile.created ? 'Edit my avatar' : 'Create my avatar'}
              </Link>
              <Link to="/studio" className="rounded-full border border-charcoal/20 bg-white/50 px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-charcoal backdrop-blur transition hover:bg-white">
                Open the studio
              </Link>
            </div>
          </div>

          {/* avatar stepping out */}
          <div className="relative order-2 flex justify-center">
            <div key={`${profile.universe}-${index}`} className="animate-[stepOut_900ms_cubic-bezier(.2,.8,.2,1)]">
              <AvatarFigure
                look={current.look}
                universe={profile.universe}
                skin={profile.skinTone}
                heightCm={profile.heightCm}
                weightKg={profile.weightKg}
                photo={profile.photo}
                pose="stride"
                walking
                className="h-[440px] w-[176px] md:h-[560px] md:w-[224px]"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-lg italic text-muted">
              “{current.name}”
            </span>
          </div>

          {/* look card */}
          <div
            className="order-3 flex justify-center md:justify-end"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <LookCard
              key={`${profile.universe}-${index}`}
              look={current.look}
              title={current.name}
              ctaLabel="Try this look on me"
              onCta={() => navigate('/studio', { state: { look: current.look } })}
            />
          </div>
        </div>

        {/* look dots */}
        <div className="relative z-10 flex justify-center gap-2 pb-6">
          {looks.map((l, i) => (
            <button
              key={l.name}
              onClick={() => setIndex(i)}
              aria-label={`Show ${l.name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index % looks.length ? 'w-8 bg-charcoal' : 'w-1.5 bg-charcoal/25'}`}
            />
          ))}
        </div>

        {/* marquee */}
        <div className="relative z-10 overflow-hidden border-y border-charcoal/10 bg-charcoal py-2.5 text-cream">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap text-[10px] tracking-[0.3em] uppercase">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              ['Your avatar, your size', 'Try before you buy', 'Ask Myrror anything', 'New looks daily', 'Style Universe'].map((t) => (
                <span key={`${k}-${t}`} className="flex items-center gap-10">
                  {t} <span className="text-terracotta">✦</span>
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24 md:px-10">
        <p className="mb-3 text-center text-[10px] tracking-[0.3em] uppercase text-muted">How Myrror works</p>
        <h2 className="mx-auto max-w-2xl text-center font-serif text-4xl leading-tight text-charcoal md:text-5xl">
          A mirror that knows your <em>wardrobe</em>, your <em>body</em> and your <em>plans</em>.
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* 1. avatar */}
          <article className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#efe6d8] to-[#e3d6c3] p-6">
            <span className="font-serif text-5xl italic text-terracotta/70">01</span>
            <h3 className="mt-2 font-serif text-2xl text-charcoal">Your avatar</h3>
            <p className="mt-1 text-sm text-muted">Height, build and skin tone, so clothes sit like they would on you.</p>
            <div className="relative mt-4 flex h-64 justify-center">
              <AvatarFigure look={current.look} universe={profile.universe} skin={profile.skinTone} heightCm={profile.heightCm} weightKg={profile.weightKg} photo={profile.photo} className="h-64 w-28" />
              <GlassCard label="Body" className="absolute right-0 top-4 w-36">
                <StatRow name="Height" value={profile.heightCm} unit="cm" />
                <StatRow name="Weight" value={profile.weightKg} unit="kg" />
              </GlassCard>
              <GlassCard label="Skin tone" className="absolute bottom-6 left-0">
                <span className="block h-6 w-14 rounded-full border border-white" style={{ background: profile.skinTone }} />
              </GlassCard>
            </div>
          </article>

          {/* 2. rack */}
          <article className="overflow-hidden rounded-[28px] bg-[#e9ece6] p-6">
            <span className="font-serif text-5xl italic text-terracotta/70">02</span>
            <h3 className="mt-2 font-serif text-2xl text-charcoal">Your rack</h3>
            <p className="mt-1 text-sm text-muted">Everything you own, hanging in one place. Tap a piece to try it on.</p>
            <div className="mt-4 flex h-64 items-end gap-2">
              <AvatarFigure look={demoLook} universe={profile.universe} skin={profile.skinTone} className="h-60 w-24 shrink-0" />
              <div className="min-w-0 flex-1 self-start pt-6">
                <Rack items={DEMO_RACK[profile.universe].slice(0, 6)} look={demoLook} onPick={tryOnDemo} />
              </div>
            </div>
          </article>

          {/* 3. chat */}
          <article className="rounded-[28px] bg-charcoal p-6 text-cream">
            <span className="font-serif text-5xl italic text-terracotta">03</span>
            <h3 className="mt-2 font-serif text-2xl">Ask Myrror</h3>
            <p className="mt-1 text-sm text-cream/60">"I'm wearing this, is it fine?" Get an honest answer, and what to change.</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-cream px-4 py-2.5 text-charcoal">Is this okay for my college fest?</div>
              <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md border border-cream/15 px-4 py-2.5 text-cream/90">
                <strong className="font-medium">Works well (78/100).</strong> One accent colour against neutrals is the safest way to wear colour. Swap the loafers for sneakers to keep it relaxed.
              </div>
              <Link to="/studio" className="inline-block pt-2 text-[11px] tracking-[0.2em] uppercase text-terracotta hover:underline">
                Try it in the studio →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <footer className="border-t border-charcoal/10 px-5 py-8 text-center text-[10px] tracking-[0.25em] uppercase text-muted">
        Myrror · your personal fashion companion
      </footer>
    </div>
  )
}
