# Myrror frontend: how it fits together

Design references (Modulify templates): **Boutique** for the landing hero and look card, **Oriel** for the floating stat cards, and **Hangline** for the clothing rack.

## Pages

| Route       | File                     | What it does                                                     |
|-------------|--------------------------|------------------------------------------------------------------|
| `/`         | `pages/Landing.tsx`      | Hero with avatar stepping out of a crowd, cycling demo looks     |
| `/avatar`   | `pages/AvatarSetup.tsx`  | Photo, height, weight, skin tone; avatar updates live            |
| `/studio`   | `pages/Studio.tsx`       | Rack → try on → score → "Ask Myrror" chat                        |
| `/login` `/register` `/wardrobe` | (unchanged)  | Your existing auth + wardrobe CRUD                       |

## The data flow (read this first)

```
FastAPI /wardrobe  →  fromApi()  →  Garment[]  →  <Rack>
                                                     │ click
                                                     ▼
                                   wear(look, garment)  →  Look
                                                     │
                       ┌─────────────────────────────┼─────────────────────┐
                       ▼                             ▼                     ▼
                <AvatarFigure look>          <LookCard look>       <StylistChat look>
```

- **`lib/garments.ts`**: `slotFor()` guesses where an item goes from its category text ("Jeans" → bottom). `wear()` applies real-life rules (a dress replaces top + bottom; clicking what you're wearing takes it off).
- **`lib/stylist.ts`**: the outfit check. Converts colours to HSL and applies colour-wheel rules (one accent + neutrals = safe; clashing hues = swap one). `askStylist()` is async on purpose: later you replace its body with a `fetch()` to a FastAPI endpoint that calls an LLM, and nothing else changes.
- **`context/ProfileContext.tsx`**: avatar profile (photo, height, weight, skin tone, Women/Men universe), saved to localStorage. Same pattern as your `AuthContext`.
- **`components/AvatarFigure.tsx`**: the avatar is SVG shapes, so clothes are just coloured shapes. Height/weight change its proportions. When you have real photo-to-avatar generation, this is the component you swap.

## Animations (no extra libraries)

All keyframes live in `src/index.css` (`stepOut`, `pop`, `rise`, `marquee`, `sway`, `swing`) and are used from JSX like `className="animate-[stepOut_900ms_ease]"`. Colour changes on the avatar use plain CSS `transition: fill`.

React tip that matters here: inside `AvatarFigure`, the arms and legs are drawn by plain functions (`leg()`, `arm()`), not nested components. A component defined inside another component is a *new type* every render, so React would rebuild its DOM and the colour transitions would never play.

## Things to try next (good for learning)

1. Add a `POST /stylist` route in FastAPI and call it from `askStylist()`.
2. Add `size` / `image_url` columns to the wardrobe model and show real photos on the rack.
3. Save the profile to the backend (`/profile`) instead of localStorage.
4. Add an "occasion" picker in the studio that feeds into the score.
