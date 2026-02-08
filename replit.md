# TrustHome - Master Roadmap

## Project Overview
**Purpose:** A real estate platform where the agent is the hub and every person involved in a transaction (buyer, seller, inspector, mortgage broker, title company, appraiser, contractor) is connected through one experience.

**White Label Ready:** Designed so any real estate agent or brokerage can use it - not just one agent.

**Trust Layer:** The app is part of a larger ecosystem built on a custom Layer 1 blockchain. The blockchain serves as the trust layer connecting all verticals (automotive, trades, real estate, etc.). Every vertical that deals with transactions, verifications, and professional trust will eventually plug into this blockchain.

**Key Principle:** The client experience comes first. The app is something an agent hands to their clients and says "this is how I'm different." The agent gets a powerful back-end business suite, but the client-facing side is the selling point.

---

## User Preferences
- Plan the full architecture before building
- Build with the complete picture in mind so adding features later means plugging in, not rebuilding
- Save and maintain this roadmap as the master document - update it as we go
- Think outside the box - don't settle for cookie-cutter solutions
- Consider all parties in a real estate transaction, not just agent and buyer/seller

---

## Existing Ecosystem (Already Built by User)

The user has an extensive suite of apps already built (2+ million lines of code across all projects). Many core infrastructure pieces already exist and TrustHome will plug into them rather than rebuilding from scratch.

### Already Built Tools
- **Full CRM** - A complete CRM that rivals (and intentionally exceeds) anything on the market. This will serve as the foundation for client/lead management rather than building a new CRM from scratch.
- **Signal Chat** - An ecosystem-wide chat system that works between ALL of the user's apps. This handles direct messaging, cross-app communication, and will be the communication backbone for TrustHome (agent-client chat, agent-inspector chat, etc.)
- **Marketing Suite** - Full marketing tools including automated marketing for Facebook, Instagram, and other channels. Already built and operational.
- **SSO (Single Sign-On)** - Cross-app authentication system currently being connected across all apps. Apps being used most are getting SSO treatment first. TrustHome will use this same SSO system.
- **Trust Layer Blockchain** - Custom Layer 1 blockchain built by the user. This is the connective tissue across ALL verticals (automotive, trades, real estate, etc.). Not just for real estate - it's the universal trust and verification layer.
- **Trust Shield (trustshield.tech)** - The ecosystem's security system. A full-blown security suite comparable to services like Certik. Includes:
  - Guardian Shield - comprehensive security framework
  - AI Agent Verification System - automatically red-flags suspicious activity, fraudulent behavior, or security concerns
  - Verification & certification services - the trust layer stands behind its own products with this system
  - Used for: identity verification, professional credential verification, document authenticity, transaction security
  - This is what the trust layer itself promotes beyond just being a blockchain - the SECURITY side is a core value proposition
  - TrustHome will integrate Trust Shield for: agent license verification, inspector certification verification, document authenticity checks, secure transaction records, fraud prevention

### How the Ecosystem Connects (The Big Picture)
- **Blockchain Dashboard = Home Base**: Every user in the ecosystem (agent, buyer, mechanic, retailer, inspector, etc.) logs in through SSO and lands on their blockchain dashboard
- **Membership Card**: Every verified user gets a trust layer verification/membership card. This is their identity and trust credential across the entire ecosystem
- **Cross-Vertical Navigation**: From the blockchain dashboard, users can navigate to ANY app they're involved in within the ecosystem (real estate, automotive, trades, etc.)
- **Cross-Vertical Connections**: A real estate agent can connect to a mechanic shop if they need car work. A retailer can connect to a real estate agent if they need to buy property. The verticals are separate apps but interconnected through the blockchain layer
- **The Flow**: SSO Login -> Blockchain Dashboard -> Membership Card + Trust Score -> Navigate to any vertical app -> All activity feeds back to the blockchain for trust verification
- **TrustHome's Role**: TrustHome is the REAL ESTATE vertical app within this ecosystem. It is one of many apps that all connect back to the same blockchain dashboard, same SSO, same membership card, same trust verification system
- **Other Existing Verticals**: Automotive (garage bot app), Trades, and others already built or in progress - all following this same pattern

