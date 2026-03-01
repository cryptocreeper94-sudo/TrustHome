# TrustHome — Complete Application Catalog

**Document Version:** 1.0
**Last Updated:** March 1, 2026
**Status:** Production (v1.0.0)
**Live URL:** https://trusthome.replit.app

---

## Identity

| Field | Value |
|-------|-------|
| **App Name** | TrustHome |
| **Slug** | `trusthome` |
| **Ecosystem ID** | `dw_app_trusthome` |
| **Version** | 1.0.0 |
| **Bundle ID (iOS)** | com.myapp |
| **Package Name (Android)** | com.myapp |
| **Parent Company** | DarkWave Studios LLC |
| **Ecosystem** | DarkWave Trust Layer (dwsc.io / dwtl.io / tlid.io) |
| **Category** | Real Estate Technology (PropTech) |
| **License** | Proprietary — White-Label SaaS |

---

## Ownership

| Partner | Stake | Role |
|---------|-------|------|
| **Jennifer Lambert** | **51%** | Managing Member, Industry Liaison |
| **Jason Andrews** | **49%** | Technical Lead & Platform Architect |

Ownership is enforced programmatically via ORBIT Financial Hub (orbitstaffing.io).

---

## Marketing Description

### One-Liner
Blockchain-verified real estate platform that unifies every party in a transaction — agents, clients, inspectors, lenders, title companies, and contractors — into a single, transparent hub.

### Short Description (App Store)
TrustHome is the white-label real estate platform built for modern brokerages. Manage transactions, leads, showings, documents, and marketing from one place — with every credential and milestone verified on the DarkWave Trust Layer blockchain. One login connects you to the full Trust Layer ecosystem.

### Full Description
TrustHome is a presentation-ready, white-label SaaS platform designed to be a central hub for all parties in a real estate transaction. Built on the DarkWave Trust Layer blockchain, it provides immutable verification of credentials, documents, and transaction milestones — creating a transparent, trustworthy experience for agents, buyers, sellers, and service professionals.

The platform offers a complete business suite for agents — CRM integration, AI-powered marketing, lead scoring, MLS connectivity, showing management, expense tracking, mileage logging, and performance analytics. For clients, it provides a visual transaction timeline, property shortlists, document vault, and direct messaging. For vendors (inspectors, lenders, title companies, appraisers, contractors), it provides dedicated portals with specialized tools and blockchain-verified professional credentials.

TrustHome is part of the Trust Layer ecosystem — a network of apps built on verified identity, shared credentials, and single sign-on. The platform supports dark/light mode, glassmorphism UI, mobile-first responsive design, and PWA capabilities. It is designed for multibillion-dollar brokerage pitches with built-in pitch deck, licensing packages, and branding customization tools.

### Target Market
- Real estate agents and teams
- Brokerages (independent, franchise, luxury)
- Real estate service vendors (inspectors, lenders, title, appraisers, contractors)
- Homebuyers and sellers
- Real estate investors

### Key Differentiators
1. Blockchain-verified credentials and transactions (DarkWave Trust Layer)
2. White-label ready — brokerages deploy under their own brand
3. All-party platform — not just agents, but the full transaction ecosystem
4. Trust Layer SSO — single identity across all DarkWave ecosystem apps
5. AI-powered marketing and lead intelligence
6. Built-in pitch deck and licensing for B2B sales

---

## Lines of Code (LOC)

