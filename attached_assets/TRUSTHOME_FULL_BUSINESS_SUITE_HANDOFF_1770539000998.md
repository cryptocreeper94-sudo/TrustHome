# PaintPros.io Full Business Suite - API & UI Reference for TrustHome

## Purpose
This document describes EVERY business tool available in the PaintPros.io backend that TrustHome can connect to via API. The TrustHome agent should read this to understand what each system does, how it works, what the UI looks like, and build connection points + matching UI.

**Total Codebase: 146,132 lines across 355 files**

---

## TABLE OF CONTENTS

1. [CRM & Lead Management](#1-crm--lead-management)
2. [Estimates & Proposals](#2-estimates--proposals)
3. [Booking & Scheduling](#3-booking--scheduling)
4. [Calendar System](#4-calendar-system)
5. [Job Management](#5-job-management)
6. [Crew Management](#6-crew-management)
7. [Marketing Hub](#7-marketing-hub)
8. [Marketing Autopilot](#8-marketing-autopilot)
9. [Blog System](#9-blog-system)
10. [Analytics Dashboard](#10-analytics-dashboard)
11. [Payments & Invoicing](#11-payments--invoicing)
12. [Customer Portal](#12-customer-portal)
13. [Warranties](#13-warranties)
14. [Referral Program](#14-referral-program)
15. [Financing](#15-financing)
16. [Portfolio & Gallery](#16-portfolio--gallery)
17. [AI-Powered Tools](#17-ai-powered-tools)
18. [Subcontractor Management](#18-subcontractor-management)
19. [Weather Alerts](#19-weather-alerts)
20. [Smart Contracts & Blockchain](#20-smart-contracts--blockchain)
21. [Google Integrations](#21-google-integrations)
22. [Messaging System](#22-messaging-system)
23. [SEO Management](#23-seo-management)
24. [Credits System](#24-credits-system)
25. [Webhooks](#25-webhooks)
26. [Authentication](#26-authentication)

---

## 1. CRM & LEAD MANAGEMENT

### What It Does
Full customer relationship management with dual pipelines (Sales + Jobs), lead scoring, activity tracking, and deal stages.

### Data Model

**Leads Table:**
- id, tenantId, email, firstName, lastName, phone, address
- tradeType (painting, electrical, hvac, carpentry, general)
- propertyType (residential, commercial)
- projectTypes[] (interior, exterior, etc.)
- timeline (hot, warm, cold), urgencyScore (0-100)
- squareFootage, source (website, referral, phone, social, ad, etc.)
- status (new, contacted, qualified, proposal_sent, won, lost)
- notes, createdAt

**CRM Deals Table:**
- id, tenantId, title, value (decimal)
- stage: Sales pipeline (new_lead → quoted → negotiating → won → lost) OR Jobs pipeline (project_accepted → scheduled → in_progress → touch_ups → complete)
- pipelineType (sales or jobs)
- leadId, probability (0-100), expectedCloseDate, ownerId
- crewLeadId, scheduledStartDate, scheduledEndDate (for job pipeline)

**CRM Activities Table:**
- id, entityType (lead/deal), entityId
- activityType (call, email, visit, note)
- title, description, createdBy, createdAt

**CRM Notes Table:**
- id, entityType (lead/deal), entityId, content, createdBy

### API Endpoints
```
POST   /api/crm/deals              - Create new deal
POST   /api/crm/activities         - Log an activity (call, email, visit)
POST   /api/crm/notes              - Add a note to lead/deal
POST   /api/leads/score            - Calculate lead score manually
POST   /api/leads/score-ai         - Calculate lead score with AI
GET    /api/lead-sources           - Get lead sources for tenant
```

### UI Layout
The CRM lives inside the Admin dashboard (`/admin`). It has:
- **Kanban board** showing deals in columns by stage (drag-and-drop)
- **Lead list** with filters by status, source, timeline
- **Deal detail** slide-over panel with activity timeline, notes, and contact info
- **Lead scoring** badges showing hot/warm/cold with color indicators
- Responsive: On mobile, kanban becomes a stacked card list

---

## 2. ESTIMATES & PROPOSALS

### What It Does
Interactive estimator tool for customers to get instant pricing. Leads to formal proposals that can be sent, viewed, and signed digitally.

### Data Model

**Estimates Table:**
- id, tenantId, leadId
- includeWalls, includeTrim, includeCeilings (booleans)
- doorCount, squareFootage
- wallsPrice, trimPrice, ceilingsPrice, doorsPrice, totalPrice
- status (draft, sent, viewed, accepted, declined)
- customerName, customerEmail, customerPhone, customerAddress

**Proposals Table:**
- id, templateId, estimateId, leadId
- customerName, customerEmail, customerPhone, customerAddress
- projectDescription, content (rendered HTML/markdown)
- totalAmount, status (draft, sent, viewed, accepted, declined)
- sentAt, viewedAt, respondedAt, signatureData, signedAt
- validUntil, termsAccepted

**Estimator Config (per tenant):**
- wallPricePerSqFt, trimPricePerFt, ceilingPricePerSqFt, doorPricePerDoor
- minimumJobPrice, taxRate, depositPercentage
- Custom service categories with pricing rules

### API Endpoints
```
GET    /api/estimates                  - List all estimates
GET    /api/estimates/:id              - Get specific estimate
POST   /api/estimates/submit           - Submit estimate request (sends email notification)
GET    /api/estimator-config/:tenantId - Get pricing config for tenant
GET    /api/proposals                  - List all proposals
GET    /api/proposals/:id              - Get specific proposal
POST   /api/proposals/generate         - AI-generate a proposal from estimate data
PUT    /api/proposals/:id/status       - Update proposal status
GET    /api/proposal-templates         - Get proposal templates (filter by category)
PUT    /api/proposal-templates/:id     - Update proposal template
```

### UI Layout
- **Estimate page** (`/estimate`): Multi-step wizard - customer picks rooms, services, square footage. Live price updates as they configure. Mobile-friendly with step indicators.
- **Proposal view** (`/proposal/:id/sign`): Full proposal document with digital signature pad at bottom. Customer can accept/decline. Shows project scope, pricing breakdown, terms, warranty info.
- **Admin estimate list**: Table view with status badges, quick actions (send, approve, convert to proposal)

---

## 3. BOOKING & SCHEDULING

### What It Does
5-step online booking wizard for customers. Manages availability windows and time slots.

### Data Model

**Bookings Table:**
- id, tenantId, leadId, userId
- customerName, customerEmail, customerPhone, customerAddress
- serviceType (interior, exterior, commercial, residential)
- projectDescription
- scheduledDate, scheduledTime, estimatedDuration
- status (pending, confirmed, in_progress, completed, cancelled, no_show)
- assignedCrewId, notes, totalPrice
- confirmationCode, reminderSent

**Availability Windows:**
- id, tenantId, dayOfWeek (0-6)
- startTime, endTime, isActive
- maxBookingsPerSlot

### API Endpoints
```
GET    /api/bookings                   - List bookings (filter by status, date)
POST   /api/bookings                   - Create new booking
PUT    /api/bookings/:id               - Update booking
PATCH  /api/bookings/:id/status        - Change booking status
GET    /api/availability/:tenantId     - Get available time slots
```

### UI Layout
- **Booking wizard** (`/book`): 5-step flow: (1) Select service type, (2) Property details, (3) Choose date/time from available slots, (4) Contact info, (5) Confirmation. Each step is a full-width card with progress bar at top. Mobile-optimized with large touch targets.
- **Admin booking view**: Calendar-style grid showing bookings by day/week with crew assignments.

---

## 4. CALENDAR SYSTEM

### What It Does
Full calendar with event types, color coding, crew assignments, Google Calendar sync, and iCal export.

### Data Model

**Calendar Events Table:**
- id, tenantId, title, description
- eventType (appointment, estimate, job, meeting, reminder, blocked)
- status (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- colorCode (hex), startTime, endTime, allDay
- location, customerName, customerEmail, customerPhone
- assignedTo, crewLeadId, jobId, bookingId
- recurrenceRule, recurrenceEndDate
- googleCalendarEventId, googleCalendarId (for sync)

**Google Calendar Connections:**
- id, tenantId, calendarId, calendarName, syncEnabled
- accessToken, refreshToken, tokenExpiresAt
- lastSyncAt, syncDirection (one_way, two_way)

### API Endpoints
```
GET    /api/calendar/events            - Get events (filter by date range, type)
POST   /api/calendar/events            - Create event
PUT    /api/calendar/events/:id        - Update event
DELETE /api/calendar/events/:id        - Delete event
GET    /api/ical/:token                - Export iCal feed (for Google/Apple Calendar)
GET    /api/google-calendar/connections - Get Google Calendar connections
POST   /api/google-calendar/sync       - Trigger Google Calendar sync
```

### UI Layout
- **Calendar view**: Month/week/day toggle. Events color-coded by type (blue=appointment, green=job, yellow=estimate, red=blocked). Clicking event opens detail panel. Drag to reschedule.
- **Mobile**: Day view with scrollable time slots. Swipe between days.
- **Sidebar**: Upcoming events list, quick-add button, filter by crew member.

---

## 5. JOB MANAGEMENT

### What It Does
Full job tracking from acceptance through completion. Includes job updates, risk scoring, customer portal access, and GPS check-ins.

### Data Model

**Jobs Table:**
- id, tenantId, proposalId, leadId
- jobNumber, title, description, address
- customerName, customerEmail, customerPhone
- accessToken (for customer portal - no login required)
- scheduledStartDate, scheduledEndDate, actualStartDate, actualEndDate
- status (accepted, scheduled, in_progress, touch_ups, complete, on_hold, cancelled)
- assignedCrewLeadId, assignedCrewMembers (text array)
- estimatedHours, actualHours
- estimatedCost, actualCost, invoicedAmount
- weatherDelays, incidentReports
- completionPercentage (0-100)

**Job Updates Table:**
- id, jobId, updateType (progress, delay, issue, completion, note)
- content, attachments, percentage, createdBy, createdAt

**GPS Check-ins:**
- id, tenantId, jobId, memberId, memberName
- latitude, longitude, accuracy
- checkInType (arrival, departure, break_start, break_end)
- timestamp, notes

### API Endpoints
```
GET    /api/jobs                        - List jobs (filter by status, crew)
GET    /api/jobs/:id                    - Get specific job
POST   /api/jobs                        - Create job
PUT    /api/jobs/:id                    - Update job
GET    /api/jobs/:id/updates            - Get job update timeline
POST   /api/jobs/:id/updates            - Add job update
POST   /api/jobs/risk-score             - AI risk scoring for a job
GET    /api/gps-checkins/job/:jobId     - GPS check-ins for job
GET    /api/gps-checkins/member/:id     - GPS check-ins for crew member
POST   /api/crew/location               - Update crew GPS location
```

### UI Layout
- **Job list** (Admin/Owner dashboard): Card grid showing active jobs with progress bars, crew avatars, and status badges.
- **Job detail**: Full-width page with sections for timeline, crew assignment, customer info, documents, GPS map, and status updates.
- **Progress tracking**: Visual progress bar (0-100%) with milestone markers.

---

## 6. CREW MANAGEMENT

### What It Does
Crew leads and members with time tracking, skill matching, incident reports, and digital tip jar.

### Data Model

**Crew Leads:** id, tenantId, firstName, lastName, email, phone, pin, isActive
**Crew Members:** id, leadId, firstName, lastName, role (painter, apprentice, helper), phone, hourlyRate
**Time Entries:** id, memberId, jobId, clockIn, clockOut, hoursWorked, breakDuration, status
**Crew Tips:** id, tenantId, jobId, memberName, amount, tipperName, message, createdAt
**Crew Skills:** id, memberId, skillName, proficiencyLevel (1-5), certified

### API Endpoints
```
GET    /api/crew-leads                  - List crew leads
POST   /api/crew-leads                  - Create crew lead
GET    /api/crew-members/:leadId        - Get crew members under a lead
POST   /api/crew-members                - Add crew member
POST   /api/crew/skills                 - Add skill to member
POST   /api/jobs/match-crew             - AI match crew to job based on skills
GET    /api/time-entries/:memberId      - Get time entries
POST   /api/time-entries                - Clock in/out
POST   /api/tips                        - Digital tip
```

### UI Layout
- **Crew Lead dashboard** (`/crew-lead`): PIN-protected. Shows today's assigned jobs, crew roster, clock in/out buttons, incident report form. Mobile-first - designed for field use.
- **Admin crew view**: Team roster with skill badges, utilization rates, and performance metrics.

---

## 7. MARKETING HUB

### What It Does
Complete social media marketing management with content library (images + message templates), content bundles (image + message pairs), scheduling calendar, engagement gamification templates, copy generator, campaign ROI tracking, and team notes.

### UI Layout - 9 Tabs (THIS IS THE FULL LAYOUT TO REPLICATE)

**Tab 1: "Welcome" (Guide/Onboarding)**
- Welcome card with personalized greeting
- "What's Ready Now" grid: 2x3 cards showing completed features (Image Library, Content Catalog, Scheduling Calendar, Analytics, Team Notes)
- Marketing Autopilot roadmap: Numbered step cards (1. Meta Integration, 2. AI Content Gen, 3. Smart Scheduler, 4. Platform Expansion)
- Google Analytics integration status card
- "How To Operate" walkthrough with step-by-step instructions
- Content carousel explanation (how posts rotate automatically)
- Dismissible - user can hide after reading

**Tab 2: "Images" (Digital Asset Library)**
- Header with "Image Library" title + "Add Image" button
- Toggle bar: "Live Images" (green, real photos from jobs) vs "AI Library" (purple, placeholder images)
- Info banner explaining which type is selected
- Subject filter carousel: Horizontal scrollable row of category thumbnail cards (Interior Walls, Exterior Home, Cabinet Work, Deck Staining, Trim & Detail, Door Painting, Commercial, Before/After, Team Action, General). Each is a small image card with label overlay. Selected shows ring highlight.
- Image grid: 2 cols mobile, 3 cols tablet, 4 cols desktop. Each card shows image thumbnail, description, subject badge, style badge, "Real Photo" badge if user-uploaded, and 5-star quality rating.

**Tab 3: "Messages" (Message Templates)**
- Header with "Message Templates" + subject filter dropdown + "Add Message" button
- "Engagement Boosters" section: Amber gradient background. 6 quick-add gamification template buttons (Guess the Before Color, Spot the Difference, Color Challenge, This or That, Rate This Transform, Caption This). Each is a button with icon + title.
- "Educational Posts" section: Blue gradient background. 6 educational template buttons (Paint Prep 101, Color Psychology, Cost Guide, Seasons Guide, Maintenance Tips, Hire a Painter).
- "Seasonal Content" section: Green gradient background. Templates by season (Spring, Summer, Fall, Winter, Holiday).
- Message list: Cards showing message content, platform badge, subject badge, tone badge, hashtags, character count. Copy + Edit + Delete actions.

**Tab 4: "Bundles" (Image + Message Pairs)**
- "Today's Suggested Post" card at top: Amber gradient border. Shows rotation schedule (A/B rotation MWF/TThSat), suggested image + message for today. Edit, Copy, Download actions. Expandable for more detail.
- Content type filter: "All" / "Organic" / "Paid Ad" toggle
- Bundles grid: 1 col mobile, 2 cols desktop. Each bundle card shows paired image + message, platform badge, status badge (suggested/circulating/posted/approved/scheduled), metrics if available (impressions, reach, clicks, likes). Edit metrics button opens modal with fields for Impressions, Reach, Clicks, Likes, Comments, Shares, Saves, Leads, Conversions.
- "Auto-Pair" button to generate new bundles from unmatched images+messages

**Tab 5: "Schedule" (Calendar)**
- 4-week calendar grid showing scheduled posts
- Each day cell shows post thumbnails with platform icons
- Click day to expand and see full post details
- Duplicate prevention: System checks 4 weeks back to avoid repeating same content
- Weekly rotation: MWF = Rotation A (project showcases), TThSat = Rotation B (engagement/education), Sunday = planning day
- Drag-and-drop to reschedule (desktop)

**Tab 6: "Analytics" (Performance Dashboard)**
- Top stat cards (3-col grid): Total Impressions, Total Engagement, Posting Frequency
- Weekly trend chart: Line/area chart showing engagement over time
- Platform breakdown: Pie chart showing distribution across Facebook/Instagram/X
- Best performing posts: Ranked list of top content by engagement
- Content type performance: Bar chart comparing educational vs promotional vs gamified

**Tab 7: "Campaigns" (ROI Tracker)**
- Top stat cards (3-col): Total Spend, Leads Generated, Cost Per Lead (each with gradient backgrounds blue/green/purple)
- "Create Your First Campaign" placeholder with dashed border
- Attribution Sources grid (2x2): Facebook/Instagram Ads (via Meta API), Google Ads, Google LSA (connected), Manual Entry (mailers, flyers). Each shows connection status badge.

**Tab 8: "AI Tools" (Copy Generator)**
- "Powered by OpenAI" badge
- Left column: Content Type dropdown (Social Post, Ad Copy, Email Subject, SMS), Service Focus dropdown, Tone dropdown, Generate button
- Right column: Generated copy output area with Copy + Add to Catalog buttons
- Split layout on desktop, stacked on mobile

**Tab 9: "Team" (Notes Board)**
- Team notes with role-based posting (Marketing Manager, Owner, Developer, Admin)
- Add note form: Textarea + "Post Note" button with author/role display
- Notes list: Cards with avatar initial, author name, role, timestamp, content, delete button. Purple gradient accent.

### Marketing Hub API Endpoints
```
GET    /api/marketing/images/:tenantId       - Get image library
POST   /api/marketing/images                  - Add image
PUT    /api/marketing/images/:id              - Update image metadata
GET    /api/marketing/posts/:tenantId         - Get content posts
POST   /api/marketing/posts                   - Create post
GET    /api/marketing/:tenantId/live-posts     - Get live scheduled posts
POST   /api/marketing/:tenantId/quick-post     - Quick post to social media
POST   /api/marketing-autopilot/generate-captions - AI generate captions
GET    /api/marketing/optimizations           - Get marketing optimizations
POST   /api/marketing/optimize                - AI optimize marketing budget
```

### Design Notes
- Uses GlassCard components (frosted glass effect with subtle border)
- Gradient accents: amber for suggestions, purple for AI, green for live/connected, blue for info
- Mobile-first: All grids collapse to single column. Carousels become horizontally scrollable.
- Dark mode support throughout with dark: variants
- Lucide React icons throughout - never emoji
- Framer Motion animations for card entrances (fade up)

---

## 8. MARKETING AUTOPILOT

### What It Does
Set-it-and-forget-it automated social media posting. Businesses subscribe, connect their Meta accounts via OAuth, and the system posts automatically on a schedule.

### Data Model
- Autopilot Subscriptions: businessName, email, phone, facebookPageId, instagramAccountId, status, postingSchedule, plan (standard/premium)
- Posting schedule: Configurable times and platforms
- Meta OAuth integration for token management

### API Endpoints
```
POST   /api/autopilot/onboard                    - New business onboarding
POST   /api/marketing-autopilot/subscribe         - Create subscription
POST   /api/marketing-autopilot/:id/activate      - Activate subscriber
POST   /api/marketing-autopilot/:id/pause         - Pause subscriber
POST   /api/marketing-autopilot/:id/connect-meta  - Connect Meta accounts
POST   /api/marketing-autopilot/:id/preferences   - Save posting preferences
POST   /api/marketing-autopilot/:id/start         - Start autopilot
POST   /api/marketing-autopilot/:id/test-post     - Test post
GET    /api/marketing-autopilot/pending           - List pending subscribers
GET    /api/marketing-autopilot/subscribers       - List active subscribers
GET    /api/marketing-autopilot/all               - List all subscribers
GET    /api/meta/status/:subscriberId             - Check Meta OAuth status
POST   /api/meta/connect/:subscriberId            - Start Meta OAuth flow
GET    /api/meta/callback                         - Meta OAuth callback
```

### UI Layout
- **Onboarding** (`/autopilot`): Multi-step wizard for new businesses
- **Portal** (`/autopilot/portal`): Subscriber's dashboard showing posting activity, content preview, account settings
- **Admin** (`/autopilot/admin`): Admin view of all subscribers, activation controls, status monitoring

---

## 9. BLOG SYSTEM

### What It Does
Multi-tenant blog with AI-powered post generation (GPT-4o), SEO optimization, category management, and automated scheduling (2-3 posts/week per tenant).

### Data Model

**Blog Categories:** id, tenantId, name, slug, description, displayOrder, isActive
**Blog Posts:** id, tenantId, categoryId, title, slug, excerpt, content (markdown), coverImage, author, status (draft/published/archived), publishedAt, metaDescription, tags[], readingTime, views

### API Endpoints
```
GET    /api/blog/categories              - Get categories for tenant
POST   /api/blog/categories              - Create category
POST   /api/blog/categories/seed         - Seed default categories
GET    /api/blog/posts                   - Get posts (filter by status, category)
GET    /api/blog/posts/:slug             - Get post by slug
POST   /api/blog/posts                   - Create post
POST   /api/blog/ai/generate             - AI generate blog content
POST   /api/blog/generate-auto           - Trigger auto-generation
```

### UI Layout
- **Blog page** (`/blog`): Hero section with featured post. Grid of recent posts (3-col desktop, 1-col mobile). Each card shows cover image, category badge, title, excerpt, reading time, date. Category filter tabs at top.
- **Post detail**: Full-width content area with markdown rendering, author info, related posts sidebar.

---

## 10. ANALYTICS DASHBOARD

### What It Does
Unified analytics with live visitor tracking, traffic metrics, device breakdown, top pages, referrers, geographic data, and SEO tag counts per tenant. Includes GA4 integration support.

### API Endpoints
```
GET    /api/analytics/dashboard          - Aggregated analytics (visitors, pageviews, devices, top pages, referrers, hourly/daily trends)
GET    /api/analytics/live               - Live visitor count
GET    /api/analytics/geography          - Geographic visitor data
GET    /api/analytics/tenants            - Available tenants for filtering
POST   /api/analytics/track              - Track a page view
```

### UI Layout
- **Dashboard** (inside Admin/Developer pages): 
- Top row: 4 stat cards (Live Visitors with pulsing green dot, Total Pageviews, Unique Visitors, Avg Session Duration)
- Row 2: Traffic trends chart (line chart, daily/weekly toggle)
- Row 3: Two-column - Device breakdown pie chart (Desktop/Mobile/Tablet) + Top Pages table
- Row 4: Two-column - Referrer sources bar chart + Geographic map/list
- All cards are filterable by tenant and date range

---

## 11. PAYMENTS & INVOICING

### What It Does
Stripe-powered payment processing for estimates and proposals. Includes deposits, auto-invoicing, and payment tracking.

### Data Model

**Payments:** id, estimateId, proposalId, amount, currency, status (pending/processing/completed/failed/refunded), paymentMethod (card/bank/crypto), processorId (Stripe ID), customerEmail, paidAt
**Payment Deposits:** id, tenantId, estimateId, jobId, amount (cents), depositPercentage, stripePaymentIntentId, status
**Auto Invoices:** id, tenantId, jobId, customerId, invoiceNumber, lineItems, subtotal, taxAmount, totalAmount, dueDate, status, stripeInvoiceId

### API Endpoints
```
GET    /api/payments                     - List all payments
GET    /api/payments/:id                 - Get specific payment
GET    /api/estimates/:id/payment        - Get payment for estimate
POST   /api/credits/purchase             - Create Stripe checkout session
POST   /api/credits/webhook              - Handle Stripe webhooks
GET    /api/invoices/auto                - Get auto-generated invoices
GET    /api/stripe/status                - Check Stripe connection status
```

### UI Layout
- **Pay page** (`/pay/:estimateId`): Stripe checkout embedded. Shows estimate summary, line items, total, deposit amount. Secure badges.
- **Admin payments**: Table with status badges, date, amount, customer, payment method. Click to view receipt.

---

## 12. CUSTOMER PORTAL

### What It Does
Token-based customer portal (no login required). Customers get a unique link to track their job progress, view updates, see crew location, and leave tips.

### API Endpoints
```
GET    /api/portal/:token                - Get portal data via access token
POST   /api/portal/create                - Create portal access token
```

### UI Layout
- Job progress bar (percentage), status badge
- Timeline of job updates
- Crew info with real-time GPS map
- Digital tip jar
- Documents section (proposal, warranty, invoice)
- Clean, customer-facing design - no admin controls

---

## 13. WARRANTIES

### What It Does
Track warranties for completed jobs with expiration alerts.

### Data Model
- id, tenantId, jobId, leadId, warrantyNumber, warrantyType (labor/materials/full), durationYears, startDate, expirationDate
- customerName, customerEmail, customerPhone, propertyAddress
- paintsUsed (JSONB), surfacesPainted, coatsApplied
- status (active/expired/claimed/voided)

### API Endpoints
```
GET    /api/warranties                   - List warranties
PUT    /api/warranties/:id               - Update warranty
GET    /api/warranties/expiring/:days    - Get warranties expiring within X days
```

---

## 14. REFERRAL PROGRAM

### What It Does
Customer referral tracking with unique codes, reward management, and conversion tracking.

### API Endpoints
```
GET    /api/referrals                    - List referral programs
GET    /api/referrals/code/:code         - Lookup by referral code
POST   /api/referrals                    - Create referral program
```

---

## 15. FINANCING

### What It Does
Customer financing with pre-qualification, plans management, and application tracking.

### API Endpoints
```
GET    /api/financing/plans              - Available financing plans
GET    /api/financing/applications       - Applications list
POST   /api/financing/apply              - Submit application
POST   /api/financing/prequalify         - Pre-qualify customer
```

---

## 16. PORTFOLIO & GALLERY

### What It Does
Before/after project showcase with portfolio entries and gallery management.

### Data Model
- Portfolio Entries: id, tenantId, title, description, beforeImageUrl, afterImageUrl, serviceType, location, isPublished, featured
- Portfolio Galleries: id, tenantId, title, description, images (JSONB), category

### API Endpoints
```
GET    /api/portfolio                    - Get portfolio entries (filter by published)
GET    /api/portfolio/:id                - Get specific entry
POST   /api/gallery                      - Create gallery entry
GET    /api/project-images/:tenantId     - Get project images
GET    /api/project-images/:tenantId/pairs - Get before/after pairs
POST   /api/project-images/:tenantId     - Upload project image
```

---

## 17. AI-POWERED TOOLS

### What It Does
Suite of AI tools powered by OpenAI for business intelligence.

### API Endpoints
```
POST   /api/voice-estimate               - Voice description → estimate data
POST   /api/followup/optimize            - AI recommend best follow-up actions
POST   /api/profit/analyze               - Analyze profit margins
POST   /api/demand/forecast              - Seasonal demand forecasting
POST   /api/clv/calculate                - Customer Lifetime Value
POST   /api/routes/optimize              - AI crew route optimization
POST   /api/cashflow/forecast            - AI cashflow forecasting
POST   /api/pricing/analyze              - Pricing elasticity analysis
POST   /api/proposals/generate           - AI proposal generation
POST   /api/marketing-autopilot/generate-captions - AI caption generation
POST   /api/blog/ai/generate             - AI blog post generation
```

---

## 18. SUBCONTRACTOR MANAGEMENT

### What It Does
Manage subcontractor profiles and assign them to jobs.

### API Endpoints
```
GET    /api/subcontractors                      - List subcontractors
PUT    /api/subcontractors/:id                  - Update subcontractor
GET    /api/subcontractor-assignments/:jobId    - Assignments for job
POST   /api/subcontractor-assignments           - Create assignment
DELETE /api/subcontractor-assignments/:id       - Remove assignment
```

---

## 19. WEATHER ALERTS

### What It Does
Weather monitoring for job scheduling. Integrates with Open-Meteo API and RainViewer for animated radar.

### API Endpoints
```
GET    /api/weather-alerts                - Get weather alerts for tenant
GET    /api/weather                       - Proxy weather data from Open-Meteo
```

---

## 20. SMART CONTRACTS & BLOCKCHAIN

### What It Does
Solana blockchain stamping for document verification. Creates immutable records of contracts, proposals, and estimates. Includes NFT milestone badges.

### API Endpoints
```
POST   /api/contracts                            - Create smart contract
POST   /api/contracts/:id/stamp                  - Stamp to Solana blockchain
GET    /api/contracts                            - List contracts
GET    /api/contracts/:hallmarkNumber/badge       - Get badge tier
GET    /api/contracts/:id/audit                  - Get audit trail
GET    /api/blockchain/stamps                    - All blockchain stamps
GET    /api/blockchain/stamps/:type/:id          - Stamps for entity
POST   /api/blockchain/stamp                     - Stamp hash to Solana
POST   /api/blockchain/hash                      - Generate hash from data
GET    /api/blockchain/wallet/balance             - Solana wallet balance
GET    /api/milestone/nfts                       - Milestone NFTs
```

---

## 21. GOOGLE INTEGRATIONS

### What It Does
Google Calendar sync (one-way or two-way) and Google Local Services Ads (LSA) lead management.

### API Endpoints
```
GET    /api/google-calendar/connections          - Calendar connections
GET    /api/google-lsa/connections               - LSA connections
GET    /api/google-lsa/leads                     - LSA leads
PUT    /api/google-lsa/connections/:id           - Update LSA connection
```

---

## 22. MESSAGING SYSTEM

### What It Does
Real-time internal messaging with Socket.IO, speech-to-text, typing indicators, and online presence.

### API Endpoints
```
POST   /api/messages/send-message                - Send message
POST   /api/messages/typing                      - Broadcast typing
POST   /api/messages/stop-typing                 - Stop typing
POST   /api/messages/join-conversation           - Join conversation
POST   /api/messages/leave-conversation          - Leave conversation
POST   /api/messages/user-online                 - Mark user online
GET    /api/messages/online-users                - Get online users
```

---

## 23. SEO MANAGEMENT

### What It Does
SEO tag management with performance scoring.

### API Endpoints
```
POST   /api/seo-tags                     - Create SEO tag
GET    /api/seo-tags                     - List tags (filter by type)
PATCH  /api/seo-tags/:id/toggle          - Toggle active status
DELETE /api/seo-tags/:id                 - Delete tag
GET    /api/seo/performance              - Get SEO performance score
```

---

## 24. CREDITS SYSTEM

### What It Does
Prepaid credit model for metered AI features (Measure Tool, Color Match, Room Visualizer, Complete Estimate). Subscription tiers + credit packs via Stripe.

### API Endpoints
```
GET    /api/credits/packs                - Available credit packs
GET    /api/credits/:tenantId            - Credit balance
GET    /api/credits/:tenantId/usage      - Usage logs
GET    /api/credits/:tenantId/summary    - Usage summary
GET    /api/credits/:tenantId/purchases  - Purchase history
POST   /api/credits/purchase             - Buy credits (Stripe checkout)
POST   /api/credits/add-manual           - Admin add credits
POST   /api/toolkit/use-credits          - Deduct credits for tool use
```

---

## 25. WEBHOOKS

### What It Does
Webhook subscriptions for external integrations.

### API Endpoints
```
GET    /api/webhooks                     - List webhook subscriptions
POST   /api/webhooks                     - Create subscription
DELETE /api/webhooks/:id                 - Delete subscription
```

---

## 26. AUTHENTICATION

### What It Does
Multi-method auth: email/password, PIN-based role access (Admin, Owner, Developer, Crew Lead), WebAuthn/biometric, and Firebase.

### API Endpoints
```
POST   /api/auth/login                   - Email/password login
POST   /api/auth/logout                  - Logout
POST   /api/auth/forgot-password         - Request password reset
POST   /api/auth/reset-password          - Reset with token
GET    /api/auth/user                    - Get current user
POST   /api/auth/pin/verify              - Verify PIN
POST   /api/auth/pin/verify-any          - Verify PIN (team login)
POST   /api/auth/pin/change              - Change PIN
POST   /api/auth/pin/init                - Initialize default PINs
POST   /api/auth/webauthn/register-options   - WebAuthn registration
POST   /api/auth/webauthn/register           - Register credential
POST   /api/auth/webauthn/authenticate       - Authenticate
GET    /api/auth/webauthn/auth-options       - Get auth options
DELETE /api/auth/webauthn/credential/:id     - Remove credential
```

---

## MULTI-TENANT ARCHITECTURE

Every table includes a `tenantId` field. The system supports:
- **PaintPros franchise tenants** (npp, lumepaint, demo, murfreesboro, etc.)
- **White-label tenants** (custom branding, colors, services, pricing)
- **Ecosystem tenants** (tradeworks, garagebot, trustshield, etc.)

Tenant config is driven by `VITE_TENANT_ID` env var and the `client/src/config/tenant.ts` file which defines per-tenant: branding, colors, services, pricing rules, feature toggles, and Stripe keys.

---

## DESIGN SYSTEM NOTES FOR UI REPLICATION

1. **Component Library**: Shadcn/UI (Radix primitives) with Tailwind CSS
2. **Custom Components**: GlassCard (frosted glass card), FlipButton (3D hover), BentoGrid (dashboard layout)
3. **Icons**: Lucide React exclusively - NEVER emoji
4. **Animations**: Framer Motion for page/card transitions
5. **Dark Mode**: Full support via CSS variables + Tailwind dark: variants
6. **Mobile-First**: All layouts collapse gracefully. Carousels → horizontal scroll. Grids → single column. Tabs → scrollable.
7. **Color System**: HSL variables in index.css. Tenant `primaryColor` for accents. Semantic tokens (--background, --foreground, --card, --muted, etc.)
8. **Glassmorphism**: Subtle backdrop-blur with semi-transparent backgrounds
9. **Gradient Accents**: Amber=suggestions, Purple=AI, Green=connected/live, Blue=info, Red=alerts
10. **Typography**: Three levels - Default, Secondary (text-muted-foreground), Tertiary (text-muted-foreground/50)

---

## CONNECTION ARCHITECTURE

TrustHome connects to PaintPros.io backend via:
1. **REST API** - All endpoints above accept/return JSON
2. **Tenant isolation** - Pass `tenantId` in request body or query param
3. **Authentication** - PIN-based or token-based depending on endpoint
4. **Real-time** - Socket.IO for messaging and live updates
5. **Webhooks** - Subscribe to events for async notifications

Base URL: `https://paintpros.io/api/`
All requests should include: `Content-Type: application/json`

---

## FILES INCLUDED IN HANDOFF FOLDER

- `TRUSTHOME_FULL_BUSINESS_SUITE_HANDOFF.md` - This document
- `GARAGEBOT_MARKETING_HUB_HANDOFF.md` - GarageBot-specific marketing setup
- `garagebot-marketing-hub.tsx` - Full Marketing Hub frontend (8,333 lines)
