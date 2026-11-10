// Small flat drawing of a garment, used on the rack and in the look card.
import type { Garment } from '../lib/garments'

const edge = 'rgba(43,38,34,0.18)'

export default function GarmentIcon({ garment, className = '' }: { garment: Garment; className?: string }) {
  const c = garment.color
  const t = `${garment.category} ${garment.name}`.toLowerCase()
  let shape: React.ReactNode

  switch (garment.slot) {
    case 'top':
      shape = t.includes('kurta') ? (
        <path d="M30 14 L44 10 Q50 16 56 10 L70 14 L88 34 L78 42 L70 34 L72 92 L28 92 L30 34 L22 42 L12 34 Z" />
      ) : (
        <path d="M30 16 L42 10 Q50 18 58 10 L70 16 L88 34 L78 44 L70 36 L70 76 L30 76 L30 36 L22 44 L12 34 Z" />
      )
      break
    case 'outer':
      shape = (
        <>
          <path d="M28 14 L44 8 L50 30 L56 8 L72 14 L90 40 L90 84 L80 84 L78 44 L72 40 L72 84 L28 84 L28 40 L22 44 L20 84 L10 84 L10 40 Z" />
          <path d="M50 30 L50 84" stroke={edge} fill="none" />
        </>
      )
      break
    case 'bottom':
      shape = t.includes('skirt') ? (
        <path d="M34 12 L66 12 L80 78 Q50 86 20 78 Z" />
      ) : t.includes('short') ? (
        <path d="M30 12 L70 12 L74 54 L54 54 L50 30 L46 54 L26 54 Z" />
      ) : (
        <path d="M32 8 L68 8 L72 92 L56 92 L50 32 L44 92 L28 92 Z" />
      )
      break
    case 'dress':
      shape = <path d="M38 8 L44 8 Q50 16 56 8 L62 8 L64 34 L58 40 L80 92 Q50 98 20 92 L42 40 L36 34 Z" />
      break
    case 'shoes':
      shape = (
        <>
          <path d="M14 58 Q14 42 28 40 L40 40 Q46 52 62 56 L82 60 Q90 62 88 70 L14 70 Z" />
          <path d="M14 70 L88 70" stroke={edge} strokeWidth="4" />
        </>
      )
      break
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill={c} stroke={edge} strokeWidth="1.2" strokeLinejoin="round" style={{ transition: 'fill 400ms' }}>
        {shape}
      </g>
    </svg>
  )
}
