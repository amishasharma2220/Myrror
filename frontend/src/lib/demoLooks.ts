// Ready-made looks for the landing page and background crowd.
import { DEMO_RACK } from './garments'
import type { Look } from './garments'
import type { Universe } from '../context/ProfileContext'

const byId = (u: Universe) => Object.fromEntries(DEMO_RACK[u].map((g) => [g.id, g]))

export function demoLooks(u: Universe): { name: string; look: Look }[] {
  const g = byId(u)
  return u === 'women'
    ? [
        { name: 'Weekday edit', look: { top: g.d1, bottom: g.d4, shoes: g.d7 } },
        { name: 'Studio to street', look: { top: g.d2, outer: g.d3, bottom: g.d5, shoes: g.d8 } },
        { name: 'Golden hour', look: { dress: g.d6, shoes: g.d7 } },
      ]
    : [
        { name: 'Campus uniform', look: { top: g.m2, bottom: g.m5, shoes: g.m8 } },
        { name: 'Soft tailoring', look: { top: g.m1, outer: g.m3, bottom: g.m4, shoes: g.m7 } },
        { name: 'Festive ease', look: { top: g.m6, bottom: g.m4, shoes: g.m7 } },
      ]
}

// Deterministic "random" crowd so the background doesn't reshuffle on every render
const TONES = ['#f3d6c1', '#e8bf9f', '#d6a07a', '#bd8460', '#9a6444', '#6f4630']
export function crowd(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const universe: Universe = i % 3 === 1 ? 'men' : 'women'
    const looks = demoLooks(universe)
    return {
      universe,
      look: looks[(i * 7) % looks.length].look,
      skin: TONES[(i * 5) % TONES.length],
      pose: (i % 2 ? 'stride' : 'stand') as 'stride' | 'stand',
    }
  })
}