### Ecosystem Branding
- **Trust Layer brand identity**: Navy, cyan, lavender/purple, holographic feel
- **TrustHome (real estate app)**: Should NOT use the holographic trust layer theme. Needs its own identity that's clean, professional, and approachable for a broad audience (home buyers/sellers of all ages)
- **Design decision**: Light/dark mode toggle with a premium, trustworthy color palette
- **Trust Layer visual connection**: Subtle nods to trust layer branding in trust score badges and blockchain verification indicators, so ecosystem users recognize the connection without it dominating the real estate app's look
- **White-label consideration**: TBD - whether agents can customize accent colors or if TrustHome has one unified brand identity

### TrustHome Color Scheme & Design Direction (Proposed)

**Why light/dark toggle (not trust layer holographic):**
- Real estate clients are a broad audience - all ages, all tech comfort levels
- Home buying is stressful - the app needs to feel clean and calming, not futuristic
- Agent side needs to feel professional and trustworthy ("trust me with the biggest purchase of your life")
- Both iOS and Android have system-level dark mode that users expect apps to respect
- Agents use the app at all hours - light mode during showings, dark mode at night doing admin

**Proposed Color Palette:**
- Primary accent: A warm, earthy tone that feels premium and trustworthy - options include:
  - Deep teal
  - Warm terracotta
  - Rich forest green
  - NOT the typical real estate red/blue that every brokerage uses (we want to stand out)
- Light mode: Clean whites and soft grays for backgrounds
- Dark mode: Deep charcoals and near-blacks
- Accent color stays consistent across both modes for brand identity
- Inspiration: Airbnb (warm, inviting), banking apps (trustworthy, clean), top-tier real estate apps
- Target audience consideration: A 55-year-old first-time home buyer should feel just as comfortable as a 28-year-old tech-savvy buyer

**Design Philosophy:**
- Mobile-native patterns, not web-like designs
- Minimal chrome - no cluttered headers or visible title bars (like Instagram, ChatGPT, WhatsApp)
- Premium feel without being intimidating
- Everything should be instantly intuitive - no learning curve for non-tech-savvy clients
- Final color palette to be decided before building begins

### Architecture Decision: API-First Integration (Not Embedded Code)

**Decision:** TrustHome connects to ecosystem tools via APIs, NOT by embedding code from other apps.

**How it works:**
- Each app stays standalone (its own native app in the App Store / Google Play)
- They all share the same backend infrastructure for SSO, Signal Chat, Trust Shield, etc.
- TrustHome makes API calls to the CRM backend for client/lead data
- TrustHome makes API calls to Signal Chat backend for messaging
- TrustHome makes API calls to Trust Shield for verification
- SSO handles authentication across all apps

**Existing Backend Hubs (Source of Truth):**
- **PaintPros.io** - This is where the main business hub backend lives. It contains:
  - Full CRM (tenant-spaced, already multi-app ready)
  - Marketing Hub (with analytics)
  - Extensive backend features beyond CRM and marketing
  - Already tenant-spaced and serving multiple apps
- The CRM and marketing hub currently exist (embedded) in 3-5 other apps - the long-term goal is to migrate those to the API approach as well
- Signal Chat, SSO, Trust Shield, and blockchain have their own backends/locations

**Architecture Decision: Keep Services Modular (Not Unified)**
- The CRM, Marketing Hub, Analytics, Automated Marketing, etc. are all SEPARATE builds with separate tenant spacing
- Decision: DO NOT rebuild them into one unified suite
- Reason: Preserves the ability to sell each service separately (like Salesforce sells Sales Cloud, Marketing Cloud, Service Cloud independently)
- Each service has its own PWA already set up
- For TrustHome: create a SEPARATE TENANT in EACH service
- This is the Salesforce model - modular products that integrate seamlessly but are independently purchasable
- Future verticals (inspector app, mortgage broker app) can pick and choose which services they need

**Tenant Strategy for TrustHome:**
- TrustHome = a NEW TENANT in EACH of the existing backend systems (they are separate, not one monolith)
- Create separate tenant space in: CRM, Marketing Hub, Analytics, Automated Marketing, and any other applicable service
- Connect via API using tenant-specific credentials/keys for each service
- Data flows: Each service backend (source of truth) -> its API -> TrustHome (renders in its own UI)
- The agent never knows or cares that the CRM also powers PaintPros and other apps
- To the agent, it's just "my real estate CRM" - same data engine, real estate presentation

