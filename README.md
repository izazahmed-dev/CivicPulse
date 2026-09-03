# CivicPulse — Civic Intelligence Platform

> **AI-powered civic reporting for Water, Roads, Electricity & Sanitation — with multilingual voice input, bounty verification, and predictive forecasting.**

---

## Problem Statement

Citizens in India lack a unified, accessible platform to report civic issues like water outages, broken roads, power failures, and sanitation problems. Rural communities are especially underserved, and existing systems are language-limited and inaccessible.

**CivicPulse** empowers citizens to report issues in **11 Indian languages** via text or **voice input**, tracks complaints in real-time, and provides AI-powered analytics for governance bodies.

---

## Features

| Feature | Description |
|---|---|
| **Multi-Category Reporting** | Report issues across Water, Roads, Electricity, and Sanitation |
| **Voice Input** | Speak your complaint using Web Speech API + Sarvam AI STT — supports Hindi, Tamil, Telugu, Bengali & 7 more |
| **AI Voice Complaint** | Full voice-to-complaint pipeline with Gemini-powered extraction |
| **11-Language Support** | Full UI translations in English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia |
| **Authority Dashboard** | Kanban-style triage board with AI diagnosis for municipal authorities |
| **Bounty System** | Citizens can claim and verify civic issues with photo proof + AI verification |
| **Water Supply Forecast** | Predictive area-level forecasting with AI intelligence from news and dam bulletins |
| **Real-Time Tracking** | Pizza-tracker style complaint status with live map |
| **Community Forum** | Post, reply, upvote civic issues with trending areas |
| **Leaderboard** | Area rankings by liters saved, issues resolved, with collectible badges |
| **Analytics Dashboard** | Donut charts, sparklines, top areas, 7-day trends |
| **AI Chatbot** | Gemini-powered civic assistant for instant help |
| **IVR Phone Helpline** | Twilio-powered voice menu for phone-based complaint submission |
| **Dark/Light Theme** | Premium dark-first design with smooth theme transitions |
| **Page Transitions** | Route-aware Framer Motion animations (slide, zoom, morph, liquid wipe) |
| **Scroll Progress** | Visual scroll indicator across all pages |
| **Toast Notifications** | Elegant notification system replacing browser alerts |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 16)                      │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │  Report   │ │Dashboard │ │ Authority │ │    Community      │ │
│  │  Page     │ │  + Map   │ │  Kanban   │ │     Forum        │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │ Forecast │ │ Bounties │ │Leaderboard│ │    Analytics      │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Shared: Navbar, ChatBot, Toast, PageTransition,         │  │
│  │  ScrollProgress, BackToTop, VoiceInput, LocationPicker   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Context: ThemeContext, LanguageContext (11 langs),       │  │
│  │  AuthContext, ChatContext, ToastProvider                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                           │
                     API Routes (19)
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
/api/complaints    /api/analytics     /api/chat
/api/bounties      /api/forecast      /api/water-intel
/api/community     /api/leaderboard   /api/voice-complaint
/api/ivr-webhook   /api/places-search /api/user/points
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        MongoDB Atlas  Gemini API  Sarvam AI
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **Animations** | Framer Motion |
| **Maps** | Leaflet.js + React Leaflet |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API (chat, voice, verification, intel) |
| **Voice** | Web Speech API + Sarvam AI STT |
| **IVR** | Twilio |
| **ML Backend** | Python FastAPI + scikit-learn (predictive forecasting) |
| **i18n** | Custom context + 11-language translation file |

---

## Design

Inspired by [landonorris.com](https://landonorris.com) — the app features:

- **Deep black backgrounds** (#050505) with neon accent (#c8ff00)
- **Bold typography** with tight tracking and uppercase labels
- **Smooth scroll-driven animations** on the landing page
- **Glassmorphism** cards and navigation
- **3D tilt cards** with parallax on feature grid
- **Route-aware page transitions** (slide, zoom, morph, liquid wipe)
- **Scroll progress indicator** and back-to-top button
- **Premium noise texture** overlay
- **Consistent dark-first aesthetic** across all 12+ pages

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string
- Google Gemini API key

### Setup

```bash
git clone https://github.com/your-repo/civicpulse.git
cd civicpulse

npm install

cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://your-connection-string
GEMINI_API_KEY=your-gemini-api-key
JINA_API_KEY=your-jina-key           # Optional: for water-intel search
TWILIO_ACCOUNT_SID=your-twilio-sid   # Optional: for IVR
TWILIO_AUTH_TOKEN=your-twilio-token  # Optional: for IVR
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Python Predict API (Optional)

```bash
cd predict-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/complaints` | Submit a new complaint |
| `GET` | `/api/complaints` | List all complaints |
| `GET/PATCH` | `/api/complaints/[id]` | Get/update a specific complaint |
| `GET` | `/api/analytics` | Aggregated stats by category, area, trend |
| `POST` | `/api/chat` | AI chatbot interaction (Gemini) |
| `GET` | `/api/forecast` | Area-level forecasts from complaint data |
| `GET` | `/api/water-intel` | AI-powered water supply predictions |
| `GET/POST` | `/api/community` | Community forum posts |
| `GET` | `/api/bounties` | List open civic bounties |
| `POST` | `/api/bounties/[id]/claim` | Claim a bounty |
| `POST` | `/api/bounties/[id]/verify` | AI-verify bounty proof |
| `GET` | `/api/leaderboard` | Area rankings and badges |
| `POST` | `/api/voice-complaint` | Voice transcription + extraction |
| `POST` | `/api/ivr-webhook` | Twilio IVR entry point |
| `GET` | `/api/places-search` | Location autocomplete |

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Scroll-driven landing with canvas animation and editorial narrative |
| `/report` | Multi-category complaint form with voice input and map |
| `/dashboard` | Heatmap + complaint list with area drill-down |
| `/community` | Twitter-style civic forum with posts, replies, upvotes |
| `/authority` | Kanban triage board + live hazard map for authorities |
| `/analytics` | Donut charts, sparklines, top areas dashboard |
| `/forecast` | Area-level water supply predictions with AI intel |
| `/bounties` | Civic bounty marketplace for issue verification |
| `/bounties/[id]` | Bounty detail with claim and proof upload |
| `/leaderboard` | Neighborhood rankings with conservation metrics |
| `/track/[id]` | Individual complaint tracking timeline |
| `/login` | Phone OTP authentication |

---

## License

MIT
