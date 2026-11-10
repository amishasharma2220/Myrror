// ─────────────────────────────────────────────────────────────
// The "stylist": answers "I'm wearing this, is it fine?"
//
// For now this is a small rule engine that runs in the browser
// (colour theory + a few occasion rules), so the chat feels real
// while you build the frontend. Later you replace `askStylist`
// with a fetch() to a FastAPI endpoint that calls an LLM, and the
// UI doesn't need to change. That's the point of keeping it in
// its own file.
// ─────────────────────────────────────────────────────────────
import type { Garment, Look } from './garments'

interface Hsl {
  h: number // 0–360
  s: number // 0–1
  l: number // 0–1
}

// Turn any CSS colour ("navy", "#1f2f4f") into HSL.
// Trick: a canvas normalises colour names to hex for us.
let ctx: CanvasRenderingContext2D | null = null
export function toHsl(color: string): Hsl {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')
  let hex = color
  if (ctx) {
    ctx.fillStyle = '#000'
    ctx.fillStyle = color
    hex = String(ctx.fillStyle)
  }
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return { h: 0, s: 0, l: 0.5 }
  const n = parseInt(m[1], 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return { h, s, l }
}

// Neutrals (white, black, grey, beige, denim-ish) go with everything.
function isNeutral(c: Hsl) {
  const earthy = c.h >= 15 && c.h <= 50 && (c.s < 0.5 || c.l < 0.32) // browns, tans, beige, camel
  return c.s < 0.22 || c.l > 0.88 || c.l < 0.16 || earthy
}

function hueGap(a: number, b: number) {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

export interface Verdict {
  score: number // 0–100
  label: string // "Looks great", ...
  notes: string[]
}

export function rateLook(look: Look): Verdict {
  const pieces = Object.values(look).filter(Boolean) as Garment[]
  const notes: string[] = []
  if (pieces.length === 0) {
    return { score: 0, label: 'Nothing on yet', notes: ['Pick a few pieces from the rack to start.'] }
  }

  let score = 70
  const hasBody = look.dress || (look.top && look.bottom)
  if (!hasBody) {
    score -= 25
    notes.push(look.top ? 'Add a bottom to finish the base.' : 'Add a top (or a dress) to finish the base.')
  }
  if (!look.shoes) {
    score -= 8
    notes.push('Shoes are missing. They decide how formal the look reads.')
  }

  const colored = pieces.map((p) => ({ p, c: toHsl(p.color) })).filter((x) => !isNeutral(x.c))
  if (colored.length === 0) {
    score += 12
    notes.push('All neutrals: easy and clean. A single colour accent would add life.')
  } else if (colored.length === 1) {
    score += 18
    notes.push(`One accent colour (${colored[0].p.name.toLowerCase()}) against neutrals. That's the safest way to wear colour.`)
  } else {
    // compare every pair of coloured pieces
    let clash = false
    let complementary = false
    for (let i = 0; i < colored.length; i++)
      for (let j = i + 1; j < colored.length; j++) {
        const gap = hueGap(colored[i].c.h, colored[j].c.h)
        if (gap <= 35) continue // analogous: fine
        if (gap >= 150) complementary = true
        else clash = true
      }
    if (clash) {
      score -= 15
      notes.push('Two colours here sit awkwardly on the colour wheel. Swap one for a neutral.')
    } else if (complementary) {
      score += 8
      notes.push('Complementary colours: bold, works if you want to stand out.')
    } else {
      score += 12
      notes.push('Colours are neighbours on the wheel, so they blend nicely.')
    }
    if (colored.length >= 3) {
      score -= 10
      notes.push('Three or more colours is a lot. Keep one, neutralise the rest.')
    }
  }

  // tone-on-tone check between top and bottom
  if (look.top && look.bottom) {
    const a = toHsl(look.top.color)
    const b = toHsl(look.bottom.color)
    if (Math.abs(a.l - b.l) < 0.08 && hueGap(a.h, b.h) > 20) {
      score -= 6
      notes.push('Top and bottom are the same lightness but different colours, which can look accidental. Go lighter on top.')
    }
  }

  score = Math.max(5, Math.min(98, Math.round(score)))
  const label = score >= 85 ? 'Looks great' : score >= 70 ? 'Works well' : score >= 50 ? 'Almost there' : 'Needs a change'
  return { score, label, notes }
}

const OCCASIONS: [RegExp, string][] = [
  [/interview|office|work|meeting|presentation/, 'For work, keep it to neutrals plus one muted colour, and choose closed shoes over sneakers.'],
  [/college|class|campus|uni/, 'For college this is about comfort. Sneakers and a relaxed top are perfect, just keep it put-together.'],
  [/wedding|festive|diwali|puja|function|sangeet|mehendi/, 'For a festive occasion, go richer: a kurta or a dress in a jewel tone, with dressier footwear.'],
  [/date|dinner|party/, 'For an evening out, one statement piece is enough. Let the rest stay quiet.'],
  [/gym|run|workout/, 'For the gym, skip anything rigid like denim or blazers.'],
]

// Main entry point for the chat. Async so swapping in a real API is trivial.
export async function askStylist(question: string, look: Look): Promise<string> {
  await new Promise((r) => setTimeout(r, 650 + Math.random() * 500)) // feels like thinking
  const q = question.toLowerCase()
  const v = rateLook(look)
  const pieces = Object.values(look).filter(Boolean) as Garment[]

  if (pieces.length === 0) {
    return "You're not wearing anything on your avatar yet. Tap a few pieces on the rack and ask me again."
  }

  const list = pieces.map((p) => p.name.toLowerCase()).join(', ')
  const lines = [`**${v.label} (${v.score}/100).** You're wearing ${list}.`]
  const occasion = OCCASIONS.find(([re]) => re.test(q))
  if (occasion) lines.push(occasion[1])
  lines.push(...v.notes.slice(0, 2))
  if (/change|improve|better|swap|fix/.test(q) && v.score < 85) {
    lines.push('If you change just one thing, start with the first note above.')
  }
  return lines.join('\n\n')
}