| Category | Files | LOC |
|----------|-------|-----|
| App Routes (Expo Router) | 26 | 15,553 |
| Components (UI + Screens) | 28 | 12,389 |
| Server (Express API) | 26 | 5,410 |
| Contexts (State) | 3 | 600 |
| Shared (Schema) | 1 | 237 |
| Lib (Query Client) | 1 | 80 |
| **Total TypeScript/TSX** | **85** | **34,269** |
| HTML Templates | 4 | 2,059 |
| **Grand Total** | **89** | **~36,300** |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Expo | ~54.0.27 (SDK 54) | Cross-platform app framework |
| React | 19.1.0 | UI library |
| React Native | 0.81.5 | Native rendering |
| React Native Web | 0.21.0 | Web target |
| Expo Router | ~6.0.17 | File-based routing |
| React Native Reanimated | ~4.1.1 | Animations |
| Expo Linear Gradient | ~15.0.8 | Gradient rendering |
| Expo Blur | ~15.0.8 | Glassmorphism blur |
| Expo Image | ~3.0.11 | Optimized image loading |
| Expo Image Picker | ~17.0.9 | Photo selection |
| Expo Location | ~19.0.8 | Geolocation |
| Expo Haptics | ~15.0.8 | Haptic feedback |
| Expo Clipboard | ^8.0.8 | Clipboard access |
| Expo Glass Effect | ~0.1.4 | iOS liquid glass |
| React Native Gesture Handler | ~2.28.0 | Gesture recognition |
| React Native Screens | ~4.16.0 | Native screen management |
| React Native Safe Area Context | ~5.6.0 | Safe area insets |
| React Native Keyboard Controller | ^1.20.6 | Keyboard management |
| React Native SVG | 15.12.1 | SVG rendering |
| @tanstack/react-query | ^5.83.0 | Server state / data fetching |
| @expo/vector-icons | ^15.0.3 | Icon library |
| @react-native-async-storage | 2.2.0 | Persistent local storage |
| Socket.io Client | ^4.8.3 | Real-time WebSocket |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | ^5.0.1 | HTTP server framework |
| TypeScript (tsx) | ^4.20.6 | Runtime + type safety |
| PostgreSQL | (Replit managed) | Primary database |
| Drizzle ORM | ^0.39.3 | Type-safe database ORM |
| Drizzle-Zod | ^0.7.1 | Schema validation |
| Zod | ^3.25.76 | Input validation |
| Socket.io | ^4.8.3 | Real-time WebSocket server |
| Express Session | ^1.19.0 | Session management |
| connect-pg-simple | ^10.0.0 | PostgreSQL session store |
| bcryptjs | ^3.0.3 | Password hashing |
| OpenAI | ^6.18.0 | AI chat, voice, TTS |
| ElevenLabs | ^1.56.1 | Voice synthesis |
| Resend | ^4.0.0 | Transactional email |
| ws | ^8.0.0 | WebSocket proxy |
| http-proxy-middleware | ^3.0.5 | API proxy |
| p-limit / p-retry | ^7.x | Rate limiting / retry |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Replit | Hosting, deployment, CI/CD |
| PostgreSQL (Replit) | Managed database |
| dwsc.io | DarkWave Trust Layer blockchain |
| trustshield.tech | Ecosystem security suite |
| orbitstaffing.io | Financial hub, SSO, payroll |
| tlid.io | Trust Layer identity system |
| dwtl.io | Trust Layer public portal |

---

## Database Schema

### Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts (agents, clients, vendors) | id, email, password, firstName, lastName, role, brokerage, licenseNumber, trustLayerId, ecosystemPinHash, ecosystemApp |
| `verification_codes` | Email verification / password reset codes | id, email, code, type, expiresAt, used |

Additional tables defined inline in routes (Drizzle push schema): blog_posts, leads, expenses, mileage_entries, mls_configurations, bookings, calendar_events, marketing_posts, jobs, referrals, payments, subcontractors, webhooks, media_studio_projects, crm_deals, crm_activities.

---

## Application Routes (Frontend)

