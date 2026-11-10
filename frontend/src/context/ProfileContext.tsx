// ─────────────────────────────────────────────────────────────
// The avatar profile: photo, height, weight, skin tone and which
// Style Universe (women's / men's) the user is in.
//
// Same pattern as your AuthContext: state in a Provider, saved to
// localStorage so a refresh doesn't wipe it. When the backend gets
// a /profile endpoint, the save() call is the only thing to change.
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Universe = 'women' | 'men'

export interface Profile {
  name: string
  photo: string | null // data URL from the uploaded image
  heightCm: number
  weightKg: number
  skinTone: string // hex
  universe: Universe
  created: boolean // has the user finished avatar setup?
}

export const SKIN_TONES = ['#f3d6c1', '#e8bf9f', '#d6a07a', '#bd8460', '#9a6444', '#6f4630', '#4a2e20']

const DEFAULT_PROFILE: Profile = {
  name: '',
  photo: null,
  heightCm: 163,
  weightKg: 56,
  skinTone: '#d6a07a',
  universe: 'women',
  created: false,
}

const KEY = 'myrror_profile'

function load(): Profile {
  // localStorage can throw in private mode, so always guard it
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

interface ProfileContextType {
  profile: Profile
  update: (changes: Partial<Profile>) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile))
    } catch {
      // Photos can exceed the ~5MB quota. The app still works, it just won't persist.
    }
  }, [profile])

  function update(changes: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...changes }))
  }

  return <ProfileContext.Provider value={{ profile, update }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
