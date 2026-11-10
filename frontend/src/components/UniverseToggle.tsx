// The Style Universe switch: women's / men's mode.
// A sliding pill: the dark "thumb" moves with a CSS transform.
import { useProfile } from '../context/ProfileContext'
import type { Universe } from '../context/ProfileContext'

const OPTIONS: { value: Universe; label: string }[] = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
]

export default function UniverseToggle() {
  const { profile, update } = useProfile()
  const index = OPTIONS.findIndex((o) => o.value === profile.universe)

  return (
    <div role="radiogroup" aria-label="Style Universe" className="relative flex rounded-full border border-charcoal/15 bg-white/60 p-0.5 backdrop-blur">
      <span
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-charcoal transition-transform duration-300"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={profile.universe === o.value}
          onClick={() => update({ universe: o.value })}
          className={`relative z-10 w-16 rounded-full py-1.5 text-[11px] tracking-[0.12em] uppercase transition-colors duration-300 ${
            profile.universe === o.value ? 'text-cream' : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