| Route | Screen | LOC | Description |
|-------|--------|-----|-------------|
| `/` | index.tsx | 677 | Landing / Explorer (CommandCenterHub for agents, public browse for visitors) |
| `/auth` | auth.tsx | 1,144 | Authentication — PIN login, email/password, registration, password reset |
| `/transactions` | transactions.tsx | 314 | Transaction management & pipeline |
| `/properties` | properties.tsx | 396 | Property listings & search |
| `/showings` | showings.tsx | 401 | Showing & open house management |
| `/messages` | messages.tsx | 368 | Messaging / inbox |
| `/documents` | documents.tsx | 263 | Document vault with blockchain verification |
| `/leads` | leads.tsx | 499 | Lead management & scoring (agent) |
| `/marketing` | marketing.tsx | 808 | AI-powered marketing suite (agent) |
| `/blog` | blog.tsx | 952 | Content management system |
| `/analytics` | analytics.tsx | 361 | Performance analytics dashboard |
| `/network` | network.tsx | 610 | Professional network & referrals |
| `/business` | business.tsx | 5 | Business Suite launcher |
| `/media-studio` | media-studio.tsx | 929 | DarkWave Media Studio integration |
| `/mls-setup` | mls-setup.tsx | 1,355 | MLS configuration & API connections |
| `/tree-services` | tree-services.tsx | 767 | Verdara tree services integration |
| `/branding` | branding.tsx | 515 | White-label branding customization |
| `/settings` | settings.tsx | 494 | Profile, preferences, partner dashboard |
| `/developer` | developer.tsx | 1,137 | Developer console, system health, API tools |
| `/team` | team.tsx | 1,550 | Team portal with PIN authentication |
| `/command-center` | command-center.tsx | 1,024 | Agent command center / dashboard hub |
| `/ecosystem` | ecosystem.tsx | 398 | Trust Layer ecosystem directory |
| `/support` | support.tsx | 476 | Help center & support |

---

## API Endpoints (126 total)

### Authentication (11)
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — Email/password login
- `POST /api/auth/login/verify` — 2FA verification
- `POST /api/auth/dev-pin` — Developer PIN authentication
- `POST /api/auth/pin/verify` — Ecosystem PIN verification
- `POST /api/auth/ecosystem-login` — Cross-ecosystem SSO login
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Password reset execution
- `POST /api/auth/set-password` — Initial password set
- `POST /api/auth/verify-email` — Email verification
- `POST /api/auth/resend-code` — Resend verification code
- `GET /api/auth/me` — Current user session
- `POST /api/auth/logout` — Sign out

### Blockchain / Trust Layer (12)
- `POST /api/blockchain/stamp` — Create blockchain stamp
- `POST /api/blockchain/hash` — Hash document for verification
- `GET /api/blockchain/stamps` — Retrieve stamps
- `GET /api/blockchain/wallet/balance` — Wallet balance
- `GET /api/trustlayer/status` — Trust Layer connection status
- `GET /api/trustlayer/registry` — Registry lookup
- `GET /api/trustlayer/stamps` — Trust Layer stamps
- `GET /api/trustlayer/tiers` — Membership tiers
- `GET /api/trustlayer/certifications/:id` — Certification details
- `POST /api/trustlayer/certifications` — Submit certification
- `POST /api/trustlayer/checkout` — Membership checkout
- `POST /api/trustlayer/sync-user` — Sync user to Trust Layer
- `POST /api/trustlayer/sync-password` — Sync password
- `POST /api/trustlayer/verify-credentials` — Verify credentials

### CRM & Leads (6)
- `GET /api/leads` — List leads
- `POST /api/leads` — Create lead
- `PUT /api/leads/:id` — Update lead
- `POST /api/leads/score` — Score lead
- `POST /api/leads/score-ai` — AI-powered lead scoring
- `GET /api/lead-sources` — Lead source analytics

### Marketing (6)
- `GET /api/marketing/posts` — List marketing posts
- `POST /api/marketing/posts` — Create post
- `GET /api/marketing/live-posts` — Active social posts
- `POST /api/marketing/quick-post` — Quick social post
- `POST /api/marketing/generate-captions` — AI caption generation
- `POST /api/marketing/images` — Upload marketing image
- `GET /api/marketing/images` — List marketing images

### Transactions & Showings (7)
- `GET /api/bookings` — List showings/bookings
- `POST /api/bookings` — Create booking
- `PUT /api/bookings/:id` — Update booking
- `PATCH /api/bookings/:id/status` — Update booking status
- `GET /api/availability` — Agent availability
- `GET /api/payments` — Payment records
- `GET /api/payments/:id` — Payment details

### Calendar (4)
- `GET /api/calendar/events` — List events
- `POST /api/calendar/events` — Create event
- `PUT /api/calendar/events/:id` — Update event
- `DELETE /api/calendar/events/:id` — Delete event