**TrustHome API Connection Map:**
```
TrustHome App connects to:
├── CRM tenant ..................... API #1 (PaintPros.io backend)
├── Marketing Hub tenant ........... API #2 (separate backend)
├── Analytics tenant ............... API #3 (separate backend)
├── Automated Marketing tenant ..... API #4 (separate backend)
├── Signal Chat .................... API #5 (its own backend)
├── SSO ............................ API #6 (its own backend)
├── Trust Shield ................... API #7 (trustshield.tech)
└── Blockchain / Trust Layer ....... API #8 (its own backend)
```
- TrustHome's own backend acts as the ORCHESTRATION LAYER
- It knows which APIs to call and stitches data together into one seamless experience
- The user sees ONE app, not 8 backends

**Why this is better than embedding code:**
- When you update the CRM or Signal Chat, you update it ONCE in the shared backend - every app that connects to it gets the update automatically
- Each app stays lightweight and focused on its vertical
- No duplicated code across apps = no maintenance headaches
- This is exactly how Google, Apple, and every major app ecosystem works

**UI Consistency:**
- APIs return RAW DATA only (names, numbers, messages, etc.)
- TrustHome displays that data using ITS OWN UI, colors, and layout
- Users never see another app's interface - everything looks native to TrustHome
- Signal Chat messages appear in TrustHome's chat UI with TrustHome's styling
- CRM data appears in TrustHome's client management screens with TrustHome's design
- Trust Shield badges are styled to match TrustHome while keeping recognizable trust layer elements
- Result: Total visual consistency for the user, even though data comes from multiple backend systems

**Reusable UI Components (The Twist):**
- While the backend logic stays API-connected, polished UI component FILES (buttons, cards, chat bubbles, form patterns) can be shared across apps for design consistency
- Components talk to the shared backend through APIs, but the visual presentation is consistent across the ecosystem
- Each vertical app can have its own accent colors while sharing the same design language/patterns

### What This Means for TrustHome
- We do NOT need to build: CRM engine, chat system, marketing tools, authentication, or blockchain
- We DO need to build: Real estate-specific features, UI/UX for both client and agent, real estate data models, API integration layer to connect to existing ecosystem backends
- The app needs API connection points / hooks to plug into Signal Chat, the existing CRM, the marketing suite, and SSO
- The real estate vertical is the domain-specific layer that sits ON TOP of the existing infrastructure
- All ecosystem data displays in TrustHome's own UI - users experience one seamless, visually consistent app

---

## Industry Context: What RE/MAX Agents Already Use

### MAX/Tech powered by BoldTrail (formerly kvCORE) - Free to RE/MAX agents
- Smart CRM with AI-powered lead management & scoring
- IDX websites (agent-branded, customizable)
- CORE ListingMachine for automated property marketing
- Folio: AI email/transaction organizer
- Lead generation & nurturing with automated drip campaigns
- Back-office suite (transaction management, reporting, agent analytics)
- Mobile app with full CRM access

### Other RE/MAX Tools
- **MAXRefer** - AI-powered global referral platform (145,000+ agents, 110+ countries)
- **MAXEngage App** - Loyalty/engagement platform with challenges & rewards
- **RE/MAX Real Estate Search App** - Consumer-facing with AR property search
- **RE/MAX Hustle** - Video creation tool
- **Photofy** - Custom social media graphics
- **HomeView** - Post-closing client retention app

### Common Industry Tools
- **ShowingTime** - Industry standard for scheduling showings
- **DocuSign / Dotloop** - E-signatures and transaction documents
- **Cloud CMA** - Comparative market analysis presentations
- **Matterport** - 3D virtual tours
- **Follow Up Boss** - CRM for teams ($69+/user/mo)
- **Wise Agent** - Transaction checklists, lockbox tracking ($32/mo)
- **Top Producer** - MLS reporting & transaction management
- **LionDesk** - Video messaging, AI follow-ups, built-in dialer
- **RAYSE** - AI-powered transaction tracking (114+ tasks)
- **Curbhero** - Open house sign-in and follow-ups

### Key Insight
Our app should NOT try to replace MLS search or e-signatures. It should fill the gaps those tools leave wide open and serve as the connective tissue between all parties. It must integrate with or import data from existing systems.

---

## Integration & Data Import Strategy

