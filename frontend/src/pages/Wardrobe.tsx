// ─────────────────────────────────────────────────────────────
// Wardrobe: add, browse and remove the pieces you own.
// Same API calls as before (GET/POST/DELETE /wardrobe), new look:
// a live preview of the piece you're adding, filterable cards,
// and a link to try everything on in the Studio.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import GarmentIcon from '../components/GarmentIcon'
import GlassCard from '../components/GlassCard'
import { getWardrobeItems, addWardrobeItem, deleteWardrobeItem } from '../api/wardrobe'
import type { WardrobeItem } from '../api/wardrobe'
import { useAuth } from '../context/AuthContext'
import { fromApi, slotFor, toCssColor } from '../lib/garments'
import type { Garment, Slot } from '../lib/garments'

const SLOT_LABEL: Record<Slot, string> = { top: 'Top', outer: 'Layer', bottom: 'Bottom', dress: 'Dress', shoes: 'Shoes' }
const SLOT_PLURAL: Record<Slot, string> = { top: 'Tops', outer: 'Layers', bottom: 'Bottoms', dress: 'Dresses', shoes: 'Shoes' }
const FILTERS: (Slot | 'all')[] = ['all', 'top', 'outer', 'bottom', 'dress', 'shoes']
const QUICK_CATEGORIES = ['Shirt', 'T-shirt', 'Kurta', 'Jacket', 'Jeans', 'Trousers', 'Skirt', 'Dress', 'Sneakers', 'Boots']
const QUICK_COLORS = ['White', 'Black', 'Navy', 'Beige', 'Olive', 'Maroon', 'Mustard', 'Sky blue', 'Denim', 'Rust']

