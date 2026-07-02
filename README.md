# 🏆 WebGPU Portfolio — `nwfella`

**Raw WebGPU + WGSL compute shader engine.** No Three.js. No Babylon.js. No frameworks.

[![WebGPU](https://img.shields.io/badge/WebGPU-✓-6c5ce7?logo=webgpu)](https://webgpu.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-f39c12?logo=github)](https://nwfella.github.io/webgpu-portfolio/)

> **Live**: [nwfella.github.io/webgpu-portfolio](https://nwfella.github.io/webgpu-portfolio/)

---

## ✨ Features

| Feature | Technique | Lines |
|---------|-----------|-------|
| **65K Particle System** | Compute-shader simulation (position, velocity, aging) | ~200 WGSL |
| **Bloom Post-Processing** | Multi-pass: bright extract → separable gaussian blur → compose | ~150 WGSL |
| **Procedural Sky** | Fractal Brownian Motion nebula in fragment shader | ~80 WGSL |
| **PBR-ish Objects** | Per-object materials with Fresnel, rim lighting, emission | ~120 WGSL |
| **Orbital Camera** | Spherical coordinates, smooth interpolation, animated transitions | ~200 TS |
| **GPU Picking** | Object ID rendering to offscreen texture | ~50 TS |
| **Noise Dissolve** | Compute-based scene transitions | ~60 WGSL |
| **Graceful Fallback** | Static HTML/CSS portfolio when WebGPU unavailable | ~120 TS |

## 🧠 Architecture

```
webgpu-portfolio/
├── src/
│   ├── core/           # Engine: device, camera, input, timer, math lib
│   ├── render/         # Rendering: pipelines, geometry, shader sources, HDR
│   ├── compute/        # GPGPU: particle simulation (compute shaders)
│   ├── shaders/        # 10 WGSL shader files (sim, render, bloom, sky, dissolve...)
│   ├── portfolio/      # Portfolio data: projects, skills, profile
│   ├── ui/             # HUD overlay, loading screen
│   └── fallback/       # Static HTML fallback when WebGPU unavailable
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## 🚀 Quick Start

```bash
git clone https://github.com/nwfella/webgpu-portfolio.git
cd webgpu-portfolio
npm install
npm run dev      # local dev server with HMR
npm run build    # production build → dist/
npm run deploy   # deploy to GitHub Pages
```

## 🧪 Requirements

- **Browser**: Chrome 113+, Edge 113+, or any browser with WebGPU support
- **GPU**: Any GPU with Vulkan/Metal/D3D12 support (integrated works, discrete recommended)
- **Fallback**: Works on any browser as a clean static portfolio

## 🎨 The 4 "Rooms"

1. **Asteroid Field** — Hero name rendered as particle swarm with auto-orbit camera
2. **Project Gallery** — 6 unique geometric sculptures (sphere, torus, torus knot) with per-object materials
3. **Skill Constellation** — Connected-node graph with pulsing nodes
4. **Contact** — Particle convergence revealing contact info

## 🛠️ Tech Stack

- **WebGPU API** — Direct GPU access, no abstraction layers
- **WGSL** — GPU shader language (compute + vertex + fragment)
- **TypeScript** — Full type safety for GPU pipeline descriptors
- **Vite** — Sub-second HMR, `?raw` imports for WGSL bundling, GH Pages deploy

## 📦 Bundle Size

- `index.html`: 4 KB
- `bundle.js`: 42.5 KB (13 KB gzipped)
- **Zero runtime dependencies** — only Vite + TypeScript as build tools

## 📄 License

MIT — do whatever you want. If you build something cool with it, I'd love to see it.

---

*Built with [Hermes Agent](https://hermes-agent.nousresearch.com) — an AI assistant by Nous Research.*
