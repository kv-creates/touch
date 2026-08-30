# TOUCH — An Experimental Interface

> An interactive experiment exploring touch, motion, physics and digital material.

**Live:** https://kv-creates.github.io/touch/

TOUCH treats interaction as a physical input rather than a navigation event. The website behaves like a living material — it deforms, ripples, remembers, and dissipates energy. Move slowly for soft displacement. Move fast for turbulence. Click for a pressure wave. Drag to leave a trace that decays.

---

## Features

- **Tactile surface** — full-viewport canvas with grid warp, particle field, pressure halo, and decaying trails
- **TOUCH MODE** — live instrumentation for **PRESSURE · VELOCITY · POSITION · ENERGY** (embedded, not a dashboard)
- **5 experiments:**
  - **01 RIPPLE** — radial pressure waves with exponential decay
  - **02 FIELD** — particle attraction field (inverse falloff, 140 px)
  - **03 MEMORY** — imprints that fade in ~4.5 s (half-life ~1.8 s)
  - **04 GRAVITY** — 12 bodies pulled by cursor (inverse-square, friction 0.985)
  - **05 TRACE** — velocity → stroke width, decay 0.995/frame
- **Custom cursor** — velocity stretch, contextual shape, blend-mode, disabled on touch
- **Sound (opt-in)** — Web Audio API, soft impulses on click, glide on fast movement, default OFF
- **Loading sequence** — `INITIALIZING SURFACE → CALIBRATING INPUT → LOADING PHYSICS → READY` (short, non-blocking)
- **Performance:** 60 FPS, rAF, DPR-aware (1.0–1.8), device-aware particle counts, no WebGL required (Canvas2D fallback)
- **Accessibility:** semantic HTML, keyboard navigation, focus rings, ARIA labels, `prefers-reduced-motion`

## Technology

| Category | Stack |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 6 (base `/touch/` for GitHub Pages) |
| Animation | Framer Motion (layout only) |
| Physics | Custom spring, friction, inverse-square (native JS) |
| Graphics | Canvas 2D · SVG · no Three.js |
| Audio | Web Audio API (opt-in) |
| Styling | CSS variables, no framework |
| Deployment | GitHub Pages + Actions |

Intentionally excluded: Three.js, GSAP, heavy UI libs, CSS-in-JS.

## Experiments

Each experiment is a single canvas + `requestAnimationFrame` loop. No React re-renders inside loops. Touch and PointerEvents are unified (`pointer*` + `touch*`), with passive listeners where possible.

- **RIPPLE** — `r += 2.6`, `a *= 0.982` — two concentric strokes + central glow
- **FIELD** — attraction `(0.22 - d)/0.22 * 0.0022` within 22% viewport, curl-noise drift, 42–72 particles
- **MEMORY** — radial gradient imprint, `a = 1 - age*0.22`, max 28 marks
- **GRAVITY** — `force = 0.00095 / (d² + 0.015)` — friction 0.985, wall damping 0.6
- **TRACE** — `w = clamp(10 - v*0.12, 1.1, 10)`, `a *= 0.995`, 520 segment cap

## How It Works

```
INPUT → MOTION → PHYSICS → RENDER → RESPONSE

INPUT:   PointerEvents / TouchEvents / DeviceOrientation → normalized (nx, ny), pressure
MOTION:  Δpos/Δt → velocity (smoothed 0.85), speed, acceleration, direction
PHYSICS: spring F=kx, friction 0.97–0.99, inverse-square attraction, wave propagation, exponential decay
RENDER:  Canvas2D, rAF, DPR-aware, clear → grid warp → particles → waves → halo, GPU transforms only
RESPONSE: light (radial gradient), deformation (grid warp ~9–18 px), sound (80–600 Hz sine)
```

See `src/sections/System.tsx` for annotated code.

## Installation

```bash
git clone https://github.com/kv-creates/touch.git
cd touch
npm install
```

## Development

```bash
npm run dev      # http://localhost:3000
npm run build    # tsc -b + vite build → dist/
npm run preview  # preview dist/
npm run lint     # oxlint
```

Requires Node 20+.

## Build

```bash
npm run build
```

Outputs to `dist/` with hashed assets, source maps, base `/touch/`.

## Deployment

**Automatic (GitHub Actions):** push to `main` → `npm ci` → `npm run build` → deploy `dist` via `actions/deploy-pages` to `gh-pages` → https://kv-creates.github.io/touch/

Workflow: `.github/workflows/deploy.yml`

**Manual:**

```bash
npm run deploy  # gh-pages -d dist
```

Vite `base` is `/touch/` in `vite.config.ts`. Change `REPO_URL` / `SITE_URL` in `src/config.ts` to retarget.

## Project Structure

```
touch/
├── public/
│   ├── favicon.svg
│   └── og.png (optional)
├── src/
│   ├── components/
│   │   ├── CustomCursor.tsx
│   │   ├── Instrumentation.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── Navigation.tsx
│   ├── sections/
│   │   ├── HeroTouch.tsx      # tactile surface (grid warp + particles + ripples + trail)
│   │   ├── Philosophy.tsx     # “interface as material”
│   │   ├── System.tsx         # INPUT→RESPONSE pipeline + code
│   │   └── Source.tsx         # repo, stack, install
│   ├── experiments/
│   │   ├── ExpRipple.tsx
│   │   ├── ExpField.tsx
│   │   ├── ExpMemory.tsx
│   │   ├── ExpGravity.tsx
│   │   └── ExpTrace.tsx
│   ├── hooks/
│   │   ├── useCursor.ts
│   │   ├── usePointer.ts      # pressure/velocity/position/energy
│   │   ├── useReducedMotion.ts
│   │   └── useSound.ts        # Web Audio opt-in
│   ├── utils/
│   │   └── math.ts            # lerp, clamp, spring, etc.
│   ├── styles/
│   │   ├── design-system.css
│   │   └── globals.css
│   ├── config.ts              # REPO_URL single source of truth
│   ├── App.tsx
│   └── main.tsx
├── .github/workflows/deploy.yml
├── vite.config.ts
└── index.html
```

## Performance

- Single canvas per interactive area, no React state in rAF loops (refs only)
- `requestAnimationFrame` with `dt` clamping, DPR capped at 1.6–2.0
- `will-change: transform` sparingly, GPU-accelerated transforms
- Mobile: fewer particles, coarser sampling, larger hit areas, `touch-action: none`
- `prefers-reduced-motion` → static grid, no particles, no animations

## Accessibility

- Semantic HTML (`main`, `section`, `nav`, `footer`), heading hierarchy
- Keyboard: Tab, Enter, Space, Escape, arrow handling where appropriate
- Focus: `focus-visible` rings (white 2px + bg offset), skip link
- ARIA: `aria-label`, `role="application"` on canvases, `aria-pressed` on toggles
- Contrast ≥ 4.5:1, touch targets ≥ 44 px, cursor disabled on touch devices
- `prefers-reduced-motion` disables non-essential animation
- No content hidden behind motion; fallback Canvas2D if WebGL unavailable (not required here)

## License

MIT — use freely. Attribution appreciated.

## Acknowledgments

- Fonts: Space Grotesk, JetBrains Mono, Inter (Google Fonts)
- Icons: Lucide React
- Motion primitives: Framer Motion (layout only)
- Physics ref: *Game Physics Engine Development* (Millington)
- Inspiration: Awwwards experiments, Brutalist Websites, Creative Applications
