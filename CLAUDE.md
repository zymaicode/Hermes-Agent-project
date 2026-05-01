# PCHelper (电脑工具) — Project Context

## Architecture
- Electron + React (Vite) desktop application
- Dark theme, AIDA64-style professional tool aesthetics
- Main process: Node.js (hardware data collection via WMI/LibreHardwareMonitor)
- Renderer: React with Vite
- IPC: contextBridge + ipcRenderer/ipcMain
- Database: SQLite (better-sqlite3)
- Build: electron-builder (NSIS installer + portable)

## Key Commands
- `npm run dev` — Start in development mode
- `npm run build` — Build for production
- `npm run lint` — Run ESLint
- `npm run test` — Run tests

## Code Standards
- TypeScript for all source files
- React functional components with hooks
- CSS Modules or styled-components for styling
- Dark theme as default (use CSS custom properties for theming)
- IPC channels named with namespace prefix: `pchelper:<channel>`
- React state management: Zustand (lightweight, no boilerplate)
- Chart library: Recharts (or ECharts if more complex visualizations needed)
- UI: custom dark theme components (no heavy library to keep bundle small)

## MVP Scope (Phase 1)
1. Hardware detection — CPU, Memory, Disk, GPU specs + live readings (1s refresh)
2. Software detection — Installed apps list + versions
3. Dashboard — Overview cards + drill-down detail pages, real-time refresh
4. AI Chat Panel — Sidebar chat panel, DeepSeek V4 Pro integration

## Phase 2 (after MVP)
- Conflict detection (install, residual files/registry, process conflicts)
- App management (uninstall)
- Software update detection
- AI auto-alert popups
- Health score

## Critical Rules
1. ⭐ **Model priority: DeepSeek V4 Pro FIRST — NEVER default to Flash for main tasks**
2. All env vars must be set before any terminal command (see setup)
3. Build only for Windows initially (electron-builder win config)
4. Hardware data must use both WMI/CIM AND LibreHardwareMonitor
5. Data refresh at 1-second intervals (like Task Manager)
6. Registry operations are READ-ONLY only — never modify registry
7. AI API compatible with OpenAI format; default endpoint is DeepSeek
8. User can customize AI model/endpoint in settings

## Directory Structure
```
pc-toolkit/
├── package.json
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── hardware/
│   ├── software/
│   └── database/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── HardwareView/
│   │   ├── SoftwareView/
│   │   ├── AIChatPanel/
│   │   ├── Sidebar/
│   │   └── common/
│   ├── hooks/
│   ├── stores/
│   ├── styles/
│   └── utils/
├── assets/
└── build/
```
