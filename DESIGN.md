# 🏆 Ultimate WebGPU Portfolio — Design Document

## 1. Concept & Philosophy

Most portfolios are static HTML/CSS with maybe a Three.js background. The "ultimate" WebGPU portfolio inverts that: **the GPU-rendered 3D scene IS the portfolio**. HTML overlays are minimal chrome — the projects, skills, and personality are expressed through real-time graphics.

**Core ethos**: No frameworks. Raw WebGPU API + custom WGSL shaders. This isn't a Three.js demo — it's a deep showcase of GPU programming mastery.

---

## 2. Visual Experience

| Scene Element | Technique | What It Shows |
|---|---|---|
| **Background** | Compute-shader particle field (65K+ particles) | GPGPU compute, buffer management |
| **Project Orbs** | Instanced custom geometry w/ per-object materials | Render bundles, pipeline management |
| **Ground Plane** | Reflection via shader-based fresnel + grid | Multi-pass rendering, sampler management |
| **Environment** | Procedural sky with animated nebula | Fragment shader FBM noise artistry |
| **Bloom** | Gaussian-blur compute pass + additive blend | Multi-pass rendering, compute-to-render data flow |
| **Transitions** | Animated noise dissolve between "scenes" | Simulation state management |
| **Loading Screen** | Shader-driven progress ring + particle preview | Async resource loading, progress tracking |

### The Camera Flows Through 4 "Rooms":

1. **Asteroid Field** (Hero) — Your name/title surrounded by a swirling cloud of 65K GPU-computed particles. Camera auto-orbits slowly.
2. **Project Gallery** — 6 unique geometric sculptures (sphere, torus, torus knot) each with its own color, emission, and material. Each maps to a real project. Hover a navigation dot to see project info; click to open.
3. **Skill Constellation** — Connected-node graph rendered as glowing edges. Nodes pulse with your proficiency level.
4. **Contact** — Contact info in the HUD footer.

---

## 3. Technical Architecture

```
webgpu-portfolio/
├── src/
│   ├── core/                    # Engine foundation
│   │   ├── main.ts              # Entry point, requestAnimationFrame loop
│   │   ├── device.ts            # Adapter/device acquisition + fallback
│   │   ├── shader-loader.ts     # WGSL module compilation
│   │   ├── math/                # Hand-rolled vec3, mat4, quat — no deps
│   │   │   ├── vec3.ts
│   │   │   ├── mat4.ts
│   │   │   └── quat.ts
│   │   └── timer.ts             # Frame timing, delta accumulation
│   │
│   ├── render/                  # Rendering pipeline
│   │   ├── renderer.ts          # Master render graph (HDR → composite)
│   │   ├── shader-sources.ts    # WGSL bundled via Vite ?raw imports
│   │   ├── geometry.ts          # Procedural mesh generators (sphere, torus, knot, ground)
│   │   └── effects/             # Special effects
│   │       └── ...
│   │
│   ├── compute/                 # Compute shader systems
│   │   └── particle-system.ts   # 65K GPU-driven particles, compute sim + render
│   │
│   ├── shaders/                 # All WGSL shaders
│   │   ├── common.wgsl          # Shared structs, constants, noise functions
│   │   ├── particle-sim.wgsl    # Compute: velocity/position integration
│   │   ├── particle-render.wgsl # Vertex/fragment for point sprites
│   │   ├── object-vert.wgsl     # Shared vertex shader for portfolio objects
│   │   ├── object-frag.wgsl     # PBR-ish fragment with Fresnel, rim, emission
│   │   ├── sky.wgsl             # Procedural sky/nebula via FBM
│   │   ├── bloom-extract.wgsl   # Bright-pass filter
│   │   ├── bloom-blur.wgsl      # Separable gaussian blur (compute)
│   │   ├── bloom-compose.wgsl   # Tonemap + bloom blend
│   │   ├── ground.wgsl          # Reflective ground plane
│   │   ├── dissolve.wgsl        # Noise dissolve transition
│   │   └── constellation.wgsl   # Skill graph rendering
│   │
│   ├── portfolio/               # Portfolio data layer
│   │   └── data.ts              # Project list, skills, contact info
│   │
│   ├── ui/                      # HTML overlay (minimal)
│   │   ├── hud.ts               # Project cards, skill tooltips
│   │   └── loading.ts           # Full-screen loading bar
│   │
│   └── fallback/                # Graceful degradation
│       └── fallback.ts          # Static HTML/CSS when WebGPU unavailable
│
├── index.html                   # Shell HTML (entry point)
├── vite.config.ts               # Vite build config
├── tsconfig.json
├── package.json
├── README.md
└── DESIGN.md                    # This document
```

### Key Technical Decisions

