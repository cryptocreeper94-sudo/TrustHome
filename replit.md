# TrustHome - Master Roadmap

## Recent Changes
- **Feb 8, 2026**: PaintPros.io Backend Integration (Full Business Suite)
  - Ecosystem API client (server/ecosystem-client.ts) with DarkWave HMAC-SHA256 authentication
  - 50+ backend proxy routes covering all PaintPros.io services: CRM/Leads, Calendar, Bookings, Jobs, Marketing, Analytics, Blockchain, Messaging, Auth, Payments, Referrals, Subcontractors, Webhooks
  - Frontend screens updated to fetch live data via React Query with graceful fallback to sample data
  - Leads screen: fetches real leads from PaintPros.io API (5 live leads confirmed)
  - Analytics screen: live dashboard stats from PaintPros.io analytics service
  - Agent Dashboard: shows "Connected to PaintPros.io" ecosystem status
  - Network screen: subcontractor integration with live data fetch
  - Socket.IO real-time messaging proxy: frontend ↔ backend ↔ PaintPros.io upstream
  - Server timezone: Central Standard Time (America/Chicago)
  - Fixed react-is dependency conflict from socket.io installation
- **Feb 8, 2026** (earlier): Built all functional screens and AI Assistant
  - All 9 navigation screens fully built with realistic sample data and interactive elements
  - Leads/CRM, Calendar/Showings, Messages, Documents, Properties, Analytics, Marketing Hub, Professional Network, Settings
  - AI Assistant: Slide-out panel with role-aware responses, quick prompts, chat interface
