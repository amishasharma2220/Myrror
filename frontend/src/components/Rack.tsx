// Hangline-style clothing rail. Each garment hangs from a hook and
// swings when you hover it; tap to put it on the avatar.
import type { Garment, Look } from '../lib/garments'
import GarmentIcon from './GarmentIcon'

interface RackProps {
  items: Garment[]
  look: Look
  onPick: (g: Garment) => void
}

export default function Rack({ items, look, onPick }: RackProps) {
  const isWorn = (g: Garment) => look[g.slot]?.id === g.id

  return (
    <div className="relative">
      {/* the rail */}
      <div className="absolute left-0 right-0 top-[14px] h-[5px] rounded-full bg-gradient-to-b from-[#c9c2b6] to-[#8f877b] shadow-[0_2px_3px_rgba(0,0,0,0.15)]" />
      <div className="no-scrollbar relative flex gap-1 overflow-x-auto px-4 pb-4">
        {items.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onPick(g)}
            aria-pressed={isWorn(g)}
            title={isWorn(g) ? `Take off ${g.name}` : `Wear ${g.name}`}
            className="group flex w-[92px] shrink-0 flex-col items-center outline-none"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`hanger flex flex-col items-center ${isWorn(g) ? 'translate-y-2 opacity-40' : ''} transition duration-300`}>
              {/* hook + shoulders of the hanger */}
              <svg viewBox="0 0 60 30" className="h-[30px] w-[60px]" aria-hidden="true">
                <path d="M30 14 L30 8 Q30 3 34 3 Q38 3 38 7" fill="none" stroke="#6e665c" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 28 L30 14 L54 28" fill="none" stroke="#6e665c" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <GarmentIcon garment={g} className="-mt-3 h-[96px] w-[86px] drop-shadow-[0_10px_8px_rgba(43,38,34,0.18)]" />
            </div>
            <span className={`mt-1 line-clamp-1 text-[10px] tracking-[0.08em] ${isWorn(g) ? 'text-terracotta' : 'text-muted group-hover:text-charcoal'}`}>
              {isWorn(g) ? '● wearing' : g.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
