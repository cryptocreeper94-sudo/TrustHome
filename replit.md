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

## OPEN QUESTIONS & FUTURE CONSIDERATIONS
- What specific MLS system does the sister's market use?
- What additional data points would be useful for the trust layer?
- Pricing model: Free for clients, subscription for agents? Per-transaction fee?
- How will the app handle multiple agents in the same brokerage?
- Multi-language support needed?
- What level of branding customization for white-label?

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
