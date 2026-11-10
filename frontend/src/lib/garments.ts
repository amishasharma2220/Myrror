// ─────────────────────────────────────────────────────────────
// Garments: turning wardrobe rows into things the avatar can wear.
//
// Your backend stores each item as { name, category, color } with
// free text ("Shirt", "jeans", "navy"). The avatar needs to know
// WHERE an item goes on the body, so we map category → "slot".
// ─────────────────────────────────────────────────────────────

export type Slot = 'top' | 'outer' | 'bottom' | 'dress' | 'shoes'

export interface Garment {
  id: string
  name: string
  category: string
  color: string // a CSS color: "#1f3a5f", "navy", ...
  slot: Slot
}

// Keyword lists for guessing the slot. Order matters: "t-shirt dress"
// should be a dress, so dress is checked before top.
const SLOT_KEYWORDS: [Slot, string[]][] = [
  ['dress', ['dress', 'gown', 'jumpsuit', 'saree', 'sari', 'lehenga', 'anarkali']],
  ['outer', ['jacket', 'coat', 'blazer', 'hoodie', 'cardigan', 'shrug', 'overshirt', 'parka']],
  ['shoes', ['shoe', 'sneaker', 'boot', 'heel', 'sandal', 'loafer', 'flat', 'jutti', 'mojari']],
  ['bottom', ['jean', 'trouser', 'pant', 'skirt', 'short', 'chino', 'legging', 'palazzo', 'jogger', 'cargo']],
  ['top', ['shirt', 'tee', 'top', 'blouse', 'kurta', 'kurti', 'sweater', 'polo', 'tank', 'crop']],
]

export function slotFor(category: string, name = ''): Slot {
  const text = `${category} ${name}`.toLowerCase()
  for (const [slot, words] of SLOT_KEYWORDS) {
    if (words.some((w) => text.includes(w))) return slot
  }
  return 'top' // safest default: most items people add are tops
}

// People type colours like "Blue", "olive green", "off white".
// The browser understands many CSS names already ("navy", "olive"),
// but not multi-word ones, so we map the common ones by hand.
const COLOR_NAMES: Record<string, string> = {
  // basic names map to fabric-like shades (pure CSS "blue" is screen-blue)
  blue: '#2f5aa8',
  black: '#26221f',
  white: '#f7f5f0',
  red: '#b8323a',
  green: '#3f6b45',
  yellow: '#e2b93b',
  pink: '#e8a7b8',
  grey: '#8d8a86',
  gray: '#8d8a86',
  brown: '#6e4a33',
  purple: '#6a4c8c',
  orange: '#d9783a',
  'off white': '#f2ede3',
  offwhite: '#f2ede3',
  cream: '#efe6d2',
  beige: '#d9c7a7',
  'olive green': '#6b7041',
  olive: '#6b7041',
  'navy blue': '#1f2f4f',
  navy: '#1f2f4f',
  'sky blue': '#8fbbe0',
  'baby pink': '#f2c6cf',
  maroon: '#6e2230',
  mustard: '#d1a13a',
  rust: '#a9532f',
  denim: '#4a6b8f',
  'light blue': '#a9c8e6',
  'dark green': '#2f4a35',
  charcoal: '#3a3633',
  khaki: '#b9a77c',
  camel: '#b9875a',
  lavender: '#b9a7d9',
  teal: '#2f7a78',
}

export function toCssColor(raw: string): string {
  const key = raw.trim().toLowerCase()
  if (!key) return '#cfc6b8'
  if (COLOR_NAMES[key]) return COLOR_NAMES[key]
  // If the browser recognises the string as a colour, use it as-is.
  if (typeof CSS !== 'undefined' && CSS.supports('color', key)) return key
  return '#cfc6b8' // neutral fallback so the avatar never goes invisible
}

// Shape returned by your FastAPI /wardrobe endpoint
interface ApiItem {
  id: number
  name: string
  category: string
  color: string
}

export function fromApi(item: ApiItem): Garment {
  return {
    id: `api-${item.id}`,
    name: item.name,
    category: item.category,
    color: toCssColor(item.color),
    slot: slotFor(item.category, item.name),
  }
}

// Demo pieces so the studio works before login / with an empty wardrobe.
export const DEMO_RACK: Record<'women' | 'men', Garment[]> = {
  women: [
    { id: 'd1', name: 'Linen shirt', category: 'Shirt', color: '#f2ede3', slot: 'top' },
    { id: 'd2', name: 'Rib knit top', category: 'Top', color: '#b8674a', slot: 'top' },
    { id: 'd3', name: 'Cropped blazer', category: 'Blazer', color: '#2b2622', slot: 'outer' },
    { id: 'd4', name: 'Wide-leg trousers', category: 'Trousers', color: '#d9c7a7', slot: 'bottom' },
    { id: 'd5', name: 'Straight jeans', category: 'Jeans', color: '#4a6b8f', slot: 'bottom' },
    { id: 'd6', name: 'Slip dress', category: 'Dress', color: '#6b7041', slot: 'dress' },
    { id: 'd7', name: 'Leather loafers', category: 'Loafers', color: '#3a2a20', slot: 'shoes' },
    { id: 'd8', name: 'White sneakers', category: 'Sneakers', color: '#f7f5f0', slot: 'shoes' },
  ],
  men: [
    { id: 'm1', name: 'Oxford shirt', category: 'Shirt', color: '#a9c8e6', slot: 'top' },
    { id: 'm2', name: 'Heavy tee', category: 'Tee', color: '#2b2622', slot: 'top' },
    { id: 'm3', name: 'Chore jacket', category: 'Jacket', color: '#6b7041', slot: 'outer' },
    { id: 'm4', name: 'Pleated chinos', category: 'Chinos', color: '#b9a77c', slot: 'bottom' },
    { id: 'm5', name: 'Raw denim', category: 'Jeans', color: '#1f2f4f', slot: 'bottom' },
    { id: 'm6', name: 'Linen kurta', category: 'Kurta', color: '#efe6d2', slot: 'top' },
    { id: 'm7', name: 'Suede boots', category: 'Boots', color: '#8a5a3a', slot: 'shoes' },
    { id: 'm8', name: 'Court sneakers', category: 'Sneakers', color: '#f7f5f0', slot: 'shoes' },
  ],
}

// What's currently on the avatar. Each slot holds one garment (or none).
export type Look = Partial<Record<Slot, Garment>>

// Putting on an item follows real-life rules:
//  - a dress replaces top + bottom
//  - a top or bottom replaces a dress
//  - clicking something you're already wearing takes it off
export function wear(look: Look, g: Garment): Look {
  const next: Look = { ...look }
  if (next[g.slot]?.id === g.id) {
    delete next[g.slot]
    return next
  }
  if (g.slot === 'dress') {
    delete next.top
    delete next.bottom
  }
  if (g.slot === 'top' || g.slot === 'bottom') delete next.dress
  next[g.slot] = g
  return next
}
