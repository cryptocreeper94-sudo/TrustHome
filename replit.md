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

### Protocol Layout (UI/UX Design Specification)

**Grid System:**
- True Bento grid, 3-column layout
- Content organized in grouped cards/boxes within the grid
- When grouped cards exceed the screen width, they go into horizontal carousels
- Within the Bento grid itself (e.g., a 1-of-3-column slot), use self-contained carousels for overflow content
- NO vertical stacking of full-width horizontal boxes/cards - that's cookie-cutter 1998 web design

**Card & Surface Design:**
- Glassmorphism throughout
- Every card has a photorealistic image OR a rich gradient/textured background - never just a plain translucent card with nothing behind it
- Images should match the subject matter of the card content
- If not an image, use gradient backgrounds or visual treatments that create depth and fullness
- This applies everywhere, to everything - no exceptions
- Low-profile cards and banners - tight, compact, not bloated or oversized

**Visual Effects & Interactions:**
- 3D effects and hover effects throughout
- Accordion/dropdown menus where contextually appropriate
- Pill-shaped buttons (not rectangular, not square-cornered)
- The overall feel should be "sparkling gold" - not literally gold-colored, but that sense of premium value, like holding something impressive and valuable
- No cookie-cutter design. Every element should feel intentional and crafted

**Information Architecture:**
- Modal information buttons (i-buttons) on anything that needs explanation or context
- Modals should describe what the element is, explain it, give examples, provide details - whatever is needed to make it crystal clear
- This is especially important for real estate terminology, trust scores, blockchain verification, and other concepts that may be unfamiliar to clients

**Navigation:**
- Consistent navigation on every screen
- Clear Back button - takes you back to WHERE YOU WERE (not to home, not to some random page)
- Home button - always available
- Close button - for modals, overlays, and detail views
- Hamburger menu on the RIGHT side of the header - contains full navigation
- Header contains ONLY: hamburger menu (right side) + app title ("TrustHome") - nothing else
- No bottom tab bar cluttering the screen
- Navigation should be intuitive - user never gets lost, never trapped in a screen

**Mobile-First Principles:**
- Designed for mobile first, scales up to tablet
- Touch-friendly targets
- Swipe gestures where natural (carousels, dismissing modals, etc.)
- Content prioritized for small screens - most important info visible first

**The Standard:**
- Ultimate premium UI/UX - no compromises
- Every screen should make someone say "this is impressive"
- Think Airbnb, top banking apps, premium fintech - that caliber of polish
- If it looks like a template or a basic app, it's not good enough

**Client View vs Agent View - Layout Density:**
- Client-facing UI: More breathing room, less dense, calmer, more visual. The client is likely stressed (buying/selling a home) and may not be tech-savvy. Every screen should feel simple and welcoming. Fewer items visible at once, larger touch targets, more whitespace. Think "luxury hotel lobby" - spacious, clear, you know exactly where to go.
- Agent-facing UI: Can be more information-dense since agents are power users, but still must be clean and easy to use. NOT a cramped spreadsheet. NOT a cluttered dashboard with 25 widgets. Think "premium cockpit" - lots of controls, but everything is organized, labeled, and within reach. Still follows the same Bento grid / glassmorphism / premium design language.
- Both views: Same design system, same visual identity, same premium feel. The difference is density and complexity, not quality.
- Anti-pattern to avoid: Facebook-style design where features are buried, navigation is confusing, and the user has to fight the interface. If someone has to think about how to use it, it's wrong.
- Guiding principle: "I can look at this and say it's easy to use" - that's the test for every screen, both client and agent side.

**Additional Considerations (Agreed):**
- Pull-to-refresh on data screens (transactions, messages, listings)
- Subtle micro-animations on state changes (card loading, data updating, button presses)
- Skeleton loading states (shimmer effect) instead of plain loading spinners - these are the subtle animated placeholder shapes you see while content loads, much more polished than a spinning wheel
- Haptic feedback on key actions (iOS) - the little vibration/tap you feel when you press a button, like when you long-press an app icon
- Smooth page transitions (not just hard cuts between screens) - screens slide or fade in/out instead of just appearing
- Search functionality - global search accessible from header or gesture
- Designed empty states - when there's no data yet (no transactions, no messages), the screen still looks good with a helpful message, not just blank
- Helpful error states - if something goes wrong, the app tells you what happened and what to do about it, not just a red error message

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

## USER ROLES & PERMISSIONS

### Role Architecture
TrustHome has a layered permission system. Every user has a role, and that role determines what they see, what they can do, and what data they can access. The key principle: **nobody sees more than they need to.**

### Role 1: Agent (The Hub)
**Who they are:** The real estate agent. This is the primary subscriber and power user. The agent is the center of every transaction.
**What they see:**
- Full agent dashboard with all their clients, leads, transactions, showings, open houses
- CRM data (connected via API)
- Marketing tools (connected via API)
- Analytics and performance data
- All communications across all their transactions
- Vendor directory and ratings
- Branding/white-label settings
**What they can do:**
- Invite clients, connect vendors, manage all parties in a transaction
- Create and manage listings, showings, open houses
- Push properties to client shortlists
- Send messages to anyone in their network
- View and manage all documents across all transactions
- Access marketing tools, analytics, lead management
- Customize their branding
- Manage team members (Team/Brokerage tier)
**What they cannot do:**
- See other agents' data (unless Brokerage Admin grants access)
- Modify vendor-uploaded documents (inspection reports, appraisals, etc.)

### Role 2: Client (Buyer or Seller)
**Who they are:** The person buying or selling a home. Invited by their agent.
**What they see:**
- ONLY their own transaction(s) - their timeline, their documents, their messages
- Their property shortlist and comparison tools
- Their showing schedule and history
- Neighborhood intelligence for properties they're considering
- Mortgage calculator tools
- Post-close hub (after closing)
**What they can do:**
- View transaction progress and timeline
- Favorite/reject/comment on properties
- Request showing reschedules
- Submit post-showing feedback
- Upload requested documents
- Message their agent
- Message connected vendors (inspector, mortgage broker) within their transaction
- Access their document vault
**What they cannot do:**
- See other clients' data
- See agent's business info (other deals, revenue, lead pipeline)
- Invite other users
- Access marketing, analytics, or CRM features
- See vendor business data beyond what's relevant to their deal