### Priority Integrations (Direct API connections where available)
- **MLS Systems** - RESO Web API standard for listing data
- **BoldTrail/kvCORE** - CRM data sync (leads, contacts, transactions)
- **ShowingTime** - Showing schedule sync
- **DocuSign/Dotloop** - Document status and e-signature tracking
- **Google Calendar / Apple Calendar** - Calendar sync for showings and deadlines
- **Facebook & Instagram APIs** - Social media marketing automation
- **Zillow/Realtor.com** - Listing syndication data

### Data Import Capabilities (For systems without direct API)
- CSV file import for contacts, leads, transaction history
- Photo/document upload (bulk import)
- Manual entry with smart forms
- Copy/paste data parsing (intelligent field detection)
- Future: OCR/AI-powered document scanning to extract data from photos of paperwork

### Integration Philosophy
- Plug and play with existing systems - agents should not have to abandon what they already use
- Data flows IN from their current tools, and our app adds value on top
- If a direct API connection exists, use it
- If not, provide easy import tools (CSV, manual entry, photo scan)
- Never create data silos - information should be accessible and exportable

---

## COMPLETE FEATURE MAP

### MODULE 1: CLIENT PORTAL (Buyer/Seller Experience)

#### 1A. Onboarding & Profile
- Client creates account via agent's invite link
- Buyer profile: budget range, must-haves, deal-breakers, preferred neighborhoods, pre-approval status, timeline
- Seller profile: property details, desired price, timeline, condition notes
- Profile stays with client even if they switch agents (their data, their ownership)

#### 1B. Transaction Timeline
- Visual step-by-step tracker (like package delivery tracker for home buying/selling)
- Stages: Pre-Approval, Home Search, Offer, Under Contract, Inspection, Appraisal, Final Walkthrough, Closing, Post-Close
- Each stage shows: what's happening now, what's next, who's responsible, estimated dates
- Push notifications when stages update
- Documents attached to each stage

#### 1C. Property Shortlist
- Agent pushes properties to client's shortlist (curated picks, not raw MLS search)
- Client can favorite, reject, or add notes
- Side-by-side comparison tool (price, sq ft, beds, baths, commute time, school ratings)
- Photo gallery for each property
- Map view showing all shortlisted properties

#### 1D. Showing Schedule
- Calendar view of upcoming showings
- Address, time, agent notes, map/directions
- Client can request reschedule
- Post-showing feedback form (rate 1-5, notes, "would you make an offer?")
- History of past showings with notes preserved

#### 1E. Open House Browser
- All of the agent's upcoming open houses
- RSVP capability
- Address, photos, details, directions
- Post-visit feedback

#### 1F. Document Vault
- All transaction documents in one place
- Contracts, disclosures, inspection reports, appraisal, title docs
- Status indicators (needs signature, completed, pending)
- Secure sharing - only parties involved can see relevant docs
- **TRUST LAYER CONNECTION**: Document hashes stored on blockchain for verification

#### 1G. Direct Messaging
- In-app chat with their agent
- Can also message inspector, mortgage broker (if connected)
- Message history preserved
- Photo/file sharing within chat

#### 1H. Mortgage Tools
- Monthly payment calculator
- Affordability estimator
- Pre-approval status tracker
- Direct connection to mortgage broker (when that vertical is built)

#### 1I. Neighborhood Intelligence
- School ratings and distances
- Nearby amenities (grocery, restaurants, parks, gyms)
- Commute time calculator
- Crime stats
- Walk/bike/transit scores
- Recent comparable sales