function Wardrobe() {
  const { token } = useAuth()
  const [items, setItems] = useState<WardrobeItem[]>([])
  // only "loading" when there's a token to load with (this was the stuck-loading bug)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<Slot | 'all'>('all')
  const [justAdded, setJustAdded] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    getWardrobeItems(token)
      .then((data) => setItems(data))
      .catch(() => setError("Couldn't load your wardrobe. Is the backend running on port 8001?"))
      .finally(() => setLoading(false))
  }, [token])

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError('')
    try {
      const newItem = await addWardrobeItem(token, { name, category, color })
      setItems((prev) => [newItem, ...prev])
      setJustAdded(newItem.id)
      setName('')
      setCategory('')
      setColor('')
    } catch {
      setError('Could not add item. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!token) return
    // first click asks, second click removes
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    setConfirmId(null)
    const before = items
    setItems((prev) => prev.filter((i) => i.id !== id)) // optimistic: remove instantly
    try {
      await deleteWardrobeItem(token, id)
    } catch {
      setItems(before) // put it back if the server said no
      setError('Could not remove that item.')
    }
  }

  // Live preview of the piece being typed in
  const preview: Garment = {
    id: 'preview',
    name: name || 'Your new piece',
    category: category || 'Shirt',
    color: toCssColor(color || 'beige'),
    slot: slotFor(category || 'shirt', name),
  }
  const colorKnown = !color || toCssColor(color) !== '#cfc6b8'

  const garments = items.map((i) => ({ item: i, g: fromApi(i) }))
  const visible = filter === 'all' ? garments : garments.filter(({ g }) => g.slot === filter)
  const countBy = (s: Slot) => garments.filter(({ g }) => g.slot === s).length
  const colourCount = new Set(garments.map(({ g }) => g.color)).size

  const label = 'text-[10px] tracking-[0.22em] uppercase text-muted'
  const field =
    'w-full rounded-xl border border-charcoal/15 bg-white/70 px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted/60 focus:border-terracotta focus:outline-none transition'

  return (
    <div className="min-h-screen bg-cream">
      <Nav />

      <main className="mx-auto max-w-6xl px-5 pb-24 md:px-10">
        {/* ── header ── */}
        <div className="flex flex-wrap items-end justify-between gap-6 pt-4">
          <div>
            <p className={label}>Your wardrobe</p>
            <h1 className="mt-2 font-serif text-5xl leading-[0.95] text-charcoal md:text-6xl">
              Everything you <em className="text-terracotta">own</em>,
              <br />
              in one place.
            </h1>
          </div>
          {token && !loading && (
            <div className="flex gap-3">
              <GlassCard label="Pieces" className="min-w-28">
                <p className="font-serif text-4xl leading-none text-charcoal">{items.length}</p>
              </GlassCard>
              <GlassCard label="Colours" className="min-w-28">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-4xl leading-none text-charcoal">{colourCount}</p>
                  <div className="flex gap-0.5">
                    {[...new Set(garments.map(({ g }) => g.color))].slice(0, 5).map((c) => (
                      <span key={c} className="h-4 w-4 rounded-full border border-white" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* ── signed out ── */}
        {!token && (
          <div className="mt-12 grid items-center gap-8 rounded-[32px] bg-gradient-to-br from-[#efe6d8] to-[#e2d4bf] p-8 md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <h2 className="font-serif text-3xl text-charcoal">Sign in to see your wardrobe</h2>
              <p className="mt-2 max-w-md text-sm text-muted">Your pieces are saved to your account, so you can try them on in the studio from anywhere.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/login" className="rounded-full bg-charcoal px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-cream hover:bg-terracotta">Sign in</Link>
                <Link to="/register" className="rounded-full border border-charcoal/20 px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-charcoal hover:bg-white/50">Create account</Link>
              </div>
            </div>
            <div className="flex gap-2 opacity-70">
              {(['top', 'bottom', 'shoes'] as Slot[]).map((s, i) => (
                <GarmentIcon key={s} garment={{ id: s, name: s, category: ['Shirt', 'Jeans', 'Sneakers'][i], color: ['#f2ede3', '#4a6b8f', '#3a2a20'][i], slot: s }} className="h-24 w-24" />
              ))}
            </div>
          </div>
        )}

        {token && (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
            {/* ── add a piece ── */}
            <form
              onSubmit={handleAddItem}
              className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_-40px_rgba(43,38,34,0.45)] backdrop-blur lg:sticky lg:top-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-serif text-2xl italic text-charcoal">Add a piece</p>
                <span className="rounded-full bg-charcoal/[0.06] px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-muted">
                  Goes on: {SLOT_LABEL[preview.slot]}
                </span>
              </div>

              {/* live preview */}
              <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-b from-[#f4efe7] to-[#e9e2d6]">
                <GarmentIcon garment={preview} className={`h-[75%] w-[75%] transition-opacity ${name || category || color ? 'opacity-100' : 'opacity-40'}`} />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="w-name" className={label}>Name</label>
                  <input id="w-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Linen shirt" className={`mt-1.5 ${field}`} />
                </div>

                <div>
                  <label htmlFor="w-cat" className={label}>Category</label>
                  <input id="w-cat" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="Shirt" className={`mt-1.5 ${field}`} />
                  <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
                    {QUICK_CATEGORIES.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] transition ${category === c ? 'bg-charcoal text-cream' : 'bg-charcoal/[0.05] text-muted hover:text-charcoal'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="w-col" className={label}>Colour</label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-charcoal/10" style={{ background: toCssColor(color || 'transparent') }} />
                    <input id="w-col" value={color} onChange={(e) => setColor(e.target.value)} required placeholder="Navy" className={`${field} pl-10`} />
                  </div>
                  {!colorKnown && <p className="mt-1 text-[11px] text-terracotta">We don't recognise that colour yet, so it'll show as neutral.</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {QUICK_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        title={c}
                        aria-label={c}
                        className={`h-6 w-6 rounded-full border-2 transition ${color === c ? 'scale-110 border-charcoal' : 'border-white hover:scale-110'}`}
                        style={{ background: toCssColor(c) }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-charcoal py-3 text-[11px] tracking-[0.2em] uppercase text-cream transition hover:bg-terracotta disabled:opacity-60"
              >
                {submitting ? 'Hanging it up…' : 'Add to wardrobe +'}
              </button>
            </form>

            {/* ── items ── */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                  {FILTERS.map((f) => {
                    const n = f === 'all' ? items.length : countBy(f)
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase transition ${
                          filter === f ? 'bg-charcoal text-cream' : 'border border-charcoal/15 text-muted hover:text-charcoal'
                        }`}
                      >
                        {f === 'all' ? 'All' : SLOT_PLURAL[f]} <span className="opacity-60">{n}</span>
                      </button>
                    )
                  })}
                </div>
                {items.length > 0 && (
                  <Link to="/studio" className="text-[11px] tracking-[0.2em] uppercase text-terracotta hover:underline">
                    Try them on →
                  </Link>
                )}
              </div>

              {error && <p className="mt-4 rounded-full bg-terracotta/10 px-4 py-2 text-xs text-terracotta w-fit">{error}</p>}

              {loading && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-charcoal/[0.05]" />
                  ))}
                </div>
              )}

              {!loading && items.length === 0 && !error && (
                <div className="mt-6 flex flex-col items-center rounded-[28px] border border-dashed border-charcoal/20 px-6 py-16 text-center">
                  {/* empty rail */}
                  <div className="relative mb-6 h-10 w-56">
                    <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-gradient-to-b from-[#c9c2b6] to-[#8f877b]" />
                    {[40, 100, 160].map((x) => (
                      <svg key={x} viewBox="0 0 60 30" className="absolute top-0 h-8 w-14 opacity-60" style={{ left: x - 28 }} aria-hidden="true">
                        <path d="M30 14 L30 8 Q30 3 34 3 Q38 3 38 7" fill="none" stroke="#6e665c" strokeWidth="2" />
                        <path d="M6 28 L30 14 L54 28" fill="none" stroke="#6e665c" strokeWidth="2" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-serif text-2xl italic text-charcoal">An empty rail, for now</p>
                  <p className="mt-1 max-w-xs text-sm text-muted">Add your first piece on the left. Start with what you wear most.</p>
                </div>
              )}

              {!loading && items.length > 0 && visible.length === 0 && (
                <p className="mt-10 text-center font-serif text-xl italic text-muted">Nothing in this section yet.</p>
              )}

              {!loading && visible.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {visible.map(({ item, g }) => (
                    <article
                      key={item.id}
                      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/70 transition hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(43,38,34,0.5)] ${
                        justAdded === item.id ? 'animate-[pop_500ms_ease]' : ''
                      }`}
                    >
                      <div className="relative flex aspect-square items-center justify-center bg-gradient-to-b from-[#f4efe7] to-[#e9e2d6]">
                        <GarmentIcon garment={g} className="h-[70%] w-[70%] transition duration-500 group-hover:scale-105 group-hover:-rotate-2" />
                        <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase text-muted">
                          {SLOT_LABEL[g.slot]}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          onMouseLeave={() => confirmId === item.id && setConfirmId(null)}
                          aria-label={`Remove ${item.name}`}
                          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] transition ${
                            confirmId === item.id
                              ? 'bg-terracotta text-cream opacity-100'
                              : 'bg-white/80 text-muted opacity-0 group-hover:opacity-100 hover:text-terracotta focus:opacity-100'
                          }`}
                        >
                          {confirmId === item.id ? 'Remove?' : '✕'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-serif text-lg capitalize leading-tight text-charcoal">{item.name}</p>
                          <p className="truncate text-[10px] tracking-[0.15em] uppercase text-muted">{item.category}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5 text-[11px] capitalize text-muted">
                          <span className="h-3.5 w-3.5 rounded-full border border-charcoal/10" style={{ background: g.color }} />
                          {item.color}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default Wardrobe