### Role 3: Inspector (Subscriber or Guest)
**Subscriber:** Full inspector vertical with dashboard, pipeline, report builder, scheduling, revenue tracking, marketing tools
**Guest:** Limited to specific assignment - view property details, upload report, communicate about that inspection
**In either case, they can:**
- View property details for their assigned inspections
- Upload inspection reports
- Communicate with agent (and client if permitted)
- Update scheduling/status
**What they cannot see:**
- Financial details of the deal (offer price, loan terms, etc.)
- Client personal info beyond name and contact for scheduling
- Other transactions they're not assigned to
- Agent's business data

### Role 4: Mortgage Broker / Lender (Subscriber or Guest)
**Subscriber:** Full lending vertical with pipeline, document management, rate tools, agent relationship tracking
**Guest:** Limited to specific transaction - update loan status, upload documents, communicate
**In either case, they can:**
- View relevant financial information for their assigned transactions
- Update pre-approval and loan status
- Upload and request documents
- Communicate with agent and client about financing
**What they cannot see:**
- Inspection reports (unless agent shares)
- Other transaction details beyond financing
- Agent's other clients or business data

### Role 5: Title Company (Subscriber or Guest)
**Subscriber:** Full title vertical with pipeline, closing management, document prep
**Guest:** Limited to specific closing - update status, upload documents, schedule
**In either case, they can:**
- View property and party information needed for title search and closing
- Upload title documents and closing paperwork
- Schedule closing
- Communicate with agent about closing details
**What they cannot see:**
- Inspection results
- Full financial terms beyond what's needed for closing
- Agent's other transactions or business data

### Role 6: Appraiser (Subscriber or Guest)
**Subscriber:** Full appraiser vertical with pipeline, comp tools, report builder
**Guest:** Limited to specific appraisal - upload report, communicate
**Permissions similar to Inspector** - focused on their specific assignment

### Role 7: Contractor / Service Provider (Subscriber or Guest)
**Subscriber:** Full service provider vertical with job pipeline, quoting, portfolio, marketing
**Guest:** Limited to specific job referral - submit quote, communicate
**Context:** Primarily post-close (home repairs, renovations, maintenance) but could also be pre-close (repair negotiations)

### Role 8: Team Member / Assistant (Under an Agent)
**Who they are:** Junior agents or admin staff working under a lead agent (Team/Brokerage tier)
**Permissions:** Configurable by the lead agent. Can range from:
- Read-only access to specific clients
- Full management access to all clients
- Marketing tools access
- Analytics access
- Anything the lead agent chooses to grant
**What they cannot do:**
- Override the lead agent's settings
- Access billing or subscription management
- Invite or remove other team members (only lead agent can)

### Role 9: Brokerage Admin (Enterprise Tier - Future)
**Who they are:** Brokerage management overseeing multiple agents
**What they see:**
- Aggregate performance data across all agents in the brokerage
- Compliance and transaction oversight
- Brokerage-wide analytics
**What they can do:**
- View (not modify) individual agent dashboards for compliance
- Set brokerage-wide branding
- Manage agent accounts within the brokerage
**What they cannot do:**
- Modify individual agent's client data or transactions
- Communicate with clients on behalf of agents (unless explicitly delegated)

### Communication Permissions Matrix
| Sender → Receiver | Agent | Client | Inspector | Mortgage | Title | Appraiser | Contractor |
|---|---|---|---|---|---|---|---|
| **Agent** | - | Yes | Yes | Yes | Yes | Yes | Yes |
| **Client** | Yes (their agent) | - | Yes (in their deal) | Yes (in their deal) | Limited | Limited | Yes (post-close) |
| **Inspector** | Yes (assigned agent) | Via agent | - | No | No | No | No |
| **Mortgage** | Yes (assigned agent) | Yes (in deal) | No | - | Yes (for closing) | No | No |
| **Title** | Yes (assigned agent) | Limited | No | Yes (for closing) | - | No | No |
| **Appraiser** | Yes (assigned agent) | No | No | No | No | - | No |
| **Contractor** | Yes (referring agent) | Yes (homeowner) | No | No | No | No | - |

### Key Principle: Data Ownership
- Clients OWN their personal data and transaction history - it stays with them even if they switch agents
- Agents OWN their business data (leads, analytics, marketing content)
- Vendors OWN their professional data (reports, ratings, certifications)
- The platform connects these ownership boundaries without violating them

---

## DATA MODELS (Field-Level Definitions)

### Transaction
```
Transaction {
  id: UUID
  type: "residential_buy" | "residential_sell" | "commercial_buy" | "commercial_sell" | "lease"
  status: "pre_approval" | "searching" | "offer_submitted" | "offer_accepted" | "under_contract" | "inspection" | "appraisal" | "final_walkthrough" | "closing" | "closed" | "cancelled" | "expired"
  property_id: UUID (linked property)
  agent_id: UUID (lead agent)
  client_id: UUID (buyer or seller)
  
  // Financial
  listing_price: number
  offer_price: number (null until offer made)
  final_price: number (null until closed)
  earnest_money: number
  commission_rate: number
  commission_amount: number (calculated)
  
  // Dates & Deadlines
  listing_date: date
  offer_date: date
  acceptance_date: date
  inspection_deadline: date
  appraisal_deadline: date
  financing_contingency_date: date
  closing_date: date
  actual_close_date: date
  possession_date: date
  
  // Connected Parties
  inspector_id: UUID (nullable)
  mortgage_broker_id: UUID (nullable)
  title_company_id: UUID (nullable)
  appraiser_id: UUID (nullable)
  buyer_agent_id: UUID (nullable, for sell-side transactions)
  seller_agent_id: UUID (nullable, for buy-side transactions)
  
  // Trust Layer
  blockchain_tx_hash: string (nullable)
  trust_score_snapshot: number
  
  // Meta
  notes: text
  tags: string[] (e.g., "first-time-buyer", "investment", "relocation")
  created_at: timestamp
  updated_at: timestamp
}
```