### Blog / Content (6)
- `GET /api/blog/posts` — Public blog posts
- `GET /api/blog/posts/:slug` — Single blog post
- `GET /api/blog/admin/posts` — Admin post list
- `POST /api/blog/admin/posts` — Create blog post
- `PUT /api/blog/admin/posts/:id` — Update blog post
- `DELETE /api/blog/admin/posts/:id` — Delete blog post
- `POST /api/blog/admin/generate` — AI blog generation

### Business Suite (8)
- `GET /api/expenses` — List expenses
- `POST /api/expenses` — Create expense
- `PUT /api/expenses/:id` — Update expense
- `DELETE /api/expenses/:id` — Delete expense
- `POST /api/expenses/ocr` — OCR receipt scan
- `GET /api/mileage` — List mileage entries
- `POST /api/mileage` — Log mileage
- `PUT /api/mileage/:id` — Update mileage
- `DELETE /api/mileage/:id` — Delete mileage

### MLS (5)
- `GET /api/mls/config` — MLS configurations
- `POST /api/mls/config` — Add MLS connection
- `PUT /api/mls/config/:id` — Update MLS config
- `DELETE /api/mls/config/:id` — Remove MLS config
- `POST /api/mls/test-connection` — Test MLS connection

### Analytics & Admin (8)
- `GET /api/analytics/dashboard` — Dashboard metrics
- `GET /api/analytics/geography` — Geographic data
- `GET /api/analytics/live` — Live activity feed
- `GET /api/admin/overview` — Admin overview
- `GET /api/admin/system-health` — System health check
- `GET /api/admin/api-connections` — API connection status
- `GET /api/admin/access-requests` — Access requests
- `PUT /api/admin/access-requests/:id` — Approve/deny request

### AI & Voice (3)
- `POST /api/ai/chat` — AI assistant chat
- `POST /api/ai/voice` — Voice transcription (STT)
- `POST /api/ai/tts` — Text-to-speech

### Orbit Staffing (11)
- `GET /api/orbit/status` — Orbit connection status
- `GET /api/orbit/pricing` — Pricing tiers
- `POST /api/orbit/pricing/push` — Push pricing to Orbit
- `GET /api/orbit/financial-statement` — Financial statement
- `GET /api/orbit/logs` — Orbit activity logs
- `POST /api/orbit/logs` — Submit log entry
- `POST /api/orbit/register-app` — Register app with Orbit
- `POST /api/orbit/report-transaction` — Report transaction
- `POST /api/orbit/sso/login` — SSO proxy login
- `POST /api/orbit/sso/register` — SSO proxy registration
- `POST /api/orbit/sync/*` — Sync workers, contractors, timesheets, certifications
- `POST /webhooks/orbit` — Orbit webhook receiver

### Verdara (5)
- `GET /api/verdara/status` — Verdara connection status
- `GET /api/verdara/species/:id` — Species identification
- `POST /api/verdara/identify` — Tree identification
- `POST /api/verdara/removal-plan` — Removal plan
- `POST /api/verdara/assess` — Tree assessment

### Media Studio (4)
- `GET /api/media-studio/status` — Studio connection
- `GET /api/media-studio/projects` — List projects
- `GET /api/media-studio/projects/:projectId` — Project details
- `GET /api/media-studio/projects/:projectId/status` — Project status
- `POST /api/media-studio/walkthrough-request` — Request walkthrough
- `POST /api/media-studio/projects/:projectId/cancel` — Cancel project

### Ecosystem & Other (10)
- `GET /api/ecosystem/status` — Ecosystem status
- `GET /api/ecosystem/widget-config` — Widget configuration
- `POST /api/ecosystem/incoming` — Incoming ecosystem webhook
- `GET /api/health` — Server health check
- `GET /api/tenant` — Tenant configuration
- `GET /api/referrals` — Referral network
- `POST /api/referrals` — Submit referral
- `GET /api/subcontractors` — Subcontractor list
- `GET /api/webhooks` — Webhook configurations
- `POST /api/webhooks` — Register webhook
- `POST /api/access-requests` — Submit access request
- `POST /api/invite-agent` — Invite agent email
- `GET /api/messages/online-users` — Online presence
- `POST /api/messages/send-message` — Send message

