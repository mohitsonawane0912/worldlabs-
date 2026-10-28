# World Lab — 3D Sandbox Simulation Game

**World Lab** is a polished, front-end-only 3D sandbox simulation game built with **Vue 3, Vite, TypeScript, and Three.js**. It runs entirely in the browser without any backend, databases, or API keys, and is deployable to Vercel or any static host.

> **Educational Simulation Disclaimer**: Results are based on a simplified interactive game model to explore systemic what-if chain reactions, not scientifically exact forecasts or real-world safety advice.

---

## 🌍 Features & 3D Scenes

1. **Mini Earth** — Rotating stylized planet with realistic atmospheric glow, dynamic cloud layers, continental shifting, night-side city lights, and orbiting space station.
2. **Forest Valley** — Rolling river valley with multi-tier procedural trees, flowing river, wildlife indicators, observation tower, and drought/precipitation transitions.
3. **Future City** — Futuristic metropolis with multi-part skyscrapers, aerial traffic lanes, wind turbines, solar infrastructure, and pollution smog feedback.
4. **Ocean World** — Translucent oceanic surface with depth contours, polar ice caps that melt or expand with temperature, coral reefs that bleach under stress, and schooling fish.
5. **Mars Colony** — Red cratered Martian terrain with geodesic biodomes, pressurized transit tunnels, solar farm arrays, exploration rover, and terraforming progression.

---

## ⚙️ Simulation Variables & Feedback Loops

- **Atmospheric Oxygen (0% - 100%)**: Critical hypoxia below 15% clouds sky visibility, dampens ecosystem activity, and lowers wellbeing.
- **Surface Temperature (-50°C to +70°C)**: Drives glacial freezing, ocean evaporation, and polar ice melting.
- **Annual Precipitation (0% - 100%)**: Regulates water security and river volume.
- **Sea Level Relative (-50m to +50m)**: Dynamically floods or exposes coastal shelves.
- **Surface Gravity (1.0 to 25.0 m/s²)**: Mars (3.7), Earth (9.8), Jupiter (24.8).
- **Particulate Pollution (0% - 100%)**: Visual haze and respiratory stress.
- **Primary Energy Source**:
  - *Renewable*: Actively reduces air pollution over time.
  - *Fossil*: Emits particulate smog and drives gradual greenhouse warming.
  - *Mixed*: Balanced transition state.
- **Crisis & Disaster Toggles**:
  - *Drought*, *Heavy Rain*, *Heat Wave*, *Meteor Shower*, *Solar Flare*.
- **Scenario Library**: Curated presets (*Healthy Earth*, *Climate Stress*, *Flooded Coast*, *Clean Energy Future*, *Low Oxygen Test*, *Mars Dust Storm*) plus browser `localStorage` bookmarking.
- **Achievements System**: Unlock badges like *Balanced Planet*, *Green City*, *Ocean Guardian*, and *Mars Pioneer*.

---

## 🎮 Controls & Shortcuts

| Key / Action | Function |
| :--- | :--- |
| **Mouse Left Drag** | Orbit and rotate 3D camera |
| **Mouse Scroll** | Zoom in / out |
| **Space** | Pause / Resume simulation |
| **1 / 2 / 3 / 4** | Simulation Speed (Pause, 1x, 5x, 20x) |
| **H** | Toggle HUD (Cinema / Zen Mode) |
| **R** | Reset parameters to scene equilibrium |
| **M** | Toggle procedural audio synthesis |
| **?** | Open Help and Guide modal |

---

## 🚀 Setup & Local Run

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The app will run locally at `http://localhost:3000`.

### Building for Production
```bash
npm run build
```
This compiles the TypeScript files and bundles static assets into the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**. Since World Lab is 100% client-side with zero environment variables or backend dependencies, it will deploy in seconds!