### Client Profile
```
ClientProfile {
  id: UUID
  user_id: UUID (linked to auth user)
  role: "buyer" | "seller" | "both"
  agent_id: UUID (their assigned agent)
  
  // Personal
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url: string (nullable)
  
  // Buyer-specific
  budget_min: number (nullable)
  budget_max: number (nullable)
  pre_approved: boolean
  pre_approval_amount: number (nullable)
  pre_approval_lender: string (nullable)
  pre_approval_expiry: date (nullable)
  must_haves: string[] (e.g., "3+ bedrooms", "garage", "good schools")
  deal_breakers: string[] (e.g., "HOA over $500", "no basement")
  preferred_neighborhoods: string[]
  move_timeline: "asap" | "1-3_months" | "3-6_months" | "6-12_months" | "just_looking"
  property_type_preference: "single_family" | "condo" | "townhouse" | "multi_family" | "any"
  
  // Seller-specific
  current_property_id: UUID (nullable)
  reason_for_selling: string (nullable)
  desired_price: number (nullable)
  
  // Status
  status: "active" | "inactive" | "closed" | "archived"
  source: "referral" | "open_house" | "website" | "social_media" | "cold_call" | "walk_in" | "other"
  
  // Trust Layer
  trust_score: number (nullable)
  blockchain_identity_hash: string (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Property
```
Property {
  id: UUID
  mls_number: string (nullable - may not have MLS listing)
  
  // Address
  street_address: string
  unit: string (nullable)
  city: string
  state: string
  zip: string
  county: string
  latitude: number
  longitude: number
  
  // Details
  property_type: "single_family" | "condo" | "townhouse" | "multi_family" | "commercial" | "land" | "other"
  bedrooms: number
  bathrooms: number
  half_baths: number
  sqft: number
  lot_size: number (nullable)
  year_built: number
  stories: number
  garage_spaces: number
  parking_type: string (nullable)
  
  // Financials
  listing_price: number
  price_per_sqft: number (calculated)
  hoa_fee: number (nullable)
  annual_taxes: number
  estimated_insurance: number (nullable)
  
  // Features
  features: string[] (e.g., "pool", "fireplace", "hardwood floors", "updated kitchen")
  heating_type: string
  cooling_type: string
  construction_type: string
  roof_type: string
  
  // Media
  photos: string[] (URLs)
  virtual_tour_url: string (nullable)
  floor_plan_url: string (nullable)
  
  // Neighborhood
  school_district: string (nullable)
  walk_score: number (nullable)
  transit_score: number (nullable)
  bike_score: number (nullable)
  
  // Status
  listing_status: "coming_soon" | "active" | "pending" | "under_contract" | "sold" | "withdrawn" | "expired"
  days_on_market: number (calculated)
  
  // Trust Layer
  blockchain_property_hash: string (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Showing
```
Showing {
  id: UUID
  property_id: UUID
  transaction_id: UUID (nullable - may be before a transaction exists)
  agent_id: UUID
  client_id: UUID
  
  date: date
  start_time: time
  end_time: time
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
  
  // Details
  showing_type: "private" | "second_showing" | "final_walkthrough"
  notes_for_client: text (nullable)
  agent_private_notes: text (nullable)
  
  // Feedback (filled after showing)
  client_rating: number (1-5, nullable)
  client_feedback: text (nullable)
  would_make_offer: boolean (nullable)
  agent_feedback: text (nullable)
  
  // Logistics
  lockbox_code: string (nullable, agent-only visibility)
  special_instructions: text (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Open House
```
OpenHouse {
  id: UUID
  property_id: UUID
  agent_id: UUID
  
  date: date
  start_time: time
  end_time: time
  status: "scheduled" | "active" | "completed" | "cancelled"
  
  // Details
  description: text
  refreshments: boolean
  virtual_option: boolean
  virtual_link: string (nullable)
  
  // Attendance
  attendees: [{
    name: string
    email: string (nullable)
    phone: string (nullable)
    registered_via: "app" | "walk_in" | "sign_in_sheet"
    feedback: text (nullable)
    rating: number (nullable)
    interested: boolean (nullable)
    converted_to_lead: boolean
  }]
  
  // Marketing
  flyer_url: string (nullable)
  social_post_ids: string[] (nullable)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Lead
```
Lead {
  id: UUID
  agent_id: UUID
  
  // Contact
  first_name: string
  last_name: string
  email: string (nullable)
  phone: string (nullable)
  
  // Lead Info
  source: "open_house" | "referral" | "website" | "social_media" | "cold_call" | "walk_in" | "ad_campaign" | "other"
  source_detail: string (nullable, e.g., "Spring Open House at 123 Main St")
  status: "new" | "contacted" | "qualifying" | "qualified" | "nurturing" | "converted" | "lost" | "dead"
  temperature: "hot" | "warm" | "cold"
  
  // Qualification
  buyer_or_seller: "buyer" | "seller" | "both" | "unknown"
  budget_range: string (nullable)
  timeline: string (nullable)
  pre_approved: boolean (nullable)
  
  // Activity
  last_contact_date: date (nullable)
  next_follow_up_date: date (nullable)
  follow_up_count: number
  notes: text (nullable)
  
  // Conversion
  converted_to_client_id: UUID (nullable, when lead becomes active client)
  lost_reason: string (nullable, e.g., "went with another agent", "not ready", "unresponsive")
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Document
```
Document {
  id: UUID
  transaction_id: UUID
  uploaded_by_user_id: UUID
  uploaded_by_role: "agent" | "client" | "inspector" | "mortgage_broker" | "title_company" | "appraiser"
  
  // File
  file_name: string
  file_url: string
  file_type: "pdf" | "image" | "doc" | "other"
  file_size: number (bytes)
  
  // Classification
  document_type: "contract" | "disclosure" | "inspection_report" | "appraisal" | "pre_approval_letter" | "title_report" | "closing_document" | "amendment" | "addendum" | "photo" | "other"
  transaction_stage: string (which stage this doc belongs to)
  
  // Status
  status: "draft" | "pending_review" | "pending_signature" | "signed" | "completed" | "rejected" | "expired"
  requires_signature: boolean
  signature_provider: "docusign" | "dotloop" | "in_app" | "none" (nullable)
  signature_status: string (nullable)
  
  // Visibility
  visible_to_roles: string[] (which roles can see this document)
  
  // Trust Layer
  blockchain_hash: string (nullable, for verification that document hasn't been altered)
  verified: boolean
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Message
```
Message {
  id: UUID
  conversation_id: UUID
  sender_id: UUID
  sender_role: string
  
  // Content
  content: text
  message_type: "text" | "image" | "file" | "system" | "notification"
  attachment_url: string (nullable)
  attachment_type: string (nullable)
  
  // Context
  transaction_id: UUID (nullable, messages can be general or transaction-specific)
  
  // Status
  read: boolean
  read_at: timestamp (nullable)
  delivered: boolean
  
  // Signal Chat Integration
  signal_message_id: string (nullable, maps to Signal Chat backend)
  
  created_at: timestamp
}

Conversation {
  id: UUID
  participants: UUID[] (user IDs)
  transaction_id: UUID (nullable)
  type: "direct" | "group" | "transaction"
  title: string (nullable, for group conversations)
  last_message_at: timestamp
  created_at: timestamp
}
```

### Vendor (Inspector, Mortgage Broker, Title Company, etc.)
```
Vendor {
  id: UUID
  user_id: UUID (linked to auth user)
  vendor_type: "inspector" | "mortgage_broker" | "title_company" | "appraiser" | "contractor" | "photographer" | "stager" | "other"
  subscription_status: "subscriber" | "guest" | "trial"
  
  // Business Info
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  website: string (nullable)
  avatar_url: string (nullable)
  
  // Location & Service Area
  address: string
  city: string
  state: string
  zip: string
  service_radius_miles: number
  service_areas: string[] (zip codes or city names)
  
  // Credentials
  license_number: string (nullable)
  license_state: string (nullable)
  license_expiry: date (nullable)
  certifications: string[] (e.g., "ASHI Certified", "FHA Approved")
  insurance_verified: boolean
  years_experience: number
  
  // Ratings
  trust_score: number (from trust layer)
  average_rating: number (from in-app reviews)
  total_reviews: number
  total_transactions: number (on platform)
  
  // Specialties (varies by vendor type)
  specialties: string[] (e.g., inspector: "radon", "mold", "structural"; contractor: "roofing", "plumbing")
  
  // Trust Layer
  blockchain_credential_hash: string (nullable)
  verified: boolean
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Trust Score
```
TrustScore {
  id: UUID
  user_id: UUID
  user_role: string
  
  // Score
  overall_score: number (0-100)
  
  // Components (weighted)
  transaction_history_score: number (based on completed transactions)
  review_score: number (based on peer reviews)
  verification_score: number (based on credential verification)
  response_time_score: number (based on communication responsiveness)
  document_accuracy_score: number (based on document handling)
  
  // History
  score_history: [{
    date: date
    score: number
    change_reason: string
  }]
  
  // Trust Layer
  blockchain_score_hash: string
  last_verified: timestamp
  
  updated_at: timestamp
}
```

---

## EDGE CASES & ERROR HANDLING

### Deal Falls Through
- Transaction status changes to "cancelled" with a reason code
- Reason options: "inspection_issues", "financing_fell_through", "appraisal_low", "buyer_cold_feet", "seller_withdrew", "contingency_not_met", "mutual_agreement", "other"
- All documents remain accessible (read-only) for record-keeping
- Timeline shows cancellation point with reason
- Agent gets notification, client gets notification
- Lead status optionally reverts to "nurturing" (buyer may want to keep looking)
- Earnest money disposition tracked (returned to buyer, released to seller, disputed)
- Transaction remains in history, never deleted (important for trust score and analytics)
- Agent can "restart" search for the same client without losing history

### Client Switches Agents
- Client's profile and personal data stays with the client (they own it)
- Transaction history from previous agent is retained (read-only)
- Previous agent loses access to client's profile
- New agent gets a clean start with the client but can see the client's self-reported preferences
- Documents from previous transactions remain with those transactions (previous agent can still access their own transaction records)
- Trust score for both agent and client is unaffected
- The switch is recorded for analytics but not publicly visible

### Inspector Cancels
- Agent and client get immediate notification
- Showing/inspection slot opens up on calendar
- Agent can reassign to another inspector from vendor directory
- If inspection deadline is at risk, the system flags it with urgency
- Cancelled inspector's rating may be affected (if pattern of cancellations)
- Replacement inspector gets all relevant property details automatically

### Document Disputed
- Document flagged with "disputed" status
- Both parties notified
- Dispute reason recorded (e.g., "terms don't match verbal agreement", "missing addendum", "unauthorized changes")
- Document version history preserved (if multiple versions exist)
- Trust Shield verification can confirm if document was altered after signing
- Agent mediates by default; escalation path if needed
- Disputed documents cannot be used for closing until resolved

### Expired Listings
- Auto-status change to "expired" when listing date passes
- Agent notified with option to renew, withdraw, or relist
- Client notified that their listing has expired
- Property data preserved for relisting (agent can clone with updates)
- Days on market counter reflects total time (including any gaps between listings)
- If buyer was interested, agent can notify them if relisted

### Lead Goes Cold
- After configurable period of no response (default: 30 days), status auto-changes to "cold"
- Agent gets reminder before cold status triggers
- Lead moves to "nurturing" pipeline with lower-touch follow-up cadence
- Agent can manually override to keep lead at any temperature
- After extended cold period (configurable, default: 90 days), lead status changes to "dead"
- Dead leads can be resurrected at any time
- All communication history preserved regardless of status

### Dual Agency (Agent Represents Both Buyer and Seller)
- Must be explicitly flagged on the transaction (legal requirement in most states)
- Both buyer and seller must acknowledge dual agency status (documented)
- Agent sees both sides of the transaction but with clear visual separation
- Certain information remains confidential per side (e.g., buyer's max budget not visible on seller side, seller's minimum acceptable price not visible on buyer side)
- Communication channels remain separate (buyer conversation vs seller conversation)
- The system tracks dual agency for compliance and disclosure purposes
- Some states prohibit dual agency - the system should be aware of state regulations (configurable per state)

### Additional Edge Cases
- **Multiple offers on a property:** Agent can track all offers with status (submitted, countered, accepted, rejected, expired)
- **Backup offers:** If primary offer falls through, backup offer auto-promotes to primary
- **Co-listing agents:** Multiple agents can be assigned to a listing with defined roles (primary, co-listing)
- **Referral from another agent:** Referral fee tracking, referral source attribution
- **Client buying AND selling simultaneously:** Linked transactions with coordinated timelines
- **Cash buyer (no mortgage):** Mortgage-related steps automatically hidden/skipped
- **New construction:** Different timeline (no inspection of existing structure, builder warranty instead)
- **Short sale / foreclosure:** Additional steps for bank approval, different timeline expectations
- **Investment property:** Different tax implications flagged, rental income projections

---

## NOTIFICATION STRATEGY

### Delivery Channels
1. **Push notifications (mobile)** - For urgent, time-sensitive items
2. **In-app notifications** - For all activity (notification center with bell icon)
3. **Signal Chat messages** - For communications between parties (via API)
4. **Email** - For daily/weekly digests and important milestones (future integration)

### Notification Triggers by Role

**Agent receives notifications when:**
- New lead comes in (from any source) - PUSH
- Client favorites or rejects a property - IN-APP
- Client submits showing feedback - PUSH
- Client uploads a document - IN-APP
- Client sends a message - PUSH
- Transaction deadline approaching (7 day, 3 day, 1 day, day-of) - PUSH
- Transaction status changes - PUSH
- Vendor uploads a document (inspection report, appraisal, etc.) - PUSH
- Open house RSVP received - IN-APP
- Lead follow-up reminder due - PUSH
- Lead goes cold (no contact in X days) - IN-APP
- New review received on their profile - IN-APP
- Team member activity (if applicable) - IN-APP

**Client receives notifications when:**
- Agent pushes a new property to their shortlist - PUSH
- Showing scheduled or rescheduled - PUSH
- Transaction stage updates (moved to next stage) - PUSH
- Document needs their review or signature - PUSH
- Agent sends a message - PUSH
- Deadline approaching for something they need to do - PUSH
- Inspection report available - PUSH
- Pre-approval status update - PUSH
- Closing date confirmed or changed - PUSH

**Vendor (Inspector/Mortgage/Title) receives notifications when:**
- New assignment/job received - PUSH
- Schedule confirmed or changed - PUSH
- Document requested or received - IN-APP
- Message from agent or client - PUSH
- Payment/invoice status update - IN-APP

### Notification Preferences
- Users can configure notification preferences per channel (push, in-app, email)
- "Do Not Disturb" hours (e.g., no push notifications between 10pm-7am)
- Urgency levels: Critical (always push), Important (push during business hours), Informational (in-app only)
- Agents can set different preferences for different notification types
- Weekly digest email option (summary of all activity)

---

## ONBOARDING FLOWS

### Agent Onboarding
1. **Sign Up** - Email/password or SSO (ecosystem login)
2. **Choose Subscription Tier** - Starter, Professional, Team, Enterprise
3. **Profile Setup** - Photo, bio, license number, brokerage, service area
4. **Branding** - Choose accent colors, upload logo (if white-label tier)
5. **Connect Services** - Link CRM (if existing), calendar sync, social media accounts
6. **Import Data** - Import existing contacts/leads via CSV or API sync
7. **Invite First Client** - Guided flow to send first client invite (the "aha moment")
8. **Quick Tour** - Interactive walkthrough of key features (skippable)

### Client Onboarding
1. **Receive Invite** - Agent sends invite link (text, email, or QR code)
2. **Create Account** - Simple signup (name, email, phone) or SSO
3. **Profile Setup** - Buyer or seller? Budget range? Timeline? Must-haves? (conversational style, not a long form)
4. **Welcome Screen** - Shows their agent's info, what to expect, how the app helps
5. **First Action** - Directed to their transaction timeline or property shortlist (depending on stage)

### Vendor Onboarding (Inspector/Mortgage/Title/etc.)
1. **Sign Up** - Direct or via agent invitation
2. **Choose Role** - What type of professional are you?
3. **Business Profile** - Company name, license, certifications, service area, specialties
4. **Subscription** - Subscribe for full tools or continue as guest (if invited to specific transaction)
5. **Connect** - Link to agents they already work with
6. **Quick Tour** - Walkthrough of their vertical-specific tools

---

## TECHNICAL DECISIONS

### Tech Stack (Confirmed)
- **Frontend:** Expo React Native (mobile-first, iOS + Android + web)
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **State Management:** React Query (server state) + React Context (shared state) + AsyncStorage (persistent local state)
- **Routing:** Expo Router (file-based)
- **Real-time:** WebSocket (for live notifications, chat, status updates)
- **Authentication:** Role-based auth via SSO (ecosystem) with fallback email/password
- **File Storage:** Cloud storage for documents and images (specific provider TBD)

### API Architecture
- **REST API** for standard CRUD operations (transactions, clients, properties, etc.)
- **WebSocket** for real-time features (chat, live notifications, status updates)
- **No GraphQL** - REST is simpler, well-understood, and sufficient for this use case. GraphQL adds complexity without enough benefit for a mobile app with well-defined data shapes.

### Offline Capability
- **Transaction timeline:** Cached locally, viewable offline
- **Property shortlist:** Cached with photos, viewable offline
- **Messages:** Cached locally, new messages queue and send when reconnected
- **Documents:** Download for offline viewing, but upload requires connection
- **Showings/Calendar:** Cached locally, viewable offline
- **Search/MLS:** Requires connection
- **Analytics:** Requires connection

### Security Architecture
- Role-based access control (RBAC) enforced at API level
- All data encrypted in transit (TLS) and at rest
- Document storage encrypted with per-tenant keys
- Session management with refresh tokens
- Rate limiting on all API endpoints
- Input validation and sanitization on all user inputs
- Trust Shield integration for identity verification and fraud prevention
- Audit logging for all sensitive operations (document access, permission changes, financial data views)
- Data retention policies (configurable per brokerage/state requirements)
- GDPR/CCPA compliance considerations for client data (right to deletion, data export)

### Database Schema Design Approach
- Multi-tenant at the application level (agent is the primary tenant boundary)
- Shared tables with tenant_id (agent_id) for data isolation
- Soft deletes (archived flag) - never hard delete transaction data
- Timestamps on everything (created_at, updated_at)
- Audit trail table for sensitive operations
- Indexes on frequently queried fields (agent_id, client_id, transaction_id, status)

---

## SCREEN-BY-SCREEN FLOW (High-Level)

*Note: This is the initial flow based on industry standards. Subject to refinement based on Jennifer's feedback.*

### Client Flow (Buyer)
```
Login/SSO → Client Home Dashboard
├── My Transaction(s) → Transaction Timeline → Stage Details → Documents
├── Property Shortlist → Property Detail → Compare → Request Showing
├── Showings → Upcoming/Past → Showing Detail → Leave Feedback
├── Messages → Conversation List → Chat Thread
├── Mortgage Tools → Calculator / Pre-Approval Status
├── Neighborhood Info → Map / School Ratings / Amenities
├── Document Vault → All Docs → View/Sign
└── My Profile → Edit Preferences / Settings
```

### Client Flow (Seller)
```
Login/SSO → Client Home Dashboard
├── My Listing → Listing Status / Days on Market / Views
├── My Transaction → Timeline → Stage Details → Documents
├── Showing Feedback → What buyers said after viewing
├── Offers → List of Offers → Offer Detail → Accept/Counter/Reject
├── Messages → Conversation List → Chat Thread
├── Document Vault → All Docs → View/Sign
└── My Profile → Settings
```

### Agent Flow
```
Login/SSO → Agent Dashboard
├── Overview (today's schedule, urgent items, pipeline summary)
├── Clients → Client List → Client Detail → Their Transaction(s)
├── Leads → Lead Pipeline → Lead Detail → Convert to Client
├── Transactions → Active Deals → Transaction Detail → Manage Parties/Docs/Timeline
├── Showings → Calendar View → Schedule/Manage
├── Open Houses → Upcoming → Create/Edit → Attendance/Feedback
├── Properties → Listings → Add/Edit Property
├── Messages → All Conversations → Chat Thread
├── Marketing → Create Post / Email Campaign / Templates
├── Analytics → Performance / Revenue / Lead Sources
├── Network → Vendor Directory → Vendor Profile → Assign to Transaction
├── Branding → Logo / Colors / Agent Profile
└── Settings → Notifications / Account / Team Management
```

### Navigation Structure (Hamburger Menu)
```
Hamburger Menu (right side)
├── Home (Dashboard)
├── My Transactions (Client) / All Transactions (Agent)
├── Properties / Listings
├── Showings & Open Houses
├── Messages
├── Documents
├── [Agent only] Leads
├── [Agent only] Marketing
├── [Agent only] Analytics
├── [Agent only] Network
├── [Agent only] Branding
├── Profile & Settings
├── Help & Support
└── Sign Out
```

---

## PRICING DECISIONS (Proposed Final)

### Standard Features (All Tiers)
- Signal Chat messaging (core value prop - NOT paywalled)
- Transaction timeline
- Document vault
- Showing management
- Client/agent communication
- Basic property shortlist
- Mobile app access
- Trust Score (basic)

### Subscription Features
- **Starter ($49-79/mo):** Core client portal, up to 10 active clients, basic showing management, basic lead tracking
- **Professional ($149-199/mo):** Unlimited clients, full CRM integration, marketing hub, analytics, vendor network, open house tools, advanced trust features
- **Team ($299-499/mo):** Multi-agent support, team management, shared pipelines, white-label branding, advanced analytics, API access
- **Enterprise (Custom):** Full white-label, brokerage admin tools, dedicated support, custom integrations, compliance tools

### Vendor Subscriptions (Each Vertical)
- **Basic ($29-49/mo):** Dashboard, job pipeline, basic communication, profile
- **Professional ($79-129/mo):** Full tools (report builder, scheduling, marketing, analytics)
- Guest access: Free (limited to specific assignments)

---

## API ENDPOINT MAPPING (Ecosystem Connections)

### CRM API (PaintPros.io Backend)
- GET/POST/PUT /api/crm/contacts - Client and lead management
- GET/POST/PUT /api/crm/deals - Transaction/deal tracking
- GET /api/crm/pipeline - Pipeline stages and counts
- GET /api/crm/activities - Activity log/timeline

### Signal Chat API
- GET /api/chat/conversations - List conversations
- POST /api/chat/messages - Send message
- GET /api/chat/messages/:conversationId - Get message history
- WebSocket /ws/chat - Real-time message delivery

### Trust Shield API (trustshield.tech)
- POST /api/verify/identity - Verify user identity
- POST /api/verify/document - Verify document authenticity
- GET /api/verify/status/:id - Check verification status
- POST /api/fraud/check - Run fraud check

### SSO API
- POST /api/auth/login - Authenticate user
- POST /api/auth/token/refresh - Refresh access token
- GET /api/auth/user - Get authenticated user profile
- POST /api/auth/logout - End session

### Marketing Hub API
- GET/POST /api/marketing/campaigns - Campaign management
- POST /api/marketing/posts - Create social media post
- GET /api/marketing/analytics - Marketing performance data
- GET /api/marketing/templates - Template library

### Blockchain / Trust Layer API
- POST /api/blockchain/record - Record transaction milestone
- GET /api/blockchain/verify/:hash - Verify record
- GET /api/blockchain/history/:userId - User's blockchain history
- GET /api/blockchain/trust-score/:userId - Get trust score

### Analytics API
- GET /api/analytics/performance - Agent performance metrics
- GET /api/analytics/revenue - Revenue tracking
- GET /api/analytics/leads - Lead analytics
- GET /api/analytics/market - Market data

*Note: Exact endpoints will be confirmed when connecting to actual ecosystem backends. These are proposed based on standard REST patterns and the known capabilities of each service.*

---

## DATA MIGRATION PLAN

### For Agents Moving From Other Tools
1. **CSV Import** - Universal fallback for any system. Import contacts, leads, transaction history
2. **BoldTrail/kvCORE Sync** - API connection to import RE/MAX agents' existing data
3. **Manual Entry** - Smart forms with auto-complete and validation for quick data entry
4. **Guided Migration** - Step-by-step wizard: "Where are you coming from?" → system-specific import instructions
5. **Parallel Running** - Agents can run TrustHome alongside existing tools during transition, with data syncing where possible
6. **Future: AI-Assisted** - Photo/screenshot of spreadsheet → OCR → auto-populate fields

### Migration Priority
1. Active clients and their contact info (most urgent)
2. Active transactions and their current status
3. Lead database
4. Transaction history (for analytics baseline)
5. Document library (manual upload initially)
6. Vendor contacts and relationships

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

### MODULE 3: CONNECTED VERTICALS (Full Subscription Products Within TrustHome)

**Key Decision:** Each vertical is NOT just a lightweight guest portal. It's a full product with its own tools, its own value, and its own subscription tier. All verticals live WITHIN TrustHome (one app, one ecosystem), not as separate apps. However, each profession gets their own experience, tools, and reason to subscribe independently.

**The Network Effect:** An inspector can subscribe to TrustHome for their own tools even if no agent they work with uses it. But when BOTH are on the platform, they connect seamlessly - and that's the magic. The more professionals on the platform, the more valuable it becomes for everyone.

**Guest Access (for non-subscribers):** When an agent's preferred inspector/lender/title company doesn't subscribe, they get a lightweight guest connection - a link to upload documents, view transaction details, and communicate about a specific deal. They get a taste of the platform. This is also the conversion funnel to turn them into subscribers.

**Scope:** Covers BOTH residential AND commercial real estate. Commercial transactions involve different parties (commercial brokers, commercial lenders, environmental inspectors, zoning attorneys, tenant reps) and different workflows (longer timelines, more complex due diligence, different document types). The platform adapts based on transaction type.

#### 3A. Home Inspector Vertical
**As a full product (subscribing inspector):**
- Their own dashboard with job pipeline (scheduled, in progress, completed)
- Inspection report builder (templated, photo/video documentation, checklist-driven)
- Scheduling and calendar management across all their clients/agents
- Client communication tools
- Revenue/invoice tracking
- Marketing tools to promote their services to agents
- Rating and review profile (trust score)
- **TRUST LAYER**: Certifications, inspection history, and results verified on blockchain
**As guest access (non-subscriber):**
- Receives assignment link from agent
- Can view property details and schedule
- Upload completed report
- Communicate about the specific inspection
- That's it - no tools, no dashboard

#### 3B. Mortgage Broker / Lender Vertical
**As a full product (subscribing broker):**
- Loan pipeline dashboard (applications, in progress, approved, closed)
- Pre-approval workflow and status tracking
- Document collection and management
- Rate sheet management
- Client communication tools
- Agent relationship management (which agents send them business)
- Revenue tracking
- Marketing tools
- **TRUST LAYER**: Pre-approval verifications, lending history on blockchain
**As guest access (non-subscriber):**
- Receives transaction link from agent
- Can update loan status
- Upload required documents
- Communicate about the specific deal

#### 3C. Title Company Vertical
**As a full product (subscribing title company):**
- Title search pipeline and tracking
- Closing scheduling and coordination
- Document preparation and delivery workflow
- Fee transparency and invoice management
- Wire fraud prevention via Trust Shield
- Multi-agent/multi-transaction management
- **TRUST LAYER**: Title verification records on blockchain
**As guest access (non-subscriber):**
- Receives closing link from agent
- Can update title search status
- Upload closing documents
- Schedule closing

#### 3D. Appraiser Vertical
**As a full product (subscribing appraiser):**
- Appraisal job pipeline
- Comparable analysis tools
- Report builder
- Scheduling management
- Revenue tracking
- **TRUST LAYER**: Appraisal records and credentials on blockchain
**As guest access (non-subscriber):**
- Receives appraisal assignment link
- Upload completed report
- Communicate about the appraisal

#### 3E. Contractor / Service Provider Vertical
**As a full product (subscribing contractor):**
- Job pipeline management
- Quote/estimate builder
- Client communication
- Portfolio/gallery of past work
- Revenue tracking
- Marketing to homeowners and agents
- **TRUST LAYER**: Service history, reviews, and licensing on blockchain
**As guest access (non-subscriber):**
- Receives job referral from agent or homeowner
- Can submit quote
- Communicate about the specific job

#### 3F. Commercial Real Estate Extensions (Future)
- Commercial broker tools (different from residential)
- Commercial lender connections
- Environmental inspector vertical
- Zoning/legal professional connections
- Tenant representation tools
- Commercial lease management
- Due diligence tracking (longer, more complex than residential)

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

## MASTER PLANNING CHECKLIST (Complete Before Building)

This is the list of everything that needs to be fully defined before any code is written. Items are marked as DONE, IN PROGRESS, or TODO.

### Architecture & Vision
- [DONE] Project vision and purpose
- [DONE] White-label strategy
- [DONE] Trust layer / blockchain ecosystem connection
- [DONE] Trust Shield security integration
- [DONE] Ecosystem connection model (blockchain dashboard, membership cards, SSO, cross-vertical navigation)
- [DONE] API-first architecture decision (not embedded code)
- [DONE] Modular services decision (Salesforce model - keep separate, don't unify)
- [DONE] Tenant strategy (separate tenant per service for TrustHome)
- [DONE] API connection map (8 API connections identified)
- [DONE] Existing ecosystem inventory (CRM, Signal Chat, Marketing Suite, SSO, Trust Shield, Blockchain)
- [DONE] PaintPros.io as backend hub / source of truth

### Design & Branding
- [DONE] Color scheme direction (light/dark toggle, earthy accent, not holographic)
- [DONE] Design philosophy (mobile-native, minimal chrome, premium, intuitive)
- [TODO] Final accent color selection (deep teal vs warm terracotta vs forest green vs other)
- [TODO] Typography choices (fonts for headers, body, data displays)
- [TODO] Icon style direction
- [TODO] App icon design concept
- [TODO] Splash screen design concept

### Features & Functionality
- [DONE] Complete feature map (4 modules, 20+ sub-features)
- [DONE] Build phases defined (9 phases)
- [DONE] Protocol layout (Bento grid, glassmorphism, navigation, card design, visual effects, information architecture)
- [DONE] Screen-by-screen flow (high-level flows for Client Buyer, Client Seller, Agent, plus hamburger menu structure - subject to Jennifer's feedback)
- [DONE] User roles and permissions (9 roles defined: Agent, Client, Inspector, Mortgage Broker, Title Company, Appraiser, Contractor, Team Member, Brokerage Admin + communication matrix + data ownership principles)
- [DONE] Data models (10 models defined field-by-field: Transaction, ClientProfile, Property, Showing, OpenHouse, Lead, Document, Message/Conversation, Vendor, TrustScore)
- [DONE] Edge cases and error handling (deal falls through, client switches agents, inspector cancels, document disputed, expired listings, cold leads, dual agency, multiple offers, backup offers, co-listing, referrals, simultaneous buy/sell, cash buyer, new construction, short sale/foreclosure, investment property)
- [DONE] Notification strategy (4 channels: push, in-app, Signal Chat, email; triggers defined per role; preference configuration; DND hours; urgency levels)

### Business & Monetization
- [DONE] Industry pricing benchmarks
- [DONE] Proposed pricing tiers
- [DONE] Revenue model options
- [DONE] Final pricing decisions (standard features defined, 4 agent tiers, vendor subscription tiers, guest access free)
- [DONE] Onboarding flow for new agents (8 steps: signup, tier, profile, branding, connect services, import data, invite first client, tour)
- [DONE] Onboarding flow for new clients (5 steps: receive invite, create account, profile setup, welcome, first action)
- [DONE] Onboarding flow for vendors (6 steps: signup, choose role, business profile, subscription, connect, tour)

### Integration & Data
- [DONE] Integration philosophy and strategy
- [DONE] Priority external integrations list (MLS, ShowingTime, DocuSign, etc.)
- [DONE] Data import capabilities (CSV, manual, OCR future)
- [DONE] Specific API endpoint mapping (7 API groups mapped: CRM, Signal Chat, Trust Shield, SSO, Marketing Hub, Blockchain, Analytics)
- [DONE] Data migration plan (6 methods: CSV import, BoldTrail sync, manual entry, guided wizard, parallel running, future AI-assisted; prioritized migration sequence defined)

### Technical
- [DONE] Final tech stack confirmation (Expo React Native + Express.js + PostgreSQL + Drizzle ORM + WebSocket)
- [DONE] Database schema design approach (multi-tenant, soft deletes, audit trails, indexes defined)
- [DONE] API architecture (REST for CRUD, WebSocket for real-time - no GraphQL)
- [DONE] Real-time features architecture (WebSocket for chat, notifications, status updates)
- [DONE] Offline capability requirements (cached: timeline, shortlist, messages, calendar; online-only: search, analytics)
- [DONE] Security architecture (RBAC, encryption in transit + at rest, per-tenant keys, rate limiting, audit logging, GDPR/CCPA considerations)

---

## OPEN QUESTIONS & FUTURE CONSIDERATIONS
- What specific MLS system does Jennifer's market use? (Needed for API integration)
- What additional data points would be useful for the trust layer?
- Multi-language support needed?
- What level of branding customization for white-label? (Colors only? Logo? Full theme?)
- Exact Signal Chat API spec (endpoints, auth, WebSocket protocol)
- Exact CRM data model from PaintPros.io (field names, entity relationships)
- SSO protocol details (OAuth2? JWT? Custom?)
- Final app name decision (TrustHome is working name - confirmed?)
- Jennifer's feedback on screen flows and transaction process
- State-specific real estate regulations to account for (dual agency rules, disclosure requirements, etc.)
- Commercial real estate: how different should the workflow be from residential?

---

## Technical Notes
- Stack: Expo React Native (mobile) + Express (backend)
- Database: PostgreSQL with Drizzle ORM
- File-based routing with Expo Router
- State management: React Query + AsyncStorage + React Context
- Authentication: TBD (likely role-based: client vs agent vs vendor)

---

*Last Updated: February 8, 2026*
*Status: PLANNING PHASE COMPLETE - All planning items resolved. Ready to begin front-end prototype build.*
*Next Step: Build premium UI prototype (Agent Dashboard + Client Portal) for Jennifer's review.*
