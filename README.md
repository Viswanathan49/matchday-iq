# MatchDay IQ 🏟️

**AI-Powered Smart Stadium Operations Platform for FIFA World Cup 2026™**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://matchday-iq-ai.vercel.app/)
[![Tests](https://img.shields.io/badge/Tests-105%20Passing-brightgreen?style=for-the-badge)](https://github.com/Viswanathan49/matchday-iq)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen?style=for-the-badge)](https://github.com/Viswanathan49/matchday-iq)
[![Security](https://img.shields.io/badge/Security-CSP%20%2B%20DOMPurify-orange?style=for-the-badge)](https://github.com/Viswanathan49/matchday-iq)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-purple?style=for-the-badge)](https://matchday-iq-ai.vercel.app/)

---

## Problem Statement

FIFA World Cup 2026 stadiums will host **80,000+ fans per match** across 16 cities in the USA, Canada, and Mexico. Stadium operations teams face critical, unresolved pain points at this scale:

1. **Safety incidents** (spills, medical emergencies, security threats) are reported slowly via radio, causing dangerous multi-minute response delays.
2. **Fans with disabilities** (wheelchair users, low-vision, hearing-impaired) have no real-time, context-aware wayfinding — they rely on static signs and manual staff guidance.
3. **Non-English-speaking fans** (Spanish, Arabic, French, Portuguese speakers attending from 32 nations) cannot effectively communicate needs to local staff.
4. **Staff situational awareness** is fragmented — there is no unified, real-time view of incidents across the entire venue.
5. **Crowd congestion** at key chokepoints (concessions, gates) leads to unsafe conditions and poor fan experience during peak ingress/egress.

---

## Solution: MatchDay IQ

MatchDay IQ is a **Progressive Web App (PWA)** — no app store installation required — that solves all five problems via two interconnected AI-powered portals.

### 🏟️ Fan Portal — Direct Problem Mapping

| Fan Need | MatchDay IQ Feature | Technical Implementation |
|----------|--------------------|-----------------------|
| Language barrier | **Multilingual AI Concierge** in 5 languages (EN/ES/FR/PT/AR) | `language` param routed to AI; RTL layout for Arabic |
| Navigation difficulty | **Smart Crowd Routing** with accessibility modes | ARIA `radiogroup` SVG map; wheelchair/low-vision/deaf constraints passed to routing engine |
| Incident reporting delay | **Chatbot Auto-Incident Detection** | Regex intercepts `[INCIDENT:type:location]` tags; writes to shared localStorage bus |
| Mobility barriers | **Step-free & Accessible Routes** | `stepFree` flag in route API; visual badge in UI |
| Poor connectivity | **PWA Offline Mode** | Service Worker + intelligent fallback engine (no console errors) |

### 🛡️ Staff Portal — Direct Problem Mapping

| Staff Need | MatchDay IQ Feature | Technical Implementation |
|------------|--------------------|-----------------------|
| Slow incident awareness | **Live Incident Feed** with source tagging | 10s `setInterval` polling localStorage; "via AI" badge for chatbot-detected incidents |
| No unified incident view | **Operations Command Center** | All fan-submitted incidents (form + chatbot) converge in one dashboard |
| Manual status tracking | **One-Click Resolve** with audit trail | `resolvedAt` timestamp written back to localStorage on resolution |
| Crowd distribution visibility | **Zone Density Heatmap** | 7-zone color-coded density bars; `useMemo` for efficient average calculations |

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         MatchDay IQ PWA                            │
│   React 19 + Vite 8 + Tailwind CSS v4 + Vite PWA (Service Worker) │
├────────────────────────────┬───────────────────────────────────────┤
│       Fan Portal           │            Staff Portal               │
│  ┌──────────────────────┐  │  ┌──────────────────────────────────┐ │
│  │ AI Chatbot           │  │  │ Operations Command Center        │ │
│  │ • DOMPurify XSS      │  │  │ • useCallback/useEffect polling  │ │
│  │ • STORAGE_KEY const  │  │  │ • resolvedAt audit trail         │ │
│  │ • INCIDENT intercept │  │  │ • ARIA live region badge         │ │
│  ├──────────────────────┤  │  ├──────────────────────────────────┤ │
│  │ Smart Crowd Routing  │  │  │ Density Heatmap Dashboard        │ │
│  │ • ARIA radiogroup    │  │  │ • useMemo average calculation    │ │
│  │ • Keyboard nav       │  │  │ • role="status" loading spinner  │ │
│  │ • Wheelchair support │  │  └──────────────────────────────────┘ │
│  ├──────────────────────┤  │                                       │
│  │ Incident Form        │  │  Shared localStorage message bus      │
│  │ • ALLOWED_TYPES list │◄─┼───────────────────────────────────────┤
│  │ • try/catch I/O      │  │  (no backend required in production)  │
│  └──────────────────────┘  │                                       │
└────────────────────────────┴───────────────────────────────────────┘
```

### Key Design Decisions

- **Zero `console.*` in production** — All error handling uses silent fallbacks. No internal state or stack traces are ever exposed to production browser consoles.
- **Shared constants module** — All magic strings (`STORAGE_KEY_*`, `ALLOWED_INCIDENT_TYPES`, `DENSITY_THRESHOLDS`) live in `src/constants/index.js`. No string duplication across components.
- **No backend required in production** — The app uses localStorage as a shared PWA bus between Fan and Staff portals. `aiService.js` detects non-localhost environments and routes directly to the keyword-intelligence fallback engine without attempting a doomed fetch.
- **Security-first** — HTML rendered in chat is sanitized via DOMPurify. Incident types validated against `ALLOWED_INCIDENT_TYPES` allowlist. localStorage reads wrapped in `try/catch`. CSP meta tag enforced in `index.html`.
- **Full Accessibility (WCAG 2.1 AA)** — SVG map is a proper ARIA `radiogroup` with `role="radio"`, `aria-checked`, and full Arrow key / Enter / Space keyboard navigation. Loading spinners have `role="status"`. Incident badge uses `aria-live="polite"` + `aria-atomic="true"`. All interactive elements have descriptive `aria-label`.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests with coverage report
npm run test
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | v4 |
| Security | DOMPurify (XSS sanitization) | 3.x |
| Accessibility | ARIA roles, keyboard nav, axe-core dev | WCAG 2.1 AA |
| Testing | Vitest + React Testing Library | 4.x |
| PWA | Vite PWA Plugin + Workbox Service Workers | 1.x |
| Deployment | Vercel Edge Network | — |

---

## Test Coverage

```
 Test Files  9 suites passed
      Tests  105 passed (0 failed)

 Coverage Report:
─────────────────────────────────────────────
 File                │ Stmts  │ Branch │ Lines
─────────────────────────────────────────────
 Chatbot.jsx         │  97%   │  91%   │  98%
 CrowdRouting.jsx    │  97%   │  94%   │ 100%
 Dashboard.jsx       │ 100%   │  83%   │ 100%
 FanPortal.jsx       │  93%   │  88%   │  93%
 IncidentForm.jsx    │  82%   │  92%   │  84%
 StadiumMap.jsx      │  94%   │  86%   │  94%
 StaffPortal.jsx     │  97%   │  80%   │  96%
 constants/index.js  │ 100%   │ 100%   │ 100%
 aiService.js        │  95%   │  88%   │ 100%
─────────────────────────────────────────────
 All files           │  95%   │  88%   │  96%
─────────────────────────────────────────────
```

---

## Live Demo

🔗 **[https://matchday-iq-ai.vercel.app/](https://matchday-iq-ai.vercel.app/)**

**Test Scenarios to try:**

1. Select the **Spain vs. Argentina Final** → Enter Fan Portal
2. In the AI chat, type **"Where can I get food?"** → Watch it auto-route to the Smart Routing tab with Food Court pre-selected
3. Type **"There's a spill near Gate B"** → AI auto-creates an incident report (no form needed)
4. Switch to **Staff Portal** → See the incident appear in real-time with the "via AI" badge
5. Click **Mark Resolved** → Incident disappears, `resolvedAt` timestamp is stored
6. Go to **Smart Routing** → Check **"Wheelchair / step-free"** → Notice the Step-free badge in the route result
7. Change the language to **Arabic (العربية)** → UI goes RTL, send button shows إرسال

---

*Built for the FIFA World Cup 2026™ Smart Stadiums Initiative.*
