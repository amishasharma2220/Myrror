// ─────────────────────────────────────────────────────────────
// The Studio: rack on top (Hangline), avatar in the middle with
// floating stat cards (Oriel), complete-look card on the right
// (Boutique), and the "Ask Myrror" chat drawer.
//
// Data flow, in one line:
//   wardrobe API → Garment[] → rack → wear() → look → avatar/card/chat
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Nav from '../components/Nav'
import AvatarFigure from '../components/AvatarFigure'
import LookCard, { ScoreRing } from '../components/LookCard'
import GlassCard, { StatRow } from '../components/GlassCard'
import Rack from '../components/Rack'
import StylistChat from '../components/StylistChat'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { getWardrobeItems } from '../api/wardrobe'
import { DEMO_RACK, fromApi, wear } from '../lib/garments'
import type { Garment, Look, Slot } from '../lib/garments'
import { rateLook } from '../lib/stylist'

const FILTERS: { value: Slot | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'outer', label: 'Layers' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'dress', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
]

type Source = 'loading' | 'mine' | 'demo-signed-out' | 'demo-empty' | 'demo-error'

export default function Studio() {
  const { token } = useAuth()
  const { profile } = useProfile()
  const location = useLocation()

  // A look can be handed over from the landing page via router state
  const incoming = (location.state as { look?: Look } | null)?.look
  const [look, setLook] = useState<Look>(incoming ?? {})
  const [mine, setMine] = useState<Garment[]>([])
  const [source, setSource] = useState<Source>(token ? 'loading' : 'demo-signed-out')
  const [filter, setFilter] = useState<Slot | 'all'>('all')
  const [chatOpen, setChatOpen] = useState(false)

  // Load the user's real wardrobe from FastAPI when signed in
  useEffect(() => {
    if (!token) return
    let cancelled = false // ignore the answer if the page unmounts first
    getWardrobeItems(token)
      .then((items) => {
        if (cancelled) return
        setMine(items.map(fromApi))
        setSource(items.length ? 'mine' : 'demo-empty')
      })
      .catch(() => !cancelled && setSource('demo-error'))
    return () => {
      cancelled = true
    }
  }, [token])

  const effectiveSource: Source = token ? source : 'demo-signed-out'
  const rackItems = effectiveSource === 'mine' ? mine : DEMO_RACK[profile.universe]
  const visible = filter === 'all' ? rackItems : rackItems.filter((g) => g.slot === filter)
  const verdict = rateLook(look)

  function surprise() {
    // pick one random piece per slot (dress OR top+bottom)
    const pick = (slot: Slot) => {
      const opts = rackItems.filter((g) => g.slot === slot)
      return opts.length ? opts[Math.floor(Math.random() * opts.length)] : undefined
    }
    const useDress = Math.random() < 0.3 && pick('dress')
    const next: Look = useDress
      ? { dress: pick('dress'), shoes: pick('shoes') }
      : { top: pick('top'), bottom: pick('bottom'), shoes: pick('shoes'), outer: Math.random() < 0.4 ? pick('outer') : undefined }
    // drop empty slots
    setLook(Object.fromEntries(Object.entries(next).filter(([, v]) => v)) as Look)
  }

  const banner: Record<Exclude<Source, 'mine'>, React.ReactNode> = {
    loading: 'Loading your wardrobe…',
    'demo-signed-out': (
      <>Showing sample pieces. <Link to="/login" className="text-charcoal underline">Sign in</Link> to try on your own wardrobe.</>
    ),
    'demo-empty': (
      <>Your wardrobe is empty, so here are sample pieces. <Link to="/wardrobe" className="text-charcoal underline">Add your clothes</Link>.</>
    ),
    'demo-error': "Couldn't reach the server (is FastAPI running on :8001?). Showing sample pieces.",
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav />

      <main className="mx-auto max-w-6xl px-5 pb-28 md:px-10">
        {/* heading + filters */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted">The studio</p>
            <h1 className="font-serif text-4xl leading-none text-charcoal md:text-5xl">
              {profile.name ? <>Dressing <em>{profile.name}</em></> : <>Dress your <em>avatar</em></>}
            </h1>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase transition ${
                  filter === f.value ? 'bg-charcoal text-cream' : 'border border-charcoal/15 text-muted hover:text-charcoal'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {effectiveSource !== 'mine' && (
          <p className="mt-4 rounded-full bg-white/70 px-4 py-2 text-xs text-muted w-fit">{banner[effectiveSource]}</p>
        )}

        {/* rack */}
        <div className="mt-6">
          {visible.length ? (
            <Rack items={visible} look={look} onPick={(g) => setLook((l) => wear(l, g))} />
          ) : (
            <p className="py-10 text-center font-serif text-xl italic text-muted">Nothing in this section yet.</p>
          )}
        </div>

        {/* stage */}
        <div className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          {/* left: stats */}
          <div className="order-2 flex flex-row flex-wrap justify-center gap-3 md:order-1 md:flex-col md:items-end">
            <GlassCard label="Body profile" className="w-44">
              <StatRow name="Height" value={profile.heightCm} unit="cm" />
              <StatRow name="Weight" value={profile.weightKg} unit="kg" />
            </GlassCard>
            <GlassCard label="Outfit score" className="w-44">
              <div className="flex items-center gap-3">
                <ScoreRing score={verdict.score} size={40} />
                <div>
                  <p className="font-serif text-2xl leading-none text-charcoal">{verdict.score}</p>
                  <p className="text-[11px] text-muted">{verdict.label}</p>
                </div>
              </div>
            </GlassCard>
            {!profile.created && (
              <Link to="/avatar" className="w-44 rounded-2xl border border-dashed border-terracotta/50 px-4 py-3 text-xs text-terracotta hover:bg-terracotta/5">
                Set your height, build and skin tone →
              </Link>
            )}
          </div>

          {/* centre: avatar on a plinth */}
          <div className="relative order-1 flex justify-center md:order-2">
            <div className="absolute bottom-10 h-16 w-56 rounded-[50%] bg-gradient-to-b from-[#e7dccb] to-[#d8c7ae] blur-[1px]" />
            <AvatarFigure
              look={look}
              universe={profile.universe}
              skin={profile.skinTone}
              heightCm={profile.heightCm}
              weightKg={profile.weightKg}
              photo={profile.photo}
              walking
              className="relative h-[480px] w-[192px] md:h-[540px] md:w-[216px]"
            />
            <div className="absolute -bottom-4 flex gap-2">
              <button onClick={surprise} className="whitespace-nowrap rounded-full border border-charcoal/15 bg-white/80 px-4 py-2 text-[10px] tracking-[0.18em] uppercase text-charcoal backdrop-blur hover:bg-white">
                ✦ Surprise me
              </button>
              <button onClick={() => setLook({})} className="rounded-full border border-charcoal/15 bg-white/80 px-4 py-2 text-[10px] tracking-[0.18em] uppercase text-muted backdrop-blur hover:text-charcoal">
                Clear
              </button>
            </div>
          </div>

          {/* right: look card */}
          <div className="order-3 flex justify-center md:justify-start">
            <LookCard
              look={look}
              ctaLabel="Is this fine? Ask Myrror"
              onCta={() => setChatOpen(true)}
              onRemove={(g) => setLook((l) => wear(l, g))}
            />
          </div>
        </div>
      </main>

      {/* floating chat button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-terracotta py-3 pl-4 pr-5 text-[11px] tracking-[0.18em] uppercase text-cream shadow-[0_15px_40px_-10px_rgba(184,103,74,0.7)] transition hover:-translate-y-0.5"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-cream/20">✦</span>
        Ask Myrror
      </button>

      <StylistChat open={chatOpen} onClose={() => setChatOpen(false)} look={look} />
    </div>
  )
}
