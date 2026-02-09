# TrustHome - Master Roadmap & Project Documentation

**Last Updated:** February 9, 2026
**Version:** 2.0
**Owner:** DarkWave Studios LLC

---

## Mission Statement
To democratize real estate technology by providing every agent, buyer, seller, and service professional with a transparent, blockchain-verified platform that builds trust at every step of the transaction — making real estate simpler, safer, and more accessible for everyone.

## Overview
TrustHome is a real estate platform designed to be a central hub for all parties in a transaction, aiming to provide a unified, transparent, and efficient experience. It is a white-label ready platform for real estate agents and brokerages, serving as a key vertical within a broader ecosystem built on a custom Layer 1 blockchain for universal trust. The platform prioritizes a client-first approach with a premium, intuitive front-end, while offering agents a powerful backend business suite. TrustHome integrates with existing robust infrastructure including CRM, cross-ecosystem chat, marketing tools, SSO, and the Trust Shield security suite.

## Ownership & Partnership
- **Jennifer Lambert** — 51% Partner, Managing Member (Woman-Owned Business Designation)
- **[Founder]** — 49% Partner, Technical Lead & Platform Architect
- **Entity:** DarkWave Studios LLC
- **Woman-Owned Business:** Yes — qualifies for WOSB/WBENC certification
- **Orbit Staffing Integration:** Planned connection for bookkeeping and HR; ownership split (51/49) must be reflected in all Orbit Staffing agent instructions and financial configurations

## User Preferences
- Plan the full architecture before building
- Build with the complete picture in mind so adding features later means plugging in, not rebuilding
- Save and maintain this roadmap as the master document - update it as we go
- Think outside the box - don't settle for cookie-cutter solutions
- Consider all parties in a real estate transaction, not just agent and buyer/seller

## Current State (February 2026)
**Phase:** MVP Complete — Pre-Launch

**Completed Features:**
- Custom PIN-based authentication system (no Firebase/Google)
- Multi-tenant architecture with agent_id boundary
- Full agent dashboard with CRM, lead management, transaction pipeline
- Client portal with property shortlists, showings, documents
- AI-powered marketing hub with blog system
- Trust Layer (DWTL) blockchain integration — connected and verified
- Trust Shield badge in header with info modal and ecosystem links
- Membership awareness — subscribers informed of Trust Layer membership, dwtl.io login
- DarkWave Media Studio integration for video/media
- Signal Chat (cross-ecosystem messaging via PaintPros.io)
- AI Assistant for agents and clients (voice-capable with STT/TTS)
- WelcomeGuide onboarding slideshow (8 slides, first-login trigger)
- Contextual help system across 9+ screens
- Credential-verified demo mode for licensed professionals
- Developer console for access request management
- Partner onboarding modal for Jennifer Lambert (51% partner)
- Light/dark theme with premium glassmorphism design
- PWA capabilities

**Upcoming:**
- Orbit Staffing integration (bookkeeping, HR, payroll with 51/49 split)
- MLS/RESO Web API integration
- DocuSign/Dotloop e-signatures
- Calendar sync (Google/Apple)
- ShowingTime API sync
- Listing syndication (Zillow, Realtor.com)
- Social media marketing automation (Facebook, Instagram APIs)
- BoldTrail/kvCORE CRM data sync

## System Architecture
TrustHome's architecture is API-first, integrating with existing ecosystem tools. Services like CRM, Marketing Hub, and Analytics are treated as separate, tenant-spaced builds, allowing for modularity. TrustHome acts as an orchestration layer, unifying data from these distinct backends via APIs for a seamless user experience.

