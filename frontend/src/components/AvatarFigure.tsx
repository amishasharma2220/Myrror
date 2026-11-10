// ─────────────────────────────────────────────────────────────
// AvatarFigure: the user's body, drawn in SVG, wearing a Look.
//
// Why SVG and not an image? Every part is a shape we can recolour,
// resize and animate with plain React props: change `look.top` and
// the shirt changes colour with a CSS transition. When the backend
// can generate a real avatar from a photo, this component is what
// gets swapped out; the rest of the app just passes a Look in.
//
// Coordinate system: viewBox is 200 × 500, body centred on x = 100.
// ─────────────────────────────────────────────────────────────
import { useId } from 'react'
import type { Look } from '../lib/garments'
import type { Universe } from '../context/ProfileContext'

interface AvatarFigureProps {
  look: Look
  skin?: string
  universe?: Universe
  heightCm?: number
  weightKg?: number
  photo?: string | null
  pose?: 'stand' | 'stride'
  walking?: boolean // gentle looping walk animation
  className?: string
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function bottomKind(category: string, name: string) {
  const t = `${category} ${name}`.toLowerCase()
  if (t.includes('skirt')) return 'skirt'
  if (t.includes('short')) return 'shorts'
  return 'trousers'
}

export default function AvatarFigure({
  look,
  skin = '#d6a07a',
  universe = 'women',
  heightCm = 165,
  weightKg = 58,
  photo = null,
  pose = 'stand',
  walking = false,
  className = '',
}: AvatarFigureProps) {
  const uid = useId().replace(/:/g, '')
  const isW = universe === 'women'

  // Body proportions from height/weight (rough BMI-based width)
  const bmi = weightKg / (heightCm / 100) ** 2
  const wide = clamp(0.86 + (bmi - 21) * 0.035, 0.8, 1.3)
  const tall = clamp(heightCm / 168, 0.9, 1.06)

  const sw = (isW ? 33 : 40) * wide // shoulder half-width
  const ww = (isW ? 22 : 29) * wide // waist half-width
  const hw = (isW ? 35 : 32) * wide // hip half-width
  const legX = hw * 0.48

  // Limb angles (degrees). Stride = Boutique's "stepping out" pose.
  const stride = pose === 'stride'
  const a = {
    armL: stride ? 16 : 4,
    armR: stride ? -14 : -4,
    legL: stride ? 9 : 1.5,
    legR: stride ? -11 : -1.5,
  }
  const rot = (deg: number, x: number, y: number): React.CSSProperties => ({
    transform: `rotate(${deg}deg)`,
    transformOrigin: `${x}px ${y}px`,
    transformBox: 'view-box',
    transition: 'transform 700ms cubic-bezier(.2,.8,.2,1)',
  })
  const fill = (c: string): React.CSSProperties => ({ fill: c, transition: 'fill 450ms ease' })
  const edge = 'rgba(43,38,34,0.12)'

  const top = look.top
  const outer = look.outer
  const bottom = look.bottom
  const dress = look.dress
  const shoes = look.shoes
  const kind = bottom ? bottomKind(bottom.category, bottom.name) : null
  const hair = isW ? '#2a1d17' : '#231a15'

  const torso = `M ${100 - sw} 94 Q 100 82 ${100 + sw} 94 L ${100 + ww} 200 Q ${100 + hw + 2} 220 ${100 + hw} 240 L ${100 - hw} 240 Q ${100 - hw - 2} 220 ${100 - ww} 200 Z`
  const topShape = `M ${100 - sw - 1} 93 Q 100 81 ${100 + sw + 1} 93 L ${100 + ww + 3} 200 L ${100 + hw - 2} 222 L ${100 - hw + 2} 222 L ${100 - ww - 3} 200 Z`
  const skirtLen = kind === 'skirt' ? 330 : 345
  const aline = (y0: number, len: number, flare: number) =>
    `M ${100 - ww - 2} ${y0} L ${100 + ww + 2} ${y0} L ${100 + hw + flare} ${len} Q 100 ${len + 10} ${100 - hw - flare} ${len} Z`

  // One leg (skin + optional trouser tube + shoe), drawn around x = cx
  // Plain functions (not components) so React keeps the same DOM nodes
  // between renders, which is what lets the CSS colour transitions play.
  const leg = (cx: number, angle: number) => (
    <g style={rot(angle, cx, 236)}>
      <rect x={cx - 10.5} y={228} width={21} height={214} rx={10.5} style={fill(skin)} />
      {bottom && kind !== 'skirt' && (
        <rect
          x={cx - 13}
          y={224}
          width={26}
          height={kind === 'shorts' ? 78 : 212}
          rx={9}
          style={fill(bottom.color)}
          stroke={edge}
        />
      )}
      <ellipse cx={cx + 3} cy={448} rx={15} ry={8} style={fill(shoes ? shoes.color : skin)} stroke={shoes ? edge : 'none'} />
      {shoes && <rect x={cx - 11} y={436} width={22} height={12} rx={5} style={fill(shoes.color)} />}
    </g>
  )

  const arm = (side: 'L' | 'R') => {
    const x = side === 'L' ? 100 - sw - 5 : 100 + sw + 5
    const angle = side === 'L' ? a.armL : a.armR
    const sleeve = outer ?? top
    const sleeveLen = outer ? 128 : top ? 52 : 0
    return (
      <g style={rot(angle, x, 98)}>
        <rect x={x - 8} y={94} width={16} height={140} rx={8} style={fill(skin)} />
        <circle cx={x} cy={238} r={9} style={fill(skin)} />
        {sleeve && sleeveLen > 0 && (
          <rect x={x - 10} y={90} width={20} height={sleeveLen} rx={9} style={fill(sleeve.color)} stroke={edge} />
        )}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 200 500"
      className={`${walking ? 'avatar-walk' : ''} ${className}`}
      role="img"
      aria-label="Your avatar"
    >
      <defs>
        <clipPath id={`face-${uid}`}>
          <circle cx="100" cy="50" r="23" />
        </clipPath>
        <radialGradient id={`shade-${uid}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="100" cy="458" rx={hw + 20} ry="7" fill="rgba(43,38,34,0.12)" />

      <g style={{ transform: `scaleY(${tall})`, transformOrigin: '100px 460px', transformBox: 'view-box', transition: 'transform 600ms ease' }}>
        {/* hair behind the head */}
        {isW ? (
          <path d="M 74 46 Q 72 18 100 16 Q 128 18 126 46 L 130 118 Q 100 128 70 118 Z" style={fill(hair)} />
        ) : (
          <path d="M 76 48 Q 74 20 100 20 Q 126 20 124 48 Z" style={fill(hair)} />
        )}

        <g className="avatar-legs">
          {leg(100 - legX, a.legL)}
          {leg(100 + legX, a.legR)}
        </g>

        {/* torso + neck */}
        <rect x="92" y="66" width="16" height="26" rx="6" style={fill(skin)} />
        <path d={torso} style={fill(skin)} />

        {/* bottoms (hip block, skirt) */}
        {bottom && kind !== 'skirt' && (
          <path
            d={`M ${100 - ww - 3} 196 L ${100 + ww + 3} 196 L ${100 + hw + 3} 244 L ${100 - hw - 3} 244 Z`}
            style={fill(bottom.color)}
            stroke={edge}
          />
        )}
        {bottom && kind === 'skirt' && <path d={aline(196, skirtLen, 16)} style={fill(bottom.color)} stroke={edge} />}

        {/* dress = bodice + A-line skirt */}
        {dress && (
          <>
            <path d={topShape} style={fill(dress.color)} stroke={edge} />
            <path d={aline(194, 345, 22)} style={fill(dress.color)} stroke={edge} />
          </>
        )}

        {/* top */}
        {top && !dress && (
          <>
            <path d={topShape} style={fill(top.color)} stroke={edge} />
            {/* neckline */}
            <path d="M 91 86 Q 100 102 109 86" style={fill(skin)} />
          </>
        )}

        {/* outer layer: two open panels so the top shows through */}
        {outer && (
          <>
            <path
              d={`M ${100 - sw - 3} 92 Q 96 84 97 88 L 95 252 L ${100 - hw - 6} 252 L ${100 - ww - 6} 200 Z`}
              style={fill(outer.color)}
              stroke={edge}
            />
            <path
              d={`M ${100 + sw + 3} 92 Q 104 84 103 88 L 105 252 L ${100 + hw + 6} 252 L ${100 + ww + 6} 200 Z`}
              style={fill(outer.color)}
              stroke={edge}
            />
          </>
        )}

        {arm('L')}
        {arm('R')}

        {/* head */}
        <circle cx="100" cy="50" r="23" style={fill(skin)} />
        {photo ? (
          <image
            href={photo}
            x="77"
            y="27"
            width="46"
            height="46"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#face-${uid})`}
          />
        ) : (
          <>
            {/* fringe */}
            <path d={isW ? 'M 77 44 Q 82 26 100 25 Q 118 26 123 42 Q 108 34 92 38 Q 82 40 77 44 Z' : 'M 78 42 Q 84 26 100 26 Q 116 26 122 42 Q 104 32 78 42 Z'} style={fill(hair)} />
          </>
        )}
        <circle cx="100" cy="50" r="23" fill={`url(#shade-${uid})`} pointerEvents="none" />
      </g>
    </svg>
  )
}