#### 1J. Post-Close Hub
- Home maintenance reminders
- Warranty tracker
- Service provider recommendations (from agent's trusted network)
- Home value tracker over time
- Anniversary reminders (agent stays connected for referrals)

---

### MODULE 2: AGENT DASHBOARD (Business Suite)

#### 2A. Client Management (CRM)
- All active clients with status at a glance
- Pipeline view: Lead, Active Buyer, Active Seller, Under Contract, Closed
- Client profiles with full history, notes, communication log
- Assign tasks to clients (upload docs, complete pre-approval, etc.)
- Client activity feed (they favorited a property, left showing feedback, etc.)

#### 2B. Lead Management
- New inquiry capture (from open houses, referrals, website, social media)
- Lead scoring (hot, warm, cold based on engagement)
- Automated follow-up reminders
- Lead source tracking (know what's working)
- Convert lead to active client with one tap

#### 2C. Showing & Open House Manager
- Schedule showings across all clients
- Open house creation with details, photos, marketing materials
- Attendance tracking (who showed up)
- Feedback collection and review
- Calendar integration

#### 2D. Transaction Manager
- Active transactions dashboard
- Deadline tracker (inspection deadline, appraisal due, closing date)
- Checklist per transaction (customizable templates)
- Party management (who's the lender, inspector, title company for each deal)
- **TRUST LAYER CONNECTION**: Transaction milestones recorded on blockchain

#### 2E. Marketing Hub
- Social media post creator (listing announcements, just sold, open house promos)
- Template library (customizable with agent branding)
- Post scheduling for Facebook and Instagram
- Email campaign builder (new listing alerts, market updates, newsletters)
- Performance tracking (which posts/emails got engagement)
- Auto-generate marketing copy with AI

#### 2F. Network & Referral Management
- Trusted vendor directory (inspectors, mortgage brokers, contractors, title companies, photographers)
- Rate and review vendors
- Refer clients to vendors directly through the app
- Track referral fees
- **TRUST LAYER CONNECTION**: Vendor ratings and transaction history on blockchain

#### 2G. Performance Analytics
- Closings this month/quarter/year
- Average days on market
- Commission tracker
- Client satisfaction scores
- Lead conversion rates
- Revenue by source

#### 2H. Branding & White Label
- Agent profile with photo, bio, certifications, testimonials
- Custom color scheme/branding
- Shareable agent landing page
- QR code for client onboarding

---

### MODULE 3: CONNECTED VERTICALS (The Ecosystem)

#### 3A. Home Inspector Portal
- Receives inspection assignments from agents
- Uploads inspection reports directly to the transaction
- Scheduling coordination with buyer and agent
- Rating and review system
- **TRUST LAYER**: Inspection results and certifications verified on blockchain

#### 3B. Mortgage Broker Portal
- Pre-approval status updates pushed to agent and client
- Document requests sent to client through the app
- Rate quotes and comparisons
- Loan progress tracker
- **TRUST LAYER**: Pre-approval verifications on blockchain

#### 3C. Title Company Portal
- Title search status updates
- Document preparation and delivery
- Closing scheduling
- Fee transparency
- **TRUST LAYER**: Title verification on blockchain

#### 3D. Appraiser Portal
- Appraisal scheduling
- Report delivery
- Comparable analysis sharing
- **TRUST LAYER**: Appraisal records on blockchain

#### 3E. Contractor/Service Provider Portal
- For post-close home services
- Quote requests from homeowners
- Job tracking
- Rating and review system
- **TRUST LAYER**: Service history and reviews on blockchain

---

### MODULE 4: TRUST LAYER INTEGRATION (Blockchain)

#### 4A. Blockchain Foundation
- Transaction records (immutable history of every deal)
- Document verification (hash-based proof that documents haven't been altered)
- Identity verification (agent licenses, inspector certifications, broker credentials)
- Smart contracts for referral fees, commission splits
- Transparent audit trail across all parties

#### 4B. Trust Score System
- Agents, inspectors, brokers all build verifiable reputation
- Based on actual transaction data, not just reviews
- Portable across the platform - your reputation follows you
- Clients can see trust scores when choosing professionals

---

## BUILD PHASES

### Phase 1: Core Client Portal + Agent Dashboard Foundation
- Client: Onboarding, transaction timeline, showing schedule, direct messaging
- Agent: Client management, showing manager, lead tracking
- Navigation structure for both client and agent modes
- Data models designed for full ecosystem from day one

### Phase 2: Property Features + Open Houses
- Client: Property shortlist, comparison tool, open house browser
- Agent: Open house manager, property push to clients

### Phase 3: Documents + Mortgage Tools
- Client: Document vault, mortgage calculator
- Agent: Transaction manager with deadlines and checklists

### Phase 4: Marketing Hub
- Social media post creator, templates, scheduling
- Email campaigns, AI-generated copy

### Phase 5: Analytics + Neighborhood Intelligence
- Agent: Performance dashboard, revenue tracking
- Client: Neighborhood data, school ratings, commute times

### Phase 6: Post-Close + Retention
- Home maintenance reminders, warranty tracking
- Service provider recommendations, home value tracker

### Phase 7: Connected Verticals
- Inspector, mortgage broker, title company portals
- Cross-party communication and document flow

### Phase 8: Blockchain Trust Layer Integration
- Connect to existing L1 blockchain
- Document hashing, transaction records, trust scores

### Phase 9: Integration Layer
- MLS/RESO Web API integration
- BoldTrail/kvCORE data sync
- ShowingTime sync
- DocuSign/Dotloop integration
- Calendar sync
- Social media API connections
- CSV import/export tools
- Data migration utilities

---

## PRICING & MONETIZATION STRATEGY

### Industry Pricing Benchmarks (What competitors charge)

| Platform | Type | Price | Notes |
|----------|------|-------|-------|
| BoldTrail/kvCORE | All-in-one (CRM + IDX + marketing) | $499-750/mo solo, $1,200+/mo teams | Free for RE/MAX agents |
| Follow Up Boss | CRM focused | $69/user/mo | Popular with high-volume teams |
| Wise Agent | CRM + transaction | $32-49/mo | Budget solo agents |
| LionDesk | CRM + AI follow-ups | $25-75/mo | Mid-range |
| Top Producer | MLS + transaction mgmt | $40-50/user/mo | MLS integration |
| CINC | Premium lead gen + CRM | $1,000-2,000+/mo | Includes buyer leads |
| Real Geeks | IDX website + CRM | $249+/mo | Lead gen focused |
| RAYSE | AI transaction tracking | Subscription | 114+ automated tasks |
| ShowingTime | Showing management | Subscription | Industry standard |

### Key Pricing Insights
- Solo agents typically pay $50-150/mo for single-purpose tools
- All-in-one platforms command $200-500/mo but face resistance from agents with existing stacks
- Agents earn $50K-500K+ annually, so pricing tolerance is high for ROI-driven tools
- Freemium or 14-day trials are standard for onboarding
- Per-seat pricing works for small teams; tiered flat-rate works for larger brokerages

### TrustHome Pricing Decisions Needed

**For Clients (Buyers/Sellers):**
- Should the client app be FREE? (Most likely yes - it's the agent's selling point)
- Or should some premium client features be subscription? (mortgage tools, neighborhood intelligence, post-close hub)

**For Agents:**
- Tiered subscription model seems most appropriate given the feature depth
- Possible tiers:
  - **Starter** ($49-79/mo): Core client portal, basic showing management, transaction timeline, limited clients
  - **Professional** ($149-199/mo): Full CRM integration, marketing hub, unlimited clients, analytics
  - **Team/Brokerage** ($299-499/mo): Multi-agent support, white-label branding, advanced analytics, API access
  - **Enterprise** (Custom): Full white-label, dedicated support, custom integrations

**For Connected Verticals (Inspectors, Mortgage Brokers, etc.):**
- Could be free to encourage adoption (network effect)
- Or small subscription ($19-39/mo) for their portal
- Or per-transaction fee model

**Standard vs. Subscription Features - Key Question:**
- Is Signal Chat (agent-client communication) standard or subscription?
- Options: Standard for all tiers (drives adoption), or premium feature for Pro+ tiers
- Recommendation: Make messaging STANDARD - it's the core value proposition. Charge for advanced features like marketing automation, analytics, and multi-agent support.

### Revenue Model Options
1. **SaaS Subscription** (primary) - Monthly/annual agent subscriptions
2. **Transaction Fees** - Small fee per closed transaction recorded on trust layer
3. **Referral Fees** - Percentage of referral fees processed through the platform
4. **Premium Integrations** - Charge for MLS sync, BoldTrail sync, etc.
5. **White Label Licensing** - Brokerages pay premium for full branding customization

---

## OPEN QUESTIONS & FUTURE CONSIDERATIONS
- What specific MLS system does the sister's market use?
- What additional data points would be useful for the trust layer?
- How will the app handle multiple agents in the same brokerage?
- Multi-language support needed?
- What level of branding customization for white-label?
- How does Signal Chat integrate? API endpoints? WebSocket? What's the connection protocol?
- What does the existing CRM's data model look like? What fields/entities does it track?
- What's the SSO protocol? OAuth2? JWT? Custom?
- User's protocol layout details (pending - user will share next)

---

## Technical Notes
- Stack: Expo React Native (mobile) + Express (backend)
- Database: PostgreSQL with Drizzle ORM
- File-based routing with Expo Router
- State management: React Query + AsyncStorage + React Context
- Authentication: TBD (likely role-based: client vs agent vs vendor)

---

*Last Updated: February 8, 2026*
*Status: PLANNING PHASE - Architecture and feature mapping in progress. No building has started.*