- **Feb 8, 2026** (earliest): Built front-end prototype with premium UI
  - App structure: Expo Router with hamburger menu navigation (no tab bar)
  - Theme system: Light/dark mode toggle with teal accent (#1A8A7E)
  - Agent Dashboard: Bento grid stats, urgent items, schedule, active deals carousel, hot leads carousel, connected verticals preview
  - Client Dashboard: Transaction timeline, showings, property shortlist carousel, documents, connected parties
  - Hamburger menu: Full navigation with Agent/Client role switcher
  - Transactions: Pipeline with 6 stages, 10 deals with expandable details
  - Footer: darkwavestudios.io copyright 2026, "Powered by trustshield.tech", dwtl.io link, organized link columns
  - Glassmorphism cards, pill buttons, info modals, horizontal carousels
  - Custom app icon generated (house + shield motif, teal/gold on navy)

## Project Structure
```
server/
  index.ts             - Express server entry point (port 5000)
  routes.ts            - 50+ proxy routes to PaintPros.io ecosystem services
  ecosystem-client.ts  - DarkWave HMAC-SHA256 API client for PaintPros.io
  socket-proxy.ts      - Socket.IO proxy layer (frontend ↔ PaintPros.io)

app/
  _layout.tsx          - Root layout with Stack navigator, providers
  index.tsx            - Main screen (Agent/Client dashboard based on role)
  transactions.tsx     - Transaction pipeline with 6 stages, 10 deals
  properties.tsx       - Property listings with filters and favorites
  showings.tsx         - Calendar with month view and color-coded events
  messages.tsx         - Conversation list with expandable inline chat
  documents.tsx        - Document vault with blockchain verification
  leads.tsx            - Lead CRM with List/Pipeline views (live data from API)
  marketing.tsx        - Marketing hub with 4-tab interface
  analytics.tsx        - Performance analytics (live data from API)
  network.tsx          - Professional network with vendor directory (live data)
  branding.tsx         - White-label branding (placeholder)
  settings.tsx         - Profile & settings with toggles and integrations
  support.tsx          - Help & support (placeholder)

components/
  screens/
    AgentDashboard.tsx   - Agent dashboard with ecosystem connection status
    ClientDashboard.tsx  - Client portal with timeline, showings, shortlist
    PlaceholderScreen.tsx - Reusable placeholder (branding and support only)
  ui/
    DrawerMenu.tsx       - Hamburger menu with navigation and role switcher
    Footer.tsx           - Two-tiered footer with links and credits
    GlassCard.tsx        - Glassmorphism card component
    Header.tsx           - App header with title and menu button
    InfoModal.tsx        - Reusable info modal component
    PillButton.tsx       - Pill-shaped button component
    AiAssistant.tsx      - AI Assistant slide-out panel with role-aware chat

lib/
  query-client.ts      - React Query config with API URL helper (getApiUrl)

contexts/
  ThemeContext.tsx      - Light/dark theme provider with teal accent

constants/
  colors.ts            - Color palette for light and dark modes
```

## Backend Integration
- **API Client**: DarkWave HMAC-SHA256 auth (`DW {apiKey}:{timestamp}:{signature}`)
- **Upstream**: https://paintpros.io/api/ with tenant "demo" for development
- **Auth Secrets**: DARKWAVE_API_KEY, DARKWAVE_API_SECRET (stored as Replit secrets)
- **Working Endpoints**: /api/leads, /api/analytics/dashboard, /api/analytics/live, /api/blockchain/wallet/balance, /api/blockchain/stamps, /api/bookings, /api/payments, /api/referrals, /api/subcontractors
- **Unavailable for Demo Tenant** (gracefully handled): /api/calendar/events, /api/marketing/images, /api/marketing/posts, /api/tenant
- **Socket.IO**: Backend proxy on /ws path connects to upstream wss://paintpros.io
- **Graceful Fallback**: Frontend uses React Query; if API returns errors or non-JSON, falls back to sample data seamlessly

## Overview
TrustHome is a real estate platform designed to be the central hub for all parties involved in a transaction (agents, buyers, sellers, inspectors, mortgage brokers, etc.). It aims to provide a unified, transparent experience, enhancing trust and efficiency in real estate dealings. The platform is white-label ready, allowing various real estate agents and brokerages to brand it as their own. TrustHome is a key vertical within a broader ecosystem built on a custom Layer 1 blockchain, serving as a universal trust layer across multiple industries. Its core principle is a client-first approach, offering a premium, intuitive front-end experience while providing agents with a powerful backend business suite. TrustHome will integrate with existing robust infrastructure developed by the user, including a comprehensive CRM, a cross-ecosystem chat system (Signal Chat), marketing tools, a Single Sign-On (SSO) system, and the Trust Shield security suite.

## User Preferences
- Plan the full architecture before building
- Build with the complete picture in mind so adding features later means plugging in, not rebuilding
- Save and maintain this roadmap as the master document - update it as we go
- Think outside the box - don't settle for cookie-cutter solutions
- Consider all parties in a real estate transaction, not just agent and buyer/seller

## System Architecture
TrustHome's architecture emphasizes an API-first approach, connecting to existing ecosystem tools rather than embedding their code. Each service (CRM, Marketing Hub, Analytics) is treated as a separate, tenant-spaced build, allowing for modularity and independent sales, akin to Salesforce's model. TrustHome will act as an orchestration layer, integrating data from these distinct backends via APIs to present a seamless user experience.

**UI/UX Decisions:**
- **Design Philosophy:** Mobile-native, premium feel, intuitive, clean, and calming. Minimal chrome with no cluttered headers.
- **Color Scheme:** Light/dark mode toggle with a warm, earthy primary accent (e.g., deep teal, warm terracotta, rich forest green), avoiding typical real estate colors. Clean whites/soft grays for light mode, deep charcoals/near-blacks for dark mode.
- **Grid System:** True Bento grid with a 3-column layout, utilizing grouped cards and horizontal carousels for overflow content. No vertical stacking of full-width boxes.
- **Card & Surface Design:** Glassmorphism throughout, with every card featuring photorealistic images or rich gradients/textured backgrounds for depth. Low-profile, compact cards.
- **Visual Effects & Interactions:** 3D effects, hover effects, accordion/dropdowns, pill-shaped buttons. Subtle micro-animations, skeleton loading states, and haptic feedback on key actions.
- **Navigation:** Consistent, clear "Back" and "Home" buttons. Hamburger menu on the right side of the header. No bottom tab bar.
- **Footer:** Two-tiered footer: bottom bar for copyright and ecosystem links; upper sub-footer for categorized link stacks (For Agents, For Inspectors, Legal, Resources).
- **Client vs. Agent View:** Client UI is more spacious and visual; Agent UI is more information-dense but still clean and intuitive, both adhering to the same premium design language.
- **Offline Capability:** Critical data like transaction timelines, property shortlists, messages, documents, and calendar events are cached for offline viewing.

**Technical Implementations & Design Choices:**
- **Tech Stack:** Frontend with Expo React Native (iOS, Android, web), Backend with Express.js (TypeScript), PostgreSQL with Drizzle ORM for the database, React Query and React Context for state management, Expo Router for routing, and WebSockets for real-time features.
- **API Architecture:** REST APIs for standard CRUD operations and WebSockets for real-time communication. GraphQL is intentionally excluded to prioritize simplicity.
- **Security:** Role-based access control (RBAC), end-to-end encryption, document encryption with per-tenant keys, session management, rate limiting, input validation, Trust Shield integration, and audit logging for sensitive operations.
- **Database Schema:** Multi-tenant design with agent_id as the primary tenant boundary, soft deletes, comprehensive timestamps, and indexing on frequently queried fields.
- **User Roles:** A detailed role-based permission system defines access and capabilities for Agents, Clients (Buyer/Seller), various Vendors (Inspector, Mortgage Broker, Title Company, Appraiser, Contractor), Team Members, and future Brokerage Admins, ensuring data ownership and need-to-know access.

**Feature Specifications:**
- **Core Client Portal:** Onboarding, visual transaction timeline, curated property shortlist with comparison tools, showing management, document vault with blockchain verification, direct messaging, mortgage tools, neighborhood intelligence, and a post-close hub.
- **Agent Dashboard:** Comprehensive CRM, lead management with scoring and automated follow-ups, showing and open house management, transaction management with deadline tracking and party assignment, marketing hub with AI-generated content, network/referral management, performance analytics, and branding customization.
- **Connected Verticals:** Dedicated portals for Home Inspectors, Mortgage Brokers/Lenders, Title Companies, Appraisers, and Contractors, each offering specialized tools and workflows, with guest access for non-subscribers.
- **Trust Layer Integration:** Utilizes the custom Layer 1 blockchain for immutable transaction records, document verification via hashing, identity verification, and a comprehensive Trust Score system for all users.

## External Dependencies
- **CRM:** Existing comprehensive CRM from PaintPros.io (API-connected, tenant-spaced).
- **Signal Chat:** Ecosystem-wide chat system (API-connected).
- **Marketing Suite:** Full marketing tools including automated social media marketing (API-connected, tenant-spaced).
- **SSO (Single Sign-On):** Ecosystem-wide authentication system (API-connected).
- **Trust Layer Blockchain:** Custom Layer 1 blockchain for trust and verification (API-connected).
- **Trust Shield:** Ecosystem's security system (trustshield.tech) for identity verification, document authenticity, and fraud prevention (API-connected).
- **Analytics:** Separate analytics backend (API-connected, tenant-spaced).
- **MLS Systems:** Integration via RESO Web API for listing data.
- **BoldTrail/kvCORE:** API connection for CRM data sync (specific for RE/MAX agents).
- **ShowingTime:** API sync for showing schedules.
- **DocuSign / Dotloop:** Integration for e-signatures and document status tracking.
- **Google Calendar / Apple Calendar:** Calendar synchronization.
- **Facebook & Instagram APIs:** For social media marketing automation.
- **Zillow/Realtor.com:** For listing syndication data.