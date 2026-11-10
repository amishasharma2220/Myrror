// ─────────────────────────────────────────────────────────────
// Avatar setup: photo + height + weight + skin tone.
// Every control updates the profile immediately, so the avatar on
// the right reacts live (that's "controlled inputs" in React).
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import AvatarFigure from '../components/AvatarFigure'
import GlassCard, { StatRow } from '../components/GlassCard'
import { SKIN_TONES, useProfile } from '../context/ProfileContext'
import { demoLooks } from '../lib/demoLooks'

// Shrink the uploaded photo to a small square before saving it.
// A phone photo can be 5MB+, which would overflow localStorage.
function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      const s = Math.min(img.width, img.height) // centre-crop to a square
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = URL.createObjectURL(file)
  })
}

export default function AvatarSetup() {
  const { profile, update } = useProfile()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')
  const look = demoLooks(profile.universe)[0].look

  async function onPhoto(file: File | undefined) {
    if (!file) return
    setPhotoError('')
    try {
      update({ photo: await resizeImage(file) })
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Could not use that photo')
    }
  }

  const label = 'text-[10px] tracking-[0.22em] uppercase text-muted'

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-6 md:grid-cols-[1fr_1fr] md:px-10">
        {/* ── form ── */}
        <section>
          <p className={label}>Your avatar</p>
          <h1 className="mt-3 font-serif text-5xl leading-none text-charcoal md:text-6xl">
            Make it <em className="text-terracotta">look like you.</em>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted">
            These details shape how clothes sit on your avatar. Everything stays on this device for now.
          </p>

          <div className="mt-10 space-y-8">
            {/* name */}
            <div>
              <label htmlFor="name" className={label}>What should we call you?</label>
              <input
                id="name"
                value={profile.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Your name"
                className="mt-2 w-full border-b border-charcoal/20 bg-transparent py-2 font-serif text-2xl text-charcoal placeholder:text-muted/50 focus:border-terracotta focus:outline-none"
              />
            </div>

            {/* photo */}
            <div>
              <p className={label}>Face photo</p>
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-charcoal/25 bg-white/60 text-2xl text-muted transition hover:border-terracotta hover:text-terracotta"
                  aria-label="Upload a photo"
                >
                  {profile.photo ? <img src={profile.photo} alt="" className="h-full w-full object-cover" /> : '+'}
                </button>
                <div className="text-sm text-muted">
                  <p className="text-charcoal">{profile.photo ? 'Looking good.' : 'Upload a clear, front-facing photo.'}</p>
                  <p className="text-xs">It's used as your avatar's face. Full photo-to-avatar generation comes with the backend.</p>
                  {profile.photo && (
                    <button onClick={() => update({ photo: null })} className="mt-1 text-xs text-terracotta underline-offset-4 hover:underline">Remove photo</button>
                  )}
                  {photoError && <p className="mt-1 text-xs text-terracotta">{photoError}</p>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
              </div>
            </div>

            {/* height + weight sliders */}
            {(
              [
                { key: 'heightCm', name: 'Height', unit: 'cm', min: 140, max: 200 },
                { key: 'weightKg', name: 'Weight', unit: 'kg', min: 38, max: 130 },
              ] as const
            ).map((f) => (
              <div key={f.key}>
                <div className="flex items-baseline justify-between">
                  <label htmlFor={f.key} className={label}>{f.name}</label>
                  <span className="font-serif text-3xl text-charcoal">
                    {profile[f.key]}
                    <span className="ml-1 font-sans text-xs text-muted">{f.unit}</span>
                  </span>
                </div>
                <input
                  id={f.key}
                  type="range"
                  min={f.min}
                  max={f.max}
                  value={profile[f.key]}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    update(f.key === 'heightCm' ? { heightCm: v } : { weightKg: v })
                  }}
                  className="mt-2 w-full accent-terracotta"
                />
              </div>
            ))}

            {/* skin tone */}
            <div>
              <p className={label}>Skin tone</p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {SKIN_TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ skinTone: t })}
                    aria-label={`Skin tone ${t}`}
                    aria-pressed={profile.skinTone === t}
                    className={`h-9 w-9 rounded-full border-2 transition ${profile.skinTone === t ? 'scale-110 border-charcoal' : 'border-white hover:scale-105'}`}
                    style={{ background: t }}
                  />
                ))}
                <label className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-dashed border-charcoal/30 text-xs text-muted" title="Custom tone">
                  ✎
                  <input type="color" value={profile.skinTone} onChange={(e) => update({ skinTone: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  update({ created: true })
                  navigate('/studio')
                }}
                className="rounded-full bg-charcoal px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase text-cream transition hover:bg-terracotta"
              >
                Save & go to studio →
              </button>
            </div>
          </div>
        </section>

        {/* ── live preview ── */}
        <section className="relative flex min-h-[560px] items-center justify-center rounded-[32px] bg-gradient-to-b from-[#efe6d8] to-[#e2d4bf]">
          <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-[32px] bg-gradient-to-t from-[#d9c8b0]/60 to-transparent" />
          <AvatarFigure
            look={look}
            universe={profile.universe}
            skin={profile.skinTone}
            heightCm={profile.heightCm}
            weightKg={profile.weightKg}
            photo={profile.photo}
            walking
            className="relative h-[500px] w-[200px]"
          />
          <GlassCard label="Body profile" className="absolute right-4 top-6 w-44 md:right-8">
            <StatRow name="Height" value={profile.heightCm} unit="cm" />
            <StatRow name="Weight" value={profile.weightKg} unit="kg" />
          </GlassCard>
          <GlassCard label="Skin tone" className="absolute bottom-8 left-4 md:left-8">
            <div className="flex items-center gap-2">
              <span className="h-6 w-12 rounded-full border border-white" style={{ background: profile.skinTone }} />
              <span className="font-mono text-[11px] text-muted">{profile.skinTone}</span>
            </div>
          </GlassCard>
          <GlassCard label="Universe" className="absolute left-4 top-6 md:left-8">
            <p className="font-serif text-xl capitalize text-charcoal">{profile.universe}'s</p>
          </GlassCard>
          {profile.name && (
            <p className="absolute bottom-8 right-6 font-serif text-3xl italic text-charcoal/80">{profile.name}</p>
          )}
        </section>
      </main>
    </div>
  )
}