**UI/UX Decisions:**
- **Design Philosophy:** Mobile-native, premium, intuitive, clean, and calming. Minimal UI chrome.
- **Color Scheme:** Light/dark mode with TrustHome teal (#1A8A7E). Clean whites/soft grays for light mode, deep charcoals/near-blacks for dark mode.
- **Grid System:** True Bento grid (3-column layout) with grouped cards and horizontal carousels.
- **Card & Surface Design:** Glassmorphism with photorealistic images or rich gradients/textured backgrounds for depth. Low-profile, compact cards.
- **Visual Effects & Interactions:** 3D effects, hover effects, accordion/dropdowns, pill-shaped buttons, subtle micro-animations, skeleton loading, and haptic feedback.
- **Navigation:** Consistent "Back" and "Home" buttons. Hamburger menu on the right. No bottom tab bar.
- **Footer:** Two-tiered footer with copyright/ecosystem links and categorized link stacks.
- **Client vs. Agent View:** Client UI is spacious and visual; Agent UI is information-dense but clean, adhering to the same premium design.
- **Offline Capability:** Critical data (transaction timelines, property shortlists, messages, documents, calendar events) cached for offline viewing.

**Technical Implementations & Design Choices:**
- **Tech Stack:** Frontend: Expo React Native (iOS, Android, web). Backend: Express.js (TypeScript). Database: PostgreSQL with Drizzle ORM. State Management: React Query and React Context. Routing: Expo Router. Real-time: WebSockets.
- **API Architecture:** REST APIs for standard operations, WebSockets for real-time, Server-Sent Events (SSE) for AI streaming. GraphQL is intentionally excluded.
- **Voice AI Architecture:** OpenAI gpt-4o-mini-transcribe (STT) → OpenAI gpt-5.2 (AI brain) → OpenAI gpt-audio with "nova" voice (TTS). Three endpoints: `/api/ai/chat` (streaming text), `/api/ai/voice` (full voice interaction), `/api/ai/tts` (text-to-speech). Frontend uses MediaRecorder API (web only), AudioContext for playback. Audio format: records WebM/MP4, backend converts to WAV via ffmpeg, TTS outputs MP3. Uses OpenAI AI Integrations (no API key needed). 50MB body limit for audio payloads. Voice features gracefully degrade on mobile with helpful message.
- **Security:** Role-based access control (RBAC), end-to-end encryption, document encryption with per-tenant keys, session management, rate limiting, input validation, Trust Shield integration, and audit logging.
- **Database Schema:** Multi-tenant design using `agent_id` for tenant boundary, soft deletes, comprehensive timestamps, and indexing.
- **User Roles:** Detailed role-based permission system for Agents, Clients, Vendors (Inspector, Mortgage Broker, Title Company, Appraiser, Contractor), Team Members, and Brokerage Admins.
- **Authentication:** Custom PIN-based team portal (no third-party auth). PINs: Developer (0424), Jennifer Lambert (7777).

**Feature Specifications:**
- **Core Client Portal:** Onboarding, visual transaction timeline, property shortlist with comparison, showing management, blockchain-verified document vault, direct messaging, mortgage tools, neighborhood intelligence, post-close hub.
- **Agent Dashboard:** Comprehensive CRM, lead management (scoring, automated follow-ups), showing/open house management, transaction management (deadlines, party assignment), AI-powered marketing hub, network/referral management, performance analytics, branding customization.
- **Connected Verticals:** Dedicated portals for Home Inspectors, Mortgage Brokers/Lenders, Title Companies, Appraisers, and Contractors with specialized tools and guest access.
- **Trust Layer Integration:** Utilizes custom Layer 1 blockchain for immutable transaction records, document verification via hashing, identity verification, and a comprehensive Trust Score system. Subscribers are automatic Trust Layer members with access to dwtl.io dashboard and digital membership card.

## External Dependencies
- **PaintPros.io (Ecosystem Services):** CRM, Signal Chat, Marketing Suite, SSO, Analytics backend.
- **Trust Layer Blockchain (dwsc.io):** Custom Layer 1 blockchain for trust and verification.
- **Trust Shield (trustshield.tech):** Ecosystem's security system.
- **Orbit Staffing:** Upcoming integration for bookkeeping, HR, and payroll management.
- **MLS Systems:** Integration via RESO Web API.
- **BoldTrail/kvCORE:** API connection for CRM data sync.
- **ShowingTime:** API sync for showing schedules.
- **DocuSign / Dotloop:** Integration for e-signatures.
- **Google Calendar / Apple Calendar:** Calendar synchronization.
- **Facebook & Instagram APIs:** For social media marketing automation.
- **Zillow/Realtor.com:** For listing syndication data.
- **DarkWave Media Studio:** Video walkthrough and property media production.

## Branding
- **Primary:** TrustHome (trusthome.io)
- **Trust Layer:** dwtl.io — DarkWave Trust Layer
- **Blockchain Explorer:** dwsc.io/explorer
- **Security:** TrustShield.tech
- **Parent Company:** DarkWave Studios LLC (darkwavestudios.io)
- **Copyright:** 2026 DarkWave Studios LLC