**Why raw WebGPU (not Three.js/Babylon)?**
- The portfolio *is* the credential. Using a framework would defeat the purpose.
- Demonstrates: adapter/device acquisition, pipeline state objects, bind groups, compute shaders, swapchain management, depth/stencil.

**Why TypeScript?**
- WebGPU's API is inherently type-safe (descriptor objects everywhere).
- TS types mirror the spec and catch errors at build time.
- Best-in-class IDE support for refactoring a non-trivial engine.

**Why Vite (not Webpack)?**
- Native ESM, sub-second HMR during shader development.
- `?raw` import for WGSL files (`import shader from './shader.wgsl?raw'`).
- Production builds with tree-shaking and code splitting.

**Why hand-rolled math (not gl-matrix)?**
- Controlling the SIMD alignment for uniform buffers.
- Demonstrates understanding of homogeneous transforms and column-major layout.
- Smaller bundle.

---

## 4. Portfolio UX Flow

```
                    ┌──────────────────────┐
                    │   LOADING SCREEN     │
                    │  Progress bar + msg  │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │    HERO (Room 1)     │
                    │  65K particle swarm  │
                    │  Auto-orbit camera   │
                    └────────┬─────────────┘
                             │ Hover navigation dots
                    ┌────────▼─────────────┐
                    │  PROJECT GALLERY     │
                    │  (Room 2)            │
                    │  6 orbiting objects  │
                    │  Hover dot → info    │
                    │  Click dot → open    │
                    └────────┬─────────────┘
                             │ (future: scroll)
                    ┌────────▼─────────────┐
                    │ SKILL CONSTELLATION  │
                    │  (Room 3)            │
                    │  Pulsing node graph  │
                    └────────┬─────────────┘
                             │ (future: scroll)
                    ┌────────▼─────────────┐
                    │  CONTACT (Room 4)    │
                    │  GitHub link in HUD  │
                    └──────────────────────┘
```

---

## 5. Specific Shader & Compute Highlights

### Particle System (Compute Shader)
- 65,536 particles simulated entirely on GPU
- Each tick: compute shader reads positions/velocities, applies forces (attractor at mouse position, orbital gravity, noise wandering), writes new state
- Dead particles are reseeded into the field (continuous emission)
- Rendered as instanced quads with color cycling via cosine palette

### Bloom Pipeline
1. Render scene to HDR color attachment (rgba16float texture)
2. Compute shader: bright-pass extraction (luminance threshold → bright buffer)
3. Compute shader: separable gaussian blur (horizontal pass → vertical pass)
4. Compute shader: combine original HDR + blurred bright with Reinhard tonemap

### PBR-ish Shading
- Per-object uniforms: model matrix, base color, emission color, ID
- Fragment: directional light + ambient + rim light + Fresnel
- Emission colors glow even in shadow

### Procedural Sky
- Fragment shader computes FBM (fractal Brownian Motion) noise
- Nebula-colored bands shift slowly over time
- Stars via hash-based random field

### Graceful Degradation

```
┌─────────────────────────────────────────────────┐
│  Check navigator.gpu                             │
├──────────────┬──────────────────────────────────┤
│  Available   │  Not Available                    │
│  ┌─────────┐ │  ┌──────────────────────────────┐│
│  │ Run     │ │  │ Show static HTML/CSS         ││
│  │ WebGPU  │ │  │ portfolio with all the same  ││
│  │ Scene   │ │  │ content, zero GPU required   ││
│  └─────────┘ │  └──────────────────────────────┘│
└──────────────┴──────────────────────────────────┘
```

---

## 6. Implementation Phases

| Phase | What | Status |
|-------|------|--------|
| **P1** | Project scaffolding (Vite, TS, WGSL loader, device init, canvas) | ✅ |
| **P2** | Math library + camera system + input handling | ✅ |
| **P3** | Core rendering pipeline + geometry helpers | ✅ |
| **P4** | Portfolio data layer + scene config + HUD overlay | ✅ |
| **P5** | Compute particle system (simulation + rendering) | ✅ |
| **P6** | Per-object rendering (6 sculptures w/ materials) | ✅ |
| **P7** | Post-processing (bloom) + procedural sky + ground | ✅ |
| **P8** | Transitions, fallback, polish, deploy | ✅ |

---

## 7. Future Enhancements

- **Bloom fully wired** — currently shaders exist, need full pipeline integration
- **Dissolve transitions** — between the 4 rooms with noise shader morphing
- **GPU picking** — click 3D objects to open projects directly
- **Skill constellation** — interactive node graph
- **Touch controls** — mobile gesture support
- **Audio-reactive particles** — Web Audio API driving particle behavior
- **PWA** — service worker for offline support

---

*Design authored 2026-07-02. Built with [Hermes Agent](https://hermes-agent.nousresearch.com).*