### CRM (2)
- `POST /api/crm/deals` — Create deal
- `PUT /api/crm/deals/:id` — Update deal
- `POST /api/crm/activities` — Log activity

### Jobs / Contractors (5)
- `GET /api/jobs` — List jobs
- `POST /api/jobs` — Create job
- `PUT /api/jobs/:id` — Update job
- `GET /api/jobs/:id` — Job details
- `GET /api/jobs/:id/updates` — Job updates
- `POST /api/jobs/:id/updates` — Add job update

### Static / PWA (4)
- `GET /` — Landing page (HTML)
- `GET /blog` — Blog index (HTML)
- `GET /blog/:slug` — Blog post (HTML)
- `GET /invite/jennifer` — Jennifer Lambert invite page
- `GET /manifest.json` — PWA manifest
- `GET /sw.js` — Service worker

---

## Component Library (28 components)

### Screen Components
| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| CommandCenterHub | components/screens/CommandCenterHub.tsx | 1,128 | Agent dashboard hub / home screen |
| AgentDashboard | components/screens/AgentDashboard.tsx | 704 | Agent-specific dashboard |
| ClientDashboard | components/screens/ClientDashboard.tsx | 540 | Client-facing dashboard |
| BusinessSuiteScreen | components/screens/BusinessSuiteScreen.tsx | 839 | Expenses, mileage, P&L |
| NavigationHub | components/screens/NavigationHub.tsx | 669 | Public navigation / feature showcase |
| PlaceholderScreen | components/screens/PlaceholderScreen.tsx | 100 | Generic placeholder |

### UI Components
| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| Header | components/ui/Header.tsx | 480 | Universal header with back/menu/actions |
| DrawerMenu | components/ui/DrawerMenu.tsx | 305 | Side navigation drawer |
| Footer | components/ui/Footer.tsx | 182 | Site-wide footer |
| GlassCard | components/ui/GlassCard.tsx | 116 | Glassmorphism card component |
| BentoGrid | components/ui/BentoGrid.tsx | 59 | Bento grid layout system |
| PillButton | components/ui/PillButton.tsx | 134 | Pill-shaped action buttons |
| AccordionSection | components/ui/AccordionSection.tsx | 125 | Collapsible accordion sections |
| HorizontalCarousel | components/ui/HorizontalCarousel.tsx | 127 | Horizontal scroll carousel |
| SkeletonLoader | components/ui/SkeletonLoader.tsx | 225 | Animated skeleton loading |
| InfoModal | components/ui/InfoModal.tsx | 165 | Information modal overlay |
| TrustShieldBadge | components/ui/TrustShieldBadge.tsx | 169 | Blockchain trust verification badge |
| VideoHero | components/ui/VideoHero.tsx | 302 | Video hero banner |
| BrowseCTABar | components/ui/BrowseCTABar.tsx | 532 | Public browse call-to-action |
| BrokerPitchDeck | components/ui/BrokerPitchDeck.tsx | 936 | B2B pitch deck presentation |
| LicensingPack | components/ui/LicensingPack.tsx | 1,238 | White-label licensing packages |
| PartnerOnboardingModal | components/ui/PartnerOnboardingModal.tsx | 473 | Partner onboarding flow |
| WelcomeGuide | components/ui/WelcomeGuide.tsx | 930 | Interactive platform tour |
| AiAssistant | components/ui/AiAssistant.tsx | 766 | AI chat assistant (OpenAI) |
| SignalChat | components/ui/SignalChat.tsx | 773 | DarkWave Signal real-time chat |

### Utility Components
| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| ErrorBoundary | components/ErrorBoundary.tsx | 54 | React error boundary wrapper |
| ErrorFallback | components/ErrorFallback.tsx | 288 | Crash recovery UI |
| KeyboardAwareScrollView | components/KeyboardAwareScrollViewCompat.tsx | 30 | Keyboard-aware scroll compat |

---

## External Integrations

