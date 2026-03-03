# TrustHome - Master Roadmap & Project Documentation

## Overview
TrustHome is a real estate platform designed to be a central hub for all parties in a transaction, aiming to provide a unified, transparent, and efficient experience. It is a white-label ready platform for real estate agents and brokerages, serving as a key vertical within a broader ecosystem built on a custom Layer 1 blockchain for universal trust. The platform prioritizes a client-first approach with a premium, intuitive front-end, while offering agents a powerful backend business suite. TrustHome integrates with existing robust infrastructure including CRM, cross-ecosystem chat, marketing tools, SSO, and the Trust Shield security suite. The mission is to democratize real estate technology by providing every agent, buyer, seller, and service professional with a transparent, blockchain-verified platform that builds trust at every step of the transaction.

## User Preferences
- Plan the full architecture before building
- Build with the complete picture in mind so adding features later means plugging in, not rebuilding
- Save and maintain this roadmap as the master document - update it as we go
- Think outside the box - don't settle for cookie-cutter solutions
- Consider all parties in a real estate transaction, not just agent and buyer/seller

## System Architecture
TrustHome's architecture is API-first, integrating with existing ecosystem tools. Services like CRM, Marketing Hub, and Analytics are treated as separate, tenant-spaced builds, allowing for modularity. TrustHome acts as an orchestration layer, unifying data from these distinct backends via APIs for a seamless user experience.

**UI/UX Decisions:**
- **Design Philosophy:** Mobile-native, premium, intuitive, clean, and calming with minimal UI chrome.
- **Color Scheme:** Light/dark mode with TrustHome teal (#1A8A7E). Dark mode uses ultra-deep slate-950 (#020617) background with slate-900 (#0f172a) surfaces and cyan-tinted shadows. Light mode uses clean whites/soft grays. Glassmorphism: rgba(12,18,36,0.65) dark / rgba(255,255,255,0.72) light.
- **Grid System:** True Bento grid (3-column layout) with grouped cards and horizontal carousels.
- **Card & Surface Design:** Glassmorphism with photorealistic images or rich gradients/textured backgrounds for depth, utilizing low-profile, compact cards.
- **Visual Effects & Interactions:** Includes 3D effects, hover effects, accordion/dropdowns, pill-shaped buttons, subtle micro-animations, skeleton loading, and haptic feedback.
- **Navigation:** Consistent "Back" and "Home" buttons, hamburger menu on the right, no bottom tab bar.
- **Client vs. Agent View:** Client UI is spacious and visual; Agent UI is information-dense but clean, adhering to the same premium design.
- **Offline Capability:** Critical data (transaction timelines, property shortlists, messages, documents, calendar events) cached for offline viewing.

**Technical Implementations & Design Choices:**
- **Tech Stack:** Frontend: Expo React Native (iOS, Android, web). Backend: Express.js (TypeScript). Database: PostgreSQL with Drizzle ORM. State Management: React Query and React Context. Routing: Expo Router. Real-time: WebSockets.
- **API Architecture:** REST APIs for standard operations, WebSockets for real-time, Server-Sent Events (SSE) for AI streaming. GraphQL is intentionally excluded.
- **Voice AI Architecture:** Utilizes OpenAI gpt-4o-mini-transcribe (STT), OpenAI gpt-5.2 (AI brain), and OpenAI gpt-audio with "nova" voice (TTS). Frontend uses MediaRecorder API (web only) and AudioContext for playback.
- **Security:** Role-based access control (RBAC), end-to-end encryption, document encryption with per-tenant keys, session management, rate limiting, input validation, Trust Shield integration, and audit logging.
- **Database Schema:** Multi-tenant design using `agent_id` for tenant boundary, soft deletes, comprehensive timestamps, and indexing.
- **User Roles:** Detailed role-based permission system for Agents, Clients, Vendors (Inspector, Mortgage Broker, Title Company, Appraiser, Contractor), Team Members, and Brokerage Admins.
- **Authentication:** Custom PIN-based team portal.
- **Feature Specifications:**
    - **Core Client Portal:** Onboarding, visual transaction timeline, property shortlist with comparison, showing management, blockchain-verified document vault, direct messaging, mortgage tools, neighborhood intelligence, post-close hub.
    - **Agent Dashboard:** Comprehensive CRM, lead management, showing/open house management, transaction management, AI-powered marketing hub, network/referral management, performance analytics, branding customization.
    - **Connected Verticals:** Dedicated portals for Home Inspectors, Mortgage Brokers/Lenders, Title Companies, Appraisers, and Contractors with specialized tools and guest access.
    - **Trust Layer Integration:** Utilizes custom Layer 1 blockchain for immutable transaction records, document verification via hashing, identity verification, and a comprehensive Trust Score system.

## External Dependencies
- **PaintPros.io (Ecosystem Services):** CRM, Signal Chat, Marketing Suite, SSO, Analytics backend.
- **Trust Layer Blockchain (dwsc.io):** Custom Layer 1 blockchain for trust and verification.
- **Trust Shield (trustshield.tech):** Ecosystem's security system.
- **Orbit Staffing:** Integration for bookkeeping, HR, and payroll management.
- **MLS Systems:** Integration via RESO Web API.
- **BoldTrail/kvCORE:** API connection for CRM data sync.
- **ShowingTime:** API sync for showing schedules.
- **DocuSign / Dotloop:** Integration for e-signatures.
- **Google Calendar / Apple Calendar:** Calendar synchronization.
- **Facebook & Instagram APIs:** For social media marketing automation.
- **Zillow/Realtor.com:** For listing syndication data.
- **DarkWave Media Studio:** Video walkthrough and property media production.