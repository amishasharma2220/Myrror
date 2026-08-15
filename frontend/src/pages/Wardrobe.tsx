import { useState, useEffect } from 'react'
import { getWardrobeItems } from '../api/wardrobe'
import type { WardrobeItem } from '../api/wardrobe'
import { useAuth } from '../context/AuthContext'

function Wardrobe() {
  const { token, logout } = useAuth()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    getWardrobeItems(token)
      .then((data) => setItems(data))
      .catch(() => setError('Could not load your wardrobe.'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="min-h-screen bg-cream px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-2xl text-charcoal">Myrror</h1>
        <button
          onClick={logout}
          className="text-sm text-muted underline"
        >
          Log out
        </button>
      </div>

      <h2 className="font-serif text-4xl text-charcoal mb-2">Your wardrobe</h2>
      <p className="text-muted mb-8">
        A curated record of pieces you already own, ready when inspiration
        strikes.
      </p>

      {loading && <p className="text-muted">Loading your wardrobe...</p>}

      {error && <p className="text-terracotta">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="border border-charcoal/10 rounded-2xl p-10 text-center max-w-md">
          <p className="text-charcoal font-serif text-xl mb-2">
            Your wardrobe is empty
          </p>
          <p className="text-muted text-sm">
            Start adding pieces you own to build your personal style record.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-charcoal/10 rounded-2xl p-5 flex flex-col gap-2"
            >
              <div
                className="w-8 h-8 rounded-full border border-charcoal/10"
                style={{ backgroundColor: item.color }}
              />
              <p className="font-serif text-lg text-charcoal">{item.name}</p>
              <p className="text-xs uppercase tracking-widest text-muted">
                {item.category}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wardrobe