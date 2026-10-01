# Creo — Interactive Showcase Landing Page

> High-performance developer showcase for [Creo](https://github.com/tanmayythakare/creo), the multi-service workspace orchestrator for Windows Terminal (`wt.exe`).

[![Version](https://img.shields.io/badge/version-v0.4.0-8b5cf6.svg)](https://github.com/tanmayythakare/creo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero CORS](https://img.shields.io/badge/CORS-Zero%20Dependency-10b981.svg)](#)
[![Performance](https://img.shields.io/badge/Rendering-60%2F120fps-cyan.svg)](#)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-8b5cf6.svg)](https://d1dd4k2s3qs7qc.cloudfront.net)

---

## ✦ Key Architectural Features

- **Section 01: Cybernetic Radial Microservice Orchestration Matrix**
  - Multi-layer rotating cybernetic HUD rings with segmented luminous progress meters.
  - Deep obsidian glassmorphic core housing a luminous 3D isometric purple cube glyph with real-time `Healthy` telemetry.
  - 6 radial microservice HUD cards (`Frontend SPA :4200`, `Backend API :8080`, `Redis Cache :6379`, `Worker / Jobs Async DAG`, `PostgreSQL :5432`, `File Storage S3 Assets`) positioned in a calibrated 60° radial topology.
  - Vector circuit conduits carrying traveling glowing data packet energy pulses.
  - Interactive 3D mouse parallax depth, live animated sparkline waveforms, and real-time HUD telemetry linking.

- **Section 02: 3D Halftone Dither Monolith Wordmark (`C · R · E · O`)**
  - Extruded 3D geometric letterforms rendered through a custom Three.js WebGL Halftone post-processing shader.
  - Floating studio inertia with subtle individual letter bobbing.
  - **Easter Egg**: Type `creo` on your physical keyboard to trigger the terminal glitch dissolve sequence, transforming the 3D dither into the pure White ASCII edition.
  - **Viewport Culling**: Automatically halts Three.js render loops when off-screen to preserve 100% GPU fill rate for smooth scrolling.

- **Section 03–05: Bento Architecture & Declarative Configurator**
  - Interactive Windows Terminal multi-tab preview with real-time process output simulation.
  - Live `creo.yml` configuration generator conforming to the native Go schema (`schema.go`).
  - Pre-flight port sentinel and transactional PID management interactive diagrams.

- **Section 06: Interactive Terminal Simulator**
  - Full terminal emulator supporting direct keyboard command execution (`creo init`, `creo up`, `creo status`, `creo stop`, `creo drop`).
  - Chromatic disintegration reverse-dissolve animation for `creo drop`.
  - Conflict-free, cancellable auto-play demo walkthrough.

- **Luxury Smooth Inertial Scrolling Engine**
  - Powered by local [Lenis](lib/lenis.min.js) with exponential ease-out momentum damping.
  - Eliminates choppy Windows wheel notch stutter, delivering a seamless 60/120fps scrolling experience.
  - CSS `content-visibility: auto` paint containment skipping off-screen layouts until approached.

- **Mechanical Audio Synthesizer**
  - Pure Web Audio API procedural sound generation (mechanical switch clicks, laser surges, launch sweeps) with an animated 4-bar equalizer and mute toggle.

---

## 📁 Repository Structure

```
creo-intro/
├── assets/                     # Vector brand marks & isometric typography glyphs
│   ├── brand-glyph-solid.svg   # 3D isometric 'C' glyph (Neon Violet)
│   ├── brand-glyph-solid-white.svg
│   ├── creo-r.svg              # Refined 3D isometric 'R' with open counter
│   ├── creo-r-white.svg
│   ├── creo-e.svg              # 3D isometric 'E'
│   ├── creo-e-white.svg
│   ├── creo-o.svg              # Refined 3D isometric 'O' with clean counter
│   ├── creo-o-white.svg
│   └── favicon.svg
├── css/
│   └── index.css               # Design system & responsive styles
├── js/
│   ├── app.js                  # Central application controller & interactive demos
│   ├── orbital-engine.js       # Section 01 Cybernetic radial matrix engine
│   ├── dithered-object.js      # Section 02 Three.js Halftone shader engine
│   └── scene3d.js              # 3D spatial cyberspace utilities
├── lib/                        # Local vendor libraries (100% offline & CORS-free)
│   ├── lenis.min.js            # Smooth inertial scroll engine
│   ├── three.module.js         # Three.js 3D rendering core
│   ├── OrbitControls.js        # Three.js orbit controls
│   └── gsap.min.js             # GSAP animation library
├── previews/                   # Standalone sandbox prototypes
│   ├── logo-preview.html
│   ├── orbital-preview.html
│   └── decrypt-reveal.js
├── .github/workflows/
│   └── deploy.yml              # Automated AWS S3 + CloudFront CI/CD pipeline
├── index.html                  # Single-page application markup
├── error.html                  # Custom S3 404 error document
├── server.js                   # Lightweight zero-dependency Node.js HTTP server
├── start.bat                   # 1-click Windows launcher
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Double-click Launcher (Windows)
Simply double-click `start.bat`. It will start the local server and open `http://localhost:3000/` in your default browser.

### Option 2: Node.js Command Line
```bash
# Clone the repository
git clone https://github.com/tanmayythakare/creo-intro.git
cd creo-intro

# Start the local server
npm start
# or: node server.js
```
Then visit **`http://localhost:3000/`**.

---

## ⌨ Key Shortcuts & Easter Eggs

| Action | Shortcut / Trigger |
| :--- | :--- |
| **Command Palette** | `Ctrl + K` or `Cmd + K` |
| **White Edition Logo Easter Egg** | Type `c` `r` `e` `o` on your keyboard anywhere on the page |
| **Close Modal** | `Esc` |
| **Cycle Terminal Scenarios** | Click scenario tabs or type commands directly into the terminal input bar |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