| Integration | Endpoint | Auth Method | Status |
|-------------|----------|-------------|--------|
| DarkWave Trust Layer (dwsc.io) | dwsc.io/api/* | HMAC-SHA256 | Connected |
| TrustShield (trustshield.tech) | trustshield.tech/api/* | HMAC-SHA256 | Connected |
| Orbit Staffing (orbitstaffing.io) | orbitstaffing.io/api/* | X-API-Key/Secret headers | Connected |
| Verdara (dwsc.io) | dwsc.io/api/verdara/* | HMAC-SHA256 | Ready (awaiting credentials) |
| DarkWave Media Studio | dwsc.io/api/media/* | HMAC-SHA256 | Connected |
| DarkWave Ecosystem Widget | dwsc.io/api/ecosystem/* | Public embed | Live |
| OpenAI (via Replit) | Replit AI Integration | Managed | Connected |
| ElevenLabs (via Replit) | Replit AI Integration | Managed | Connected |
| Resend (via Replit) | Replit Integration | Managed | Connected |

---

## Ecosystem Position

TrustHome is one of 8 apps in the DarkWave Trust Layer ecosystem:

| App | Category | URL |
|-----|----------|-----|
| **TrustHome** | Real Estate | trusthome.replit.app |
| Trust Vault | Finance / Wallet | trustvault.tlid.io |
| TL Driver Connect | Transportation | driverconnect.tlid.io |
| THE VOID | Entertainment | thevoid.tlid.io |
| Happy Eats | Food & Dining | happyeats.app |
| Verdara | Outdoors / Recreation | dwsc.io |
| Orbit Staffing | Business / HR | orbitstaffing.io |
| TrustShield | Security | trustshield.tech |

All apps share SSO via Trust Layer Identity (tlid.io), blockchain verification via DWTL, and security monitoring via TrustShield.

---

## Pricing Tiers

### Founder Pricing (Launch Partners)
| Tier | Monthly | Target |
|------|---------|--------|
| Agent | $49/mo | Individual agents |
| Brokerage | $299/mo | Small-mid brokerages |
| White-Label | $1,499/mo | Enterprise / franchise |

### Standard Pricing
| Tier | Monthly | Target |
|------|---------|--------|
| Agent | $99/mo | Individual agents |
| Brokerage | $599/mo | Small-mid brokerages |
| White-Label | $2,999/mo | Enterprise / franchise |

Pricing is synced to Orbit Staffing on every server startup.

---

## Design System

| Property | Value |
|----------|-------|
| Primary Color | TrustHome Teal `#1A8A7E` |
| Design Language | Glassmorphism, dark-first, premium fintech aesthetic |
| Layout | Bento grid (2-col mobile, 3-col tablet/web) |
| Typography | System fonts, clean hierarchy |
| Surfaces | Glass cards with blur, gradient backgrounds |
| Interactions | Reanimated micro-animations, haptic feedback, skeleton loading |
| Theme | Dark/Light mode (automatic + manual toggle) |
| Icons | Ionicons (@expo/vector-icons) |
| Responsive | Mobile-first, 375pt minimum, 720px max content width |
| PWA | Service worker + manifest for installable web experience |

---

## Security

| Feature | Implementation |
|---------|----------------|
| Authentication | Email/password + PIN-based team access |
| Password Policy | Min 8 chars, 1 uppercase, 1 special character |
| Password Storage | bcryptjs hashing |
| Sessions | Express session with PostgreSQL store |
| PIN Auth | Jennifer Lambert: 7777, Jason Andrews: 0424 |
| RBAC | Agent, Client, Vendor roles |
| Blockchain | Document hashing, transaction stamps on DWTL |
| Ecosystem SSO | Cross-app identity via Orbit Staffing proxy |

---

## Server Templates (HTML)

| Template | Path | Purpose |
|----------|------|---------|
| Landing Page | server/templates/landing-page.html | Public marketing homepage |
| Blog Index | server/templates/blog-index.html | Blog listing page |
| Blog Post | server/templates/blog-page.html | Individual blog post template |
| Jennifer's Invite | server/templates/invite-jennifer.html | Personalized partner invite page |

All HTML templates include DarkWave shared components (footer, announcement bar, trust badge) loaded from dwsc.io.

---

## Environment Variables

### Required Secrets
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session signing key |
| `DARKWAVE_API_KEY` | DarkWave Trust Layer API key |
| `DARKWAVE_API_SECRET` | DarkWave Trust Layer API secret |
| `DW_MEDIA_API_KEY` | DarkWave Media Studio API key |
| `DW_MEDIA_API_SECRET` | DarkWave Media Studio API secret |
| `ORBIT_ECOSYSTEM_API_KEY` | Orbit Staffing API key |
| `ORBIT_ECOSYSTEM_API_SECRET` | Orbit Staffing API secret |
| `ORBIT_FINANCIAL_HUB_SECRET` | Orbit webhook verification |
| `TRUSTLAYER_API_KEY` | Trust Layer identity API key |
| `TRUSTLAYER_API_SECRET` | Trust Layer identity API secret |
| `VERDARA_API_KEY` | Verdara integration key |
| `VERDARA_API_SECRET` | Verdara integration secret |

### Runtime Configuration
| Variable | Value |
|----------|-------|
| `ORBIT_HUB_URL` | https://orbitstaffing.io |
| `EXPO_PUBLIC_DOMAIN` | Injected at build time (dev domain) |
| `NODE_ENV` | development / production |

---

## Build & Deploy

| Command | Purpose |
|---------|---------|
| `npm run expo:dev` | Start Expo dev server (port 8081) |
| `npm run server:dev` | Start Express backend (port 5000) |
| `npm run server:build` | Bundle server with esbuild |
| `npm run server:prod` | Run production server |
| `npm run expo:static:build` | Build static web export |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |

---

## File Structure

```
trusthome/
├── app/                          # Expo Router pages (26 routes)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Landing / Explorer
│   ├── auth.tsx                  # Authentication
│   ├── ecosystem.tsx             # Trust Layer directory
│   ├── [feature].tsx             # Feature-specific screens
│   └── +not-found.tsx            # 404 handler
├── components/
│   ├── screens/                  # Full-screen composites (6)
│   ├── ui/                       # Reusable UI components (19)
│   ├── ErrorBoundary.tsx         # Error boundary
│   ├── ErrorFallback.tsx         # Crash recovery
│   └── KeyboardAwareScrollViewCompat.tsx
├── contexts/
│   ├── AppContext.tsx             # App-wide state (auth, role, demo)
│   ├── ThemeContext.tsx           # Dark/light theme
│   └── LocationContext.tsx        # Geolocation state
├── lib/
│   └── query-client.ts           # React Query + API helpers
├── shared/
│   └── schema.ts                 # Drizzle ORM schema + Zod validation
├── server/
│   ├── index.ts                  # Express app entry point
│   ├── routes.ts                 # Main API routes (2,025 LOC)
│   ├── orbit-routes.ts           # Orbit Staffing integration
│   ├── verdara-routes.ts         # Verdara tree services
│   ├── voice-ai-routes.ts        # AI voice endpoints
│   ├── trustlayer-client.ts      # Trust Layer API client
│   ├── ecosystem-client.ts       # DarkWave ecosystem client
│   ├── media-studio-client.ts    # Media Studio client
│   ├── verdara-client.ts         # Verdara API client
│   ├── services/orbitClient.ts   # Orbit Staffing client
│   ├── resend-client.ts          # Email (Resend)
│   ├── elevenlabs-client.ts      # Voice synthesis
│   ├── socket-proxy.ts           # WebSocket proxy
│   ├── storage.ts                # Database storage layer
│   ├── db.ts                     # Database connection
│   ├── templates/                # HTML templates (4)
│   └── replit_integrations/      # Replit-managed integrations
├── docs/
│   ├── APP_CATALOG.md            # This file
│   ├── TRUSTHOME_EXECUTIVE_SUMMARY.md
│   └── TRUSTHOME_BUSINESS_PLAN.md
├── assets/                       # Images, icons, splash screens
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── drizzle.config.ts             # Drizzle ORM config
├── tsconfig.json                 # TypeScript config
└── replit.md                     # Project memory / architecture notes
```

---

*This catalog is the single source of truth for describing TrustHome to external agents, cataloging systems, investors, and ecosystem partners. Keep it updated as features are added or architecture changes.*
