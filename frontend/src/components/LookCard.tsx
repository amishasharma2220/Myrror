// The floating "complete look" card from the Boutique template:
// big view of one piece, thumbnails of the rest, and a score.
import { useState } from 'react'
import type { Garment, Look, Slot } from '../lib/garments'
import { rateLook } from '../lib/stylist'
import GarmentIcon from './GarmentIcon'

const ORDER: Slot[] = ['outer', 'top', 'dress', 'bottom', 'shoes']
const SLOT_LABEL: Record<Slot, string> = { top: 'Top', outer: 'Layer', bottom: 'Bottom', dress: 'Dress', shoes: 'Shoes' }

interface LookCardProps {
  look: Look
  title?: string
  ctaLabel: string
  onCta: () => void
  onRemove?: (g: Garment) => void
  className?: string
}

export default function LookCard({ look, title = 'Your look', ctaLabel, onCta, onRemove, className = '' }: LookCardProps) {
  const pieces = ORDER.map((s) => look[s]).filter(Boolean) as Garment[]
  const [active, setActive] = useState(0)
  const current = pieces[Math.min(active, pieces.length - 1)]
  const verdict = rateLook(look)

  const step = (d: number) => setActive((i) => (pieces.length ? (i + d + pieces.length) % pieces.length : 0))

  return (
    <div className={`w-full max-w-[320px] rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_30px_80px_-30px_rgba(43,38,34,0.45)] backdrop-blur-md ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-charcoal/[0.06] px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-muted">
          {title}
        </span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted">{pieces.length} pcs</span>
      </div>

      {/* Main piece */}
      <div className="relative flex aspect-[4/3.4] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#f4efe7] to-[#e9e2d6]">
        {current ? (
          <GarmentIcon key={current.id} garment={current} className="h-[78%] w-[78%] animate-[pop_420ms_ease]" />
        ) : (
          <p className="px-6 text-center font-serif text-lg italic text-muted">Pick pieces from the rack</p>
        )}
        {pieces.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous piece" className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-charcoal shadow-sm hover:bg-white">‹</button>
            <button onClick={() => step(1)} aria-label="Next piece" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-charcoal shadow-sm hover:bg-white">›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {pieces.length > 0 && (
        <div className="mt-3 flex justify-center gap-2">
          {pieces.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              aria-label={p.name}
              className={`h-11 w-11 rounded-xl border bg-[#f4efe7] p-1 transition ${p === current ? 'border-charcoal' : 'border-transparent hover:border-charcoal/30'}`}
            >
              <GarmentIcon garment={p} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <div>
            <p className="font-serif text-xl italic leading-tight text-charcoal">{current.name}</p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-muted">{SLOT_LABEL[current.slot]}
              {current.category.toLowerCase() !== SLOT_LABEL[current.slot].toLowerCase() && ` · ${current.category}`}</p>
          </div>
          {onRemove && (
            <button onClick={() => onRemove(current)} className="text-[10px] tracking-[0.18em] uppercase text-muted underline-offset-4 hover:text-terracotta hover:underline">
              Take off
            </button>
          )}
        </div>
      )}

      {/* Complete look score */}
      <div className="mt-4 flex items-center justify-between border-t border-charcoal/10 pt-3">
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted">Complete look</span>
        <span className="flex items-center gap-2">
          <ScoreRing score={verdict.score} />
          <span className="text-sm text-charcoal">{verdict.label}</span>
        </span>
      </div>

      <button
        onClick={onCta}
        className="mt-3 w-full rounded-full bg-charcoal py-3 text-[11px] tracking-[0.2em] uppercase text-cream transition hover:bg-terracotta"
      >
        {ctaLabel} →
      </button>
    </div>
  )
}

export function ScoreRing({ score, size = 26 }: { score: number; size?: number }) {
  const r = 10
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label={`${score} out of 100`}>
      <circle cx="12" cy="12" r={r} fill="none" stroke="rgba(43,38,34,0.12)" strokeWidth="3" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="var(--color-terracotta)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        transform="rotate(-90 12 12)"
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  )
}
