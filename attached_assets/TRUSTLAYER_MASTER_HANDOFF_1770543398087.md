# TrustLayer Ecosystem - Master Integration Handoff

This is the single master document for any agent in the TrustLayer ecosystem to connect to the PaintPros.io backend. It contains everything: how to connect, what services exist, credentials, data models, UI layouts, and code references.

---

## TABLE OF CONTENTS

- [PART 1: CONNECTIVITY GUIDE](#part-1-connectivity-guide) - Tenant provisioning, authentication, API patterns, full service catalog (A-X), webhooks, subdomains, tenant config schema, error handling, design system, checklist
- [PART 2: FULL BUSINESS SUITE REFERENCE](#part-2-full-business-suite-reference) - 26 services with data models, API endpoints, and UI layouts
- [PART 3: INTEGRATION CREDENTIALS](#part-3-integration-credentials) - API keys status, tenant IDs, base URLs, default PINs, smoke tests, webhook setup, Socket.IO
- [PART 4: GARAGEBOT MARKETING HUB REFERENCE](#part-4-garagebot-marketing-hub-reference) - Database schema, backend routes, frontend component reference

---
---

# PART 1: CONNECTIVITY GUIDE

---

# TrustLayer Ecosystem - Universal Agent Connectivity Guide
## How Any Agent Connects to PaintPros.io Backend Services

**Version:** 1.0 | **Last Updated:** February 2026
**Purpose:** Step-by-step instructions for any agent building an ecosystem product (TrustHome, GarageBot, or any future product) to create a tenant space and connect to the shared PaintPros.io backend.

---

## QUICK START (5 Steps to Connect)

```
Step 1: Request a tenantId from the platform
Step 2: Set up authentication headers
Step 3: Make API calls with tenantId in every request
Step 4: Subscribe to webhooks for real-time events
Step 5: (Optional) Connect Socket.IO for live messaging
```

---

## STEP 1: TENANT PROVISIONING

Every product in the TrustLayer ecosystem operates inside a "tenant space." A tenant isolates all data (leads, jobs, payments, marketing content, etc.) so nothing leaks between businesses.

### How to Create a New Tenant

**Endpoint:** `POST /api/tenants/provision`

```json
// REQUEST
{
  "businessName": "TrustHome Nashville",
  "email": "owner@trusthome.io",
  "phone": "615-555-1234",
  "tenantSlug": "trusthome-nash",
  "tradeVertical": "painting",
  "brandingModel": "custom",
  "subscriptionTier": "full_suite",
  "customBrandConfig": {
    "domain": "trusthome.io",
    "monthlyFee": 499,
    "setupFee": 0
  }
}

// RESPONSE
{
  "success": true,
  "tenantId": "trusthome-nash",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

For internal ecosystem products (no billing required), the system auto-activates without Stripe checkout.

### Activate After Payment

**Endpoint:** `POST /api/tenants/activate`
```json
{
  "tenantId": "trusthome-nash",
  "subscriptionId": "sub_abc123"
}
```

### Get Tenant Details

**Endpoint:** `GET /api/tenants/:tenantId`
```json
// RESPONSE
{
  "id": "trusthome-nash",
  "name": "TrustHome Nashville",
  "status": "active",
  "features": { ... },
  "theme": { ... }
}
```

### Existing Tenant IDs (for reference)
| Tenant ID | Product | Domain |
|-----------|---------|--------|
| `npp` | Nashville Painting Professionals | nashpaintpros.io |
| `demo` | PaintPros.io Platform | paintpros.io |
| `lumepaint` | Lume Paint Co (Murfreesboro) | lumepaint.co |
| `tradeworks` | TradeWorks AI | tradeworksai.io |
| `murfreesboro` | Murfreesboro franchise | murfreesboro.paintpros.io |

---

## STEP 2: AUTHENTICATION

The backend supports multiple auth methods. Choose the right one for your use case.

### Method A: PIN-Based Access (Simplest - for dashboards)

Every tenant has role-based PINs. Best for internal dashboards where team members log in.

**Verify PIN:**
```
POST /api/auth/pin/verify
Content-Type: application/json

{
  "pin": "1234",
  "role": "admin",
  "tenantId": "trusthome-nash"
}

// RESPONSE
{
  "valid": true,
  "role": "admin",
  "name": "Admin User"
}
```

**Roles available:** `admin`, `owner`, `developer`, `crew_lead`

**Initialize default PINs for new tenant:**
```
POST /api/auth/pin/init
{ "tenantId": "trusthome-nash" }
```

### Method B: Email/Password Auth (for customer-facing portals)

```
POST /api/auth/login
{ "email": "user@example.com", "password": "..." }

// Returns session cookie
```

### Method C: Token-Based Portal Access (for customer portals - no login)

Jobs generate a unique `accessToken`. Customers access their portal via `/portal/:token` without creating an account.

```
GET /api/portal/:accessToken

// Returns job data, updates, crew info
```

### Method D: Ecosystem API Auth (for server-to-server calls)

For automated connections between ecosystem products, use the DarkWave auth header.

```javascript
const crypto = require('crypto');

function generateAuthHeader(apiKey, apiSecret) {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${timestamp}:${apiKey}`)
    .digest('hex');
  
  return `DW ${apiKey}:${timestamp}:${signature}`;
}

// Usage
const headers = {
  'Content-Type': 'application/json',
  'Authorization': generateAuthHeader(API_KEY, API_SECRET),
  'X-App-Name': 'TrustHome'
};
```

**Environment variables needed:**
- `ORBIT_ECOSYSTEM_API_KEY` - Your ecosystem API key
- `ORBIT_ECOSYSTEM_API_SECRET` - Your ecosystem API secret

---

## STEP 3: MAKING API CALLS

### Base URL
- **Production:** `https://paintpros.io/api/`
- **Development:** `https://<repl-name>.replit.dev/api/` (uses VITE_TENANT_ID env var)

### Universal Request Pattern

Every API call follows this pattern:

```javascript
const response = await fetch('https://paintpros.io/api/<endpoint>', {
  method: 'POST',  // or GET, PUT, PATCH, DELETE
  headers: {
    'Content-Type': 'application/json',
    // Include auth header if needed (see Step 2)
  },
  body: JSON.stringify({
    tenantId: 'trusthome-nash',  // REQUIRED on POST/PUT
    // ... other fields
  })
});

const data = await response.json();
```

For GET requests, pass tenantId as a query parameter:
```
GET /api/leads?tenantId=trusthome-nash
GET /api/calendar/events?tenantId=trusthome-nash&startDate=2026-02-01
```

### Response Format
All responses are JSON. Errors follow this pattern:
```json
{
  "error": "Human-readable error message",
  "details": { ... }  // Optional
}
```

Success responses return the data directly (object or array).

---

## STEP 4: CONNECT TO SERVICES

Below is the complete API catalog, organized by business function. Every endpoint is ready to use - just supply your tenantId.

---

### 4A. CRM & LEAD MANAGEMENT

**Purpose:** Track customer leads through a sales pipeline (new → contacted → qualified → proposal sent → won/lost) and a jobs pipeline (accepted → scheduled → in progress → complete).

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/leads?tenantId=X` | List all leads |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| POST | `/api/crm/deals` | Create a deal in pipeline |
| PUT | `/api/crm/deals/:id` | Update deal (change stage, value) |
| POST | `/api/crm/activities` | Log activity (call, email, visit, note) |
| POST | `/api/crm/notes` | Add note to lead or deal |
| POST | `/api/leads/score` | Calculate lead score |
| POST | `/api/leads/score-ai` | AI-powered lead scoring |
| GET | `/api/lead-sources?tenantId=X` | Get lead source breakdown |

**Lead create example:**
```json
POST /api/leads
{
  "tenantId": "trusthome-nash",
  "email": "homeowner@email.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "phone": "615-555-9876",
  "address": "123 Oak St, Nashville, TN 37203",
  "propertyType": "residential",
  "projectTypes": ["interior", "exterior"],
  "source": "website",
  "timeline": "warm",
  "notes": "Interested in whole-house repaint"
}
```

**Deal pipeline stages:**
- **Sales:** `new_lead` → `quoted` → `negotiating` → `won` / `lost`
- **Jobs:** `project_accepted` → `scheduled` → `in_progress` → `touch_ups` → `complete`

---

### 4B. ESTIMATES & PROPOSALS

**Purpose:** Generate instant price estimates. Convert estimates into formal proposals with digital signature.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/estimates?tenantId=X` | List all estimates |
| GET | `/api/estimates/:id` | Get specific estimate |
| POST | `/api/estimates/submit` | Submit estimate (sends email) |
| GET | `/api/estimator-config/:tenantId` | Get pricing config for tenant |
| GET | `/api/proposals?tenantId=X` | List proposals |
| GET | `/api/proposals/:id` | Get specific proposal |
| POST | `/api/proposals/generate` | AI-generate proposal from estimate |
| PUT | `/api/proposals/:id/status` | Update proposal status |
| GET | `/api/proposal-templates` | Get templates |

**Estimate submit example:**
```json
POST /api/estimates/submit
{
  "tenantId": "trusthome-nash",
  "customerName": "Sarah Johnson",
  "customerEmail": "sarah@email.com",
  "customerPhone": "615-555-9876",
  "customerAddress": "123 Oak St, Nashville, TN",
  "includeWalls": true,
  "includeTrim": true,
  "includeCeilings": false,
  "doorCount": 4,
  "squareFootage": "2200"
}
```

---

### 4C. BOOKING & SCHEDULING

**Purpose:** Online booking wizard for customers. Manages availability windows and appointment slots.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/bookings?tenantId=X` | List bookings |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| PATCH | `/api/bookings/:id/status` | Change status |
| GET | `/api/availability/:tenantId` | Get available time slots |

**Booking statuses:** `pending` → `confirmed` → `in_progress` → `completed` / `cancelled` / `no_show`

---

### 4D. CALENDAR

**Purpose:** Full event calendar with Google Calendar sync, crew assignment, and iCal export.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/calendar/events?tenantId=X` | Get events (filter by date range) |
| POST | `/api/calendar/events` | Create event |
| PUT | `/api/calendar/events/:id` | Update event |
| DELETE | `/api/calendar/events/:id` | Delete event |
| GET | `/api/ical/:token` | Export iCal feed |
| GET | `/api/google-calendar/connections` | Google Calendar connections |
| POST | `/api/google-calendar/sync` | Trigger Google Calendar sync |

**Event types:** `appointment`, `estimate`, `job`, `meeting`, `reminder`, `blocked`

**Calendar event example:**
```json
POST /api/calendar/events
{
  "tenantId": "trusthome-nash",
  "title": "Interior Paint Estimate - Johnson",
  "eventType": "estimate",
  "startTime": "2026-02-15T10:00:00Z",
  "endTime": "2026-02-15T11:00:00Z",
  "location": "123 Oak St, Nashville, TN",
  "customerName": "Sarah Johnson",
  "customerPhone": "615-555-9876",
  "colorCode": "#f59e0b"
}
```

---

### 4E. JOB MANAGEMENT

**Purpose:** Track jobs from acceptance through completion. Progress updates, GPS check-ins, customer portal.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/jobs?tenantId=X` | List jobs |
| GET | `/api/jobs/:id` | Get specific job |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/:id` | Update job |
| GET | `/api/jobs/:id/updates` | Get job timeline |
| POST | `/api/jobs/:id/updates` | Add progress update |
| POST | `/api/jobs/risk-score` | AI risk scoring |
| GET | `/api/gps-checkins/job/:jobId` | GPS check-ins for job |
| POST | `/api/crew/location` | Update crew GPS |

**Job statuses:** `accepted` → `scheduled` → `in_progress` → `touch_ups` → `complete` / `on_hold` / `cancelled`

---

### 4F. CREW MANAGEMENT

**Purpose:** Crew leads, members, time tracking, skills matching, tips.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/crew-leads?tenantId=X` | List crew leads |
| POST | `/api/crew-leads` | Create crew lead |
| GET | `/api/crew-members/:leadId` | Members under a lead |
| POST | `/api/crew-members` | Add member |
| POST | `/api/crew/skills` | Add skill |
| POST | `/api/jobs/match-crew` | AI match crew to job |
| GET | `/api/time-entries/:memberId` | Time entries |
| POST | `/api/time-entries` | Clock in/out |
| POST | `/api/tips` | Digital tip |

---

### 4G. MARKETING HUB

**Purpose:** Complete social media marketing management. Content library, message templates, bundles, scheduling, analytics, campaigns, AI copy generation, team notes.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/marketing/images/:tenantId` | Image library |
| POST | `/api/marketing/images` | Add image |
| PUT | `/api/marketing/images/:id` | Update image metadata |
| GET | `/api/marketing/posts/:tenantId` | Content posts |
| POST | `/api/marketing/posts` | Create post |
| GET | `/api/marketing/:tenantId/live-posts` | Live scheduled posts |
| POST | `/api/marketing/:tenantId/quick-post` | Quick post to social |
| POST | `/api/marketing-autopilot/generate-captions` | AI generate captions |
| GET | `/api/marketing/optimizations` | Marketing optimizations |
| POST | `/api/marketing/optimize` | AI optimize budget |

**Image library categories:** `interior`, `exterior`, `cabinets`, `decks`, `trim`, `doors`, `commercial`, `before_after`, `crew_at_work`, `general`

**Quick post example:**
```json
POST /api/marketing/trusthome-nash/quick-post
{
  "message": "Just finished this beautiful kitchen refresh in Green Hills! The homeowner chose Benjamin Moore Simply White for a clean, modern look.",
  "imageUrl": "https://storage.example.com/kitchen-project.jpg",
  "platform": "facebook"
}
```

---

### 4H. MARKETING AUTOPILOT

**Purpose:** Automated social media posting. Business subscribes, connects Meta accounts, system posts on schedule.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| POST | `/api/autopilot/onboard` | New business onboarding |
| POST | `/api/marketing-autopilot/subscribe` | Create subscription |
| POST | `/api/marketing-autopilot/:id/activate` | Activate |
| POST | `/api/marketing-autopilot/:id/pause` | Pause |
| POST | `/api/marketing-autopilot/:id/connect-meta` | Connect Meta accounts |
| POST | `/api/marketing-autopilot/:id/preferences` | Save posting preferences |
| POST | `/api/marketing-autopilot/:id/start` | Start autopilot |
| POST | `/api/marketing-autopilot/:id/test-post` | Test post |
| GET | `/api/marketing-autopilot/subscribers` | List subscribers |
| GET | `/api/meta/status/:subscriberId` | Check Meta OAuth status |
| POST | `/api/meta/connect/:subscriberId` | Start Meta OAuth flow |

---

### 4I. BLOG

**Purpose:** Multi-tenant blog with AI-powered content generation and SEO optimization.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/blog/categories?tenantId=X` | Get categories |
| POST | `/api/blog/categories` | Create category |
| POST | `/api/blog/categories/seed` | Seed defaults |
| GET | `/api/blog/posts?tenantId=X` | Get posts |
| GET | `/api/blog/posts/:slug` | Get post by slug |
| POST | `/api/blog/posts` | Create post |
| POST | `/api/blog/ai/generate` | AI generate post |
| POST | `/api/blog/generate-auto` | Trigger auto-generation |

---

### 4J. ANALYTICS

**Purpose:** Unified analytics dashboard with live visitors, traffic, devices, pages, referrers.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/analytics/dashboard?tenantId=X` | Full dashboard data |
| GET | `/api/analytics/live?tenantId=X` | Live visitor count |
| GET | `/api/analytics/geography?tenantId=X` | Geographic data |
| GET | `/api/analytics/tenants` | Available tenants |
| POST | `/api/analytics/track` | Track a page view |

---

### 4K. PAYMENTS & INVOICING

**Purpose:** Stripe payments for estimates/proposals. Deposits, auto-invoicing.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/payments?tenantId=X` | List payments |
| GET | `/api/payments/:id` | Get payment |
| GET | `/api/estimates/:id/payment` | Payment for estimate |
| POST | `/api/credits/purchase` | Create Stripe checkout |
| GET | `/api/invoices/auto?tenantId=X` | Auto-generated invoices |
| GET | `/api/stripe/status` | Stripe connection status |

---

### 4L. CUSTOMER PORTAL

**Purpose:** No-login customer access to job progress, updates, crew GPS, tips, documents.

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/portal/:accessToken` | Get portal data |
| POST | `/api/portal/create` | Create portal access token |

---

### 4M. WARRANTIES

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/warranties?tenantId=X` | List warranties |
| PUT | `/api/warranties/:id` | Update warranty |
| GET | `/api/warranties/expiring/:days` | Expiring soon |

---

### 4N. REFERRAL PROGRAM

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/referrals?tenantId=X` | List referral programs |
| GET | `/api/referrals/code/:code` | Lookup by code |
| POST | `/api/referrals` | Create referral program |

---

### 4O. FINANCING

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/financing/plans?tenantId=X` | Available plans |
| GET | `/api/financing/applications?tenantId=X` | Applications |
| POST | `/api/financing/apply` | Submit application |
| POST | `/api/financing/prequalify` | Pre-qualify customer |

---

### 4P. PORTFOLIO & GALLERY

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/portfolio?tenantId=X` | Portfolio entries |
| GET | `/api/portfolio/:id` | Specific entry |
| POST | `/api/gallery` | Create gallery |
| GET | `/api/project-images/:tenantId` | Project images |
| GET | `/api/project-images/:tenantId/pairs` | Before/after pairs |
| POST | `/api/project-images/:tenantId` | Upload image |

---

### 4Q. AI-POWERED TOOLS

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| POST | `/api/voice-estimate` | Voice → estimate data |
| POST | `/api/followup/optimize` | Best follow-up actions |
| POST | `/api/profit/analyze` | Profit margin analysis |
| POST | `/api/demand/forecast` | Seasonal demand forecast |
| POST | `/api/clv/calculate` | Customer Lifetime Value |
| POST | `/api/routes/optimize` | Crew route optimization |
| POST | `/api/cashflow/forecast` | Cash flow forecasting |
| POST | `/api/pricing/analyze` | Pricing elasticity |
| POST | `/api/proposals/generate` | AI proposal generation |

---

### 4R. SUBCONTRACTORS

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/subcontractors?tenantId=X` | List subcontractors |
| PUT | `/api/subcontractors/:id` | Update |
| GET | `/api/subcontractor-assignments/:jobId` | Assignments for job |
| POST | `/api/subcontractor-assignments` | Create assignment |
| DELETE | `/api/subcontractor-assignments/:id` | Remove assignment |

---

### 4S. WEATHER ALERTS

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/weather-alerts?tenantId=X` | Weather alerts |
| GET | `/api/weather?lat=X&lon=Y` | Weather data proxy |

---

### 4T. BLOCKCHAIN & SMART CONTRACTS

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| POST | `/api/contracts` | Create smart contract |
| POST | `/api/contracts/:id/stamp` | Stamp to Solana |
| GET | `/api/contracts?tenantId=X` | List contracts |
| GET | `/api/blockchain/stamps` | All stamps |
| POST | `/api/blockchain/stamp` | Stamp hash to Solana |
| POST | `/api/blockchain/hash` | Generate hash |
| GET | `/api/blockchain/wallet/balance` | Wallet balance |

---

### 4U. GOOGLE INTEGRATIONS

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/google-calendar/connections` | Calendar connections |
| POST | `/api/google-calendar/sync` | Trigger sync |
| GET | `/api/google-lsa/connections` | LSA connections |
| GET | `/api/google-lsa/leads` | LSA leads |

---

### 4V. MESSAGING (Real-Time)

Uses Socket.IO for real-time communication.

**HTTP endpoints:**
| Method | Endpoint | What It Does |
|--------|----------|--------------|
| POST | `/api/messages/send-message` | Send message |
| POST | `/api/messages/join-conversation` | Join conversation |
| POST | `/api/messages/user-online` | Mark online |
| GET | `/api/messages/online-users` | Online users |

**Socket.IO connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('https://paintpros.io', {
  path: '/socket.io'
});

// Listen for messages
socket.on('new-message', (message) => { ... });

// Send typing indicator
socket.emit('typing', { userId: '...', conversationId: '...' });

// Track online status
socket.emit('user-online', { userId: '...', role: 'admin', displayName: 'Sarah' });
```

---

### 4W. SEO MANAGEMENT

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| POST | `/api/seo-tags` | Create SEO tag |
| GET | `/api/seo-tags?tenantId=X` | List tags |
| PATCH | `/api/seo-tags/:id/toggle` | Toggle active |
| DELETE | `/api/seo-tags/:id` | Delete tag |
| GET | `/api/seo/performance?tenantId=X` | SEO score |

---

### 4X. CREDITS SYSTEM

| Method | Endpoint | What It Does |
|--------|----------|--------------|
| GET | `/api/credits/packs` | Available packs |
| GET | `/api/credits/:tenantId` | Credit balance |
| GET | `/api/credits/:tenantId/usage` | Usage logs |
| GET | `/api/credits/:tenantId/summary` | Usage summary |
| POST | `/api/credits/purchase` | Buy credits (Stripe) |
| POST | `/api/credits/add-manual` | Admin add credits |
| POST | `/api/toolkit/use-credits` | Deduct for tool use |

---

## STEP 5: WEBHOOKS (Event Subscriptions)

Subscribe to events so your product gets notified when things happen on the platform.

### Create Webhook Subscription
```json
POST /api/webhooks
{
  "tenantId": "trusthome-nash",
  "url": "https://trusthome.io/api/webhook-receiver",
  "events": ["lead.created", "job.updated", "payment.received", "booking.confirmed"]
}
```

### List Subscriptions
```
GET /api/webhooks?tenantId=trusthome-nash
```

### Delete Subscription
```
DELETE /api/webhooks/:id
```

---

## STEP 6: SUBDOMAIN SYSTEM (Optional)

Products can claim a subdomain under `tlid.io` (TrustLayer ID).

### Check Availability
```
GET /api/domains/check/:subdomain
// Returns: { available: true, subdomain: "trusthome", fullDomain: "trusthome.tlid.io" }
```

### Claim Subdomain
```json
POST /api/domains/claim
{
  "subdomain": "trusthome",
  "businessName": "TrustHome Nashville",
  "targetType": "redirect",
  "targetUrl": "https://trusthome.io"
}
```

### Resolve Subdomain
```
GET /api/domains/resolve/:subdomain
```

---

## TENANT CONFIGURATION SCHEMA

When building UI for a tenant, here's what you can configure:

```typescript
interface TenantConfig {
  id: string;                    // Unique tenant slug
  name: string;                  // Display name
  tagline: string;               // Short tagline
  description: string;           // Full description
  
  tradeVertical: 'painting' | 'roofing' | 'hvac' | 'electrical' | 
                 'plumbing' | 'landscaping' | 'construction' | 'multi_trade';
  
  brandingModel: 'franchise' | 'custom';
  subscriptionTier: 'estimator_only' | 'full_suite';
  
  theme: {
    primaryColor: string;        // Hex color for accents
    accentColor: string;         // Secondary accent
    darkMode: { background: string; foreground: string; };
    lightMode: { background: string; foreground: string; };
  };
  
  services: {
    interiorPainting: boolean;
    exteriorPainting: boolean;
    commercialPainting: boolean;
    residentialPainting: boolean;
    trimAndMolding: boolean;
    ceilings: boolean;
    doors: boolean;
    drywallRepair: boolean;
    cabinetPainting: boolean;
    deckStaining: boolean;
    pressureWashing: boolean;
  };
  
  pricing: {
    doorsPerUnit: number;
    wallsPerSqFt: number;
    fullJobPerSqFt: number;
    ceilingsPerSqFt?: number;
    trimPerLinearFt?: number;
  };
  
  features: {
    estimator: boolean;
    portfolio: boolean;
    reviews: boolean;
    blog: boolean;
    onlineBooking: boolean;
    aiAssistant: boolean;
  };
  
  contact: { phone, email, address };
  social: { facebook, instagram, twitter, linkedin, google };
  seo: { title, description, keywords[], serviceAreas[] };
  credentials: { googleRating, yearsInBusiness, ... };
}
```

---

## ERROR HANDLING

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid auth) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 500 | Server error |

Error response format:
```json
{
  "error": "Human-readable description",
  "message": "Alternative message field",
  "details": { }
}
```

---

## DESIGN SYSTEM (For Building Matching UI)

If you're building a frontend that matches the PaintPros.io design language:

1. **Component Library:** Shadcn/UI (Radix primitives) + Tailwind CSS
2. **Icons:** Lucide React - never emoji
3. **Animations:** Framer Motion
4. **Custom Components:** GlassCard (frosted glass), FlipButton (3D hover)
5. **Dark/Light Mode:** CSS variables with Tailwind dark: variants
6. **Mobile-First:** All layouts collapse for mobile
7. **Gradient Accents:** Amber=suggestions, Purple=AI, Green=connected, Blue=info, Red=alerts
8. **Typography:** Inter font, three hierarchy levels
9. **Spacing:** Consistent padding system (p-3 small, p-4 medium, p-6 large)
10. **Border Radius:** Small (`rounded-md`) unless pill/circle

---

## CHECKLIST FOR NEW AGENT INTEGRATION

- [ ] Decide which services your product needs (CRM? Calendar? Marketing? All?)
- [ ] Provision a tenant (`POST /api/tenants/provision`)
- [ ] Set up authentication method (PIN, token, or ecosystem API key)
- [ ] Test connectivity with a simple GET request
- [ ] Set up webhook subscriptions for events you care about
- [ ] (Optional) Connect Socket.IO for real-time messaging
- [ ] (Optional) Claim a subdomain under tlid.io
- [ ] Build your frontend UI using the same design system

---

## QUESTIONS?

This document is maintained by the TrustLayer development team. If a new endpoint is added to the PaintPros.io backend, it should be documented here and follows the same tenantId isolation pattern.

---
---

# PART 2: FULL BUSINESS SUITE REFERENCE

---

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
---

# PART 3: INTEGRATION CREDENTIALS

---

# TrustHome Integration - Credentials & Connection Details

**Status:** READY TO CONNECT
**Reference:** See PART 1 (Connectivity Guide) above for full API catalog (Version 1.0, Feb 2026)

---

## 1. ECOSYSTEM API CREDENTIALS

| Item | Status | Details |
|------|--------|---------|
| `ORBIT_ECOSYSTEM_API_KEY` | CONFIGURED | Already set in environment secrets |
| `ORBIT_ECOSYSTEM_API_SECRET` | CONFIGURED | Already set in environment secrets |
| `DARKWAVE_API_KEY` | CONFIGURED | For blockchain stamping (Solana) |
| `DARKWAVE_API_SECRET` | CONFIGURED | For blockchain stamping (Solana) |
| `ORBIT_FINANCIAL_HUB_SECRET` | CONFIGURED | For financial hub connections |

**How to use them (server-to-server):**
```javascript
const crypto = require('crypto');

function generateAuthHeader(apiKey, apiSecret) {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${timestamp}:${apiKey}`)
    .digest('hex');
  return `DW ${apiKey}:${timestamp}:${signature}`;
}

// Every request from TrustHome to PaintPros.io backend:
const headers = {
  'Content-Type': 'application/json',
  'Authorization': generateAuthHeader(
    process.env.ORBIT_ECOSYSTEM_API_KEY,
    process.env.ORBIT_ECOSYSTEM_API_SECRET
  ),
  'X-App-Name': 'TrustHome'
};
```

---

## 2. TENANT ID

**For development/testing:** Use `demo` (the platform-wide test tenant)

**For production TrustHome:** Provision a new tenant by calling:
```
POST /api/tenants/provision
{
  "businessName": "TrustHome Nashville",
  "email": "owner@trusthome.io",
  "tenantSlug": "trusthome-nash",
  "tradeVertical": "painting",
  "brandingModel": "custom",
  "subscriptionTier": "full_suite"
}
```

**Existing tenants available for reference/testing:**
| Tenant ID | Product |
|-----------|---------|
| `demo` | PaintPros.io Platform (safe for testing) |
| `npp` | Nashville Painting Professionals (live data) |
| `lumepaint` | Lume Paint Co / Murfreesboro (live data) |
| `tradeworks` | TradeWorks AI |

---

## 3. BASE API URL

| Environment | URL |
|-------------|-----|
| **Production** | `https://paintpros.io/api/` |
| **Development** | `https://<repl-name>.replit.dev/api/` |
| **Socket.IO** | `wss://paintpros.io` (path: `/socket.io`) |

All endpoints accept and return JSON. Include `Content-Type: application/json` on every request.

---

## 4. DEFAULT ADMIN PINs (Development)

These are the default PINs initialized when a tenant is set up. They should be changed on first use in production.

| Role | PIN | User | Notes |
|------|-----|------|-------|
| Owner | `1111` | Ryan | Must change on first use |
| Ops Manager | `4444` | Sidonie | Must change on first use |
| Project Manager | `5555` | Hank | Must change on first use |
| Project Manager | `6666` | Garrett | Must change on first use |
| Developer | `0424` | Jason | No change required |
| Crew Lead | `3333` | Crew Lead | Must change on first use |
| Marketing | `8888` | Marketing | Must change on first use |
| Demo Viewer | `7777` | Demo | No change required |

**To initialize PINs for a new TrustHome tenant:**
```
POST /api/auth/pin/init
{ "tenantId": "trusthome-nash" }
```

**To verify a PIN:**
```
POST /api/auth/pin/verify
{
  "pin": "1111",
  "role": "owner",
  "tenantId": "trusthome-nash"
}
```

---

## 5. SERVICES TO CONNECT

Here's the full list of backend services TrustHome can wire into, with the key endpoint for each:

| Service | Test Endpoint | Method |
|---------|--------------|--------|
| CRM / Leads | `/api/leads?tenantId=demo` | GET |
| Calendar | `/api/calendar/events?tenantId=demo` | GET |
| Bookings | `/api/bookings?tenantId=demo` | GET |
| Jobs | `/api/jobs?tenantId=demo` | GET |
| Crew | `/api/crew-leads?tenantId=demo` | GET |
| Marketing Images | `/api/marketing/images/demo` | GET |
| Marketing Posts | `/api/marketing/posts/demo` | GET |
| Blog | `/api/blog/posts?tenantId=demo` | GET |
| Analytics | `/api/analytics/dashboard?tenantId=demo` | GET |
| Payments | `/api/payments?tenantId=demo` | GET |
| Warranties | `/api/warranties?tenantId=demo` | GET |
| Referrals | `/api/referrals?tenantId=demo` | GET |
| Financing | `/api/financing/plans?tenantId=demo` | GET |
| Portfolio | `/api/portfolio?tenantId=demo` | GET |
| SEO | `/api/seo-tags?tenantId=demo` | GET |
| Credits | `/api/credits/demo` | GET |
| Webhooks | `/api/webhooks?tenantId=demo` | GET |
| Blockchain | `/api/blockchain/stamps` | GET |
| Stripe Status | `/api/stripe/status` | GET |
| Online Users | `/api/messages/online-users` | GET |

---

## 6. QUICK SMOKE TEST

Run these three calls to confirm the connection is working:

**Test 1 - Basic connectivity:**
```bash
curl -s https://paintpros.io/api/analytics/live?tenantId=demo
```

**Test 2 - Authenticated call (PIN):**
```bash
curl -s -X POST https://paintpros.io/api/auth/pin/verify \
  -H "Content-Type: application/json" \
  -d '{"pin":"7777","role":"demo_viewer","tenantId":"demo"}'
```

**Test 3 - Data retrieval:**
```bash
curl -s https://paintpros.io/api/leads?tenantId=demo
```

If all three return valid JSON, the connection is live and ready.

---

## 7. WEBHOOK SETUP (for real-time event notifications)

Once connected, subscribe to events so TrustHome gets notified automatically:

```json
POST /api/webhooks
{
  "tenantId": "trusthome-nash",
  "url": "https://trusthome.io/api/webhook-receiver",
  "events": [
    "lead.created",
    "lead.updated",
    "job.created",
    "job.updated",
    "payment.received",
    "booking.confirmed",
    "booking.cancelled"
  ]
}
```

---

## 8. SOCKET.IO SETUP (for real-time messaging)

```javascript
import { io } from 'socket.io-client';

const socket = io('https://paintpros.io', {
  path: '/socket.io'
});

socket.on('connect', () => {
  console.log('TrustHome connected to PaintPros.io messaging');
  
  socket.emit('user-online', {
    userId: 'trusthome-agent',
    role: 'admin',
    displayName: 'TrustHome'
  });
});

socket.on('new-message', (message) => {
  console.log('Received:', message);
});
```

---

## NEXT STEPS

1. Hand this document to the TrustHome agent
2. Agent reads PART 1 (Connectivity Guide) for full API catalog
3. Agent runs the smoke tests above to confirm connectivity
4. Agent provisions a dedicated tenant (`trusthome-nash`)
5. Agent initializes PINs for the new tenant
6. Agent starts building UI and wiring in services
7. Agent subscribes to webhooks for real-time updates

---
---

# PART 4: GARAGEBOT MARKETING HUB REFERENCE

---

# GarageBot Marketing Hub - Complete Handoff

## Files Included
- `handoffs/garagebot-marketing-hub.tsx` - Full frontend UI (8,333 lines) - see separate file
- This section - Backend setup instructions

---

## 1. DATABASE SCHEMA (add to shared/schema.ts)

```typescript
import { pgTable, uuid, varchar, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

// Marketing Posts for content library
export const marketingPosts = pgTable("marketing_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default('garagebot'),
  content: text("content").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(), // facebook, instagram, x, nextdoor
  hashtags: text("hashtags").array(),
  imageFilename: varchar("image_filename", { length: 255 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Images library
export const marketingImages = pgTable("marketing_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default('garagebot'),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meta (Facebook/Instagram) Integration
export const metaIntegrations = pgTable("meta_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().unique(),
  facebookPageId: varchar("facebook_page_id", { length: 100 }),
  facebookPageName: varchar("facebook_page_name", { length: 255 }),
  facebookPageAccessToken: text("facebook_page_access_token"),
  facebookConnected: boolean("facebook_connected").default(false),
  instagramAccountId: varchar("instagram_account_id", { length: 100 }),
  instagramUsername: varchar("instagram_username", { length: 100 }),
  instagramConnected: boolean("instagram_connected").default(false),
  twitterApiKey: varchar("twitter_api_key", { length: 255 }),
  twitterApiSecret: varchar("twitter_api_secret", { length: 255 }),
  twitterAccessToken: varchar("twitter_access_token", { length: 255 }),
  twitterAccessTokenSecret: varchar("twitter_access_token_secret", { length: 255 }),
  twitterUsername: varchar("twitter_username", { length: 100 }),
  twitterConnected: boolean("twitter_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled Posts tracking
export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  scheduledFor: timestamp("scheduled_for").notNull(),
  postedAt: timestamp("posted_at"),
  externalPostId: varchar("external_post_id", { length: 100 }),
  status: varchar("status", { length: 20 }).default('pending'), // pending, posted, failed
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 2. SECRETS NEEDED (Replit Secrets)

```
META_APP_ID          - Facebook App ID
META_APP_SECRET      - Facebook App Secret  
TWITTER_API_KEY      - X/Twitter API Key
TWITTER_API_SECRET   - X/Twitter API Secret
TWITTER_ACCESS_TOKEN - X/Twitter Access Token
TWITTER_ACCESS_TOKEN_SECRET - X/Twitter Access Token Secret
```

---

## 3. SOCIAL CONNECTORS (server/social-connectors.ts)

```typescript
import crypto from 'crypto';

export interface DeployResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

export class TwitterConnector {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret);
  }

  private getOAuthHeader(method: string, url: string): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
    };
    const signature = generateOAuthSignature(method, url, oauthParams, this.apiSecret, this.accessTokenSecret);
    oauthParams.oauth_signature = signature;
    const headerParts = Object.keys(oauthParams).filter(k => k.startsWith('oauth_')).sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`);
    return `OAuth ${headerParts.join(', ')}`;
  }

  async post(text: string): Promise<DeployResult> {
    if (!this.isConfigured()) return { success: false, error: 'Twitter not configured' };
    try {
      const url = 'https://api.twitter.com/2/tweets';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.getOAuthHeader('POST', url),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.ok && data.data?.id) {
        return { success: true, externalId: data.data.id };
      }
      return { success: false, error: JSON.stringify(data) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

export async function postToFacebook(
  pageId: string,
  pageToken: string,
  message: string,
  imageUrl?: string
): Promise<DeployResult> {
  try {
    let url: string;
    let body: any;
    if (imageUrl) {
      url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
      body = { url: imageUrl, message, access_token: pageToken };
    } else {
      url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
      body = { message, access_token: pageToken };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.id || data.post_id) {
      return { success: true, externalId: data.id || data.post_id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function postToInstagram(
  accountId: string,
  accessToken: string,
  caption: string,
  imageUrl: string
): Promise<DeployResult> {
  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
      }
    );
    const containerData = await containerResponse.json();
    if (!containerData.id) {
      return { success: false, error: JSON.stringify(containerData) };
    }
    // Step 2: Publish
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
      }
    );
    const publishData = await publishResponse.json();
    if (publishData.id) {
      return { success: true, externalId: publishData.id };
    }
    return { success: false, error: JSON.stringify(publishData) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

---

## 4. MARKETING SCHEDULER (server/marketing-scheduler.ts)

```typescript
import { db } from './db';
import { marketingPosts, marketingImages, metaIntegrations, scheduledPosts } from '@shared/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { TwitterConnector, postToFacebook, postToInstagram } from './social-connectors';

const POSTING_HOURS = [8, 10, 12, 14, 16, 18, 20]; // 7 posts/day
const GARAGEBOT_URL = 'https://garagebot.io';

let isRunning = false;
let lastPostHour = -1;

async function getIntegration() {
  const [integration] = await db.select().from(metaIntegrations)
    .where(eq(metaIntegrations.tenantId, 'garagebot')).limit(1);
  return integration;
}

async function getNextPost() {
  const [post] = await db.select().from(marketingPosts)
    .where(and(eq(marketingPosts.tenantId, 'garagebot'), eq(marketingPosts.isActive, true)))
    .orderBy(asc(marketingPosts.usageCount), asc(marketingPosts.lastUsedAt)).limit(1);
  return post;
}

async function getNextImage() {
  const [image] = await db.select().from(marketingImages)
    .where(and(eq(marketingImages.tenantId, 'garagebot'), eq(marketingImages.isActive, true)))
    .orderBy(asc(marketingImages.usageCount), asc(marketingImages.lastUsedAt)).limit(1);
  return image;
}

async function executeScheduledPosts() {
  const now = new Date();
  const hour = now.getHours();
  
  // Only post once per hour slot, and only at designated hours
  if (!POSTING_HOURS.includes(hour) || hour === lastPostHour) return;
  lastPostHour = hour;

  const integration = await getIntegration();
  if (!integration) {
    console.log('[GarageBot Marketing] No integration configured');
    return;
  }

  const post = await getNextPost();
  const image = await getNextImage();
  if (!post && !image) {
    console.log('[GarageBot Marketing] No content available');
    return;
  }

  const message = post 
    ? `${post.content}\n\n${GARAGEBOT_URL}` 
    : `Check out GarageBot - your trusted auto repair estimator!\n\n${GARAGEBOT_URL}`;
  
  // Replace YOUR_DOMAIN with actual domain or object storage URL
  const imageUrl = image ? `https://YOUR_DOMAIN/${image.filePath}` : undefined;

  console.log(`[GarageBot Marketing] Posting at ${hour}:00...`);

  // Facebook
  if (integration.facebookConnected && integration.facebookPageId && integration.facebookPageAccessToken) {
    const result = await postToFacebook(
      integration.facebookPageId, 
      integration.facebookPageAccessToken, 
      message, 
      imageUrl
    );
    console.log(`[GarageBot FB] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  // Instagram (requires image)
  if (integration.instagramConnected && integration.instagramAccountId && imageUrl) {
    const result = await postToInstagram(
      integration.instagramAccountId, 
      integration.facebookPageAccessToken!, 
      message, 
      imageUrl
    );
    console.log(`[GarageBot IG] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  // X/Twitter
  const twitter = new TwitterConnector();
  if (twitter.isConfigured()) {
    // Truncate for Twitter's 280 char limit
    const tweetContent = message.length > 280 ? message.substring(0, 277) + '...' : message;
    const result = await twitter.post(tweetContent);
    console.log(`[GarageBot X] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  // Update usage counts
  if (post) {
    await db.update(marketingPosts)
      .set({ usageCount: sql`${marketingPosts.usageCount} + 1`, lastUsedAt: new Date() })
      .where(eq(marketingPosts.id, post.id));
  }
  if (image) {
    await db.update(marketingImages)
      .set({ usageCount: sql`${marketingImages.usageCount} + 1`, lastUsedAt: new Date() })
      .where(eq(marketingImages.id, image.id));
  }
}

export function startMarketingScheduler() {
  if (isRunning) return;
  console.log('[GarageBot Marketing] Starting scheduler...');
  console.log('[GarageBot Marketing] Post times: 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm');
  isRunning = true;
  
  // Check every minute
  setInterval(() => executeScheduledPosts().catch(console.error), 60 * 1000);
  
  // Initial check
  executeScheduledPosts().catch(console.error);
}
```

---

## 5. API ROUTES (add to server/routes.ts)

```typescript
import { marketingPosts, marketingImages, metaIntegrations, scheduledPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { TwitterConnector, postToFacebook, postToInstagram } from './social-connectors';

// Get all posts
app.get('/api/marketing/posts', async (req, res) => {
  const posts = await db.select().from(marketingPosts)
    .where(eq(marketingPosts.tenantId, 'garagebot'));
  res.json(posts);
});

// Create post
app.post('/api/marketing/posts', async (req, res) => {
  const { content, platform, hashtags } = req.body;
  const [post] = await db.insert(marketingPosts)
    .values({ tenantId: 'garagebot', content, platform, hashtags })
    .returning();
  res.json(post);
});

// Delete post
app.delete('/api/marketing/posts/:id', async (req, res) => {
  await db.delete(marketingPosts).where(eq(marketingPosts.id, req.params.id));
  res.json({ success: true });
});

// Get images
app.get('/api/marketing/images', async (req, res) => {
  const images = await db.select().from(marketingImages)
    .where(eq(marketingImages.tenantId, 'garagebot'));
  res.json(images);
});

// Get integration status
app.get('/api/marketing/integration', async (req, res) => {
  const [integration] = await db.select().from(metaIntegrations)
    .where(eq(metaIntegrations.tenantId, 'garagebot'));
  res.json(integration || { 
    facebookConnected: false, 
    instagramConnected: false, 
    twitterConnected: false 
  });
});

// Get scheduled posts
app.get('/api/marketing/scheduled', async (req, res) => {
  const posts = await db.select().from(scheduledPosts)
    .where(eq(scheduledPosts.tenantId, 'garagebot'));
  res.json(posts);
});

// Post now (immediate post)
app.post('/api/marketing/post-now', async (req, res) => {
  const { content, platform, imageUrl } = req.body;
  const [integration] = await db.select().from(metaIntegrations)
    .where(eq(metaIntegrations.tenantId, 'garagebot'));
  
  if (!integration) {
    return res.json({ success: false, error: 'No social accounts connected' });
  }

  let result = { success: false, error: 'Platform not configured' };

  if (platform === 'facebook' || platform === 'all') {
    if (integration.facebookConnected && integration.facebookPageId) {
      result = await postToFacebook(
        integration.facebookPageId,
        integration.facebookPageAccessToken!,
        content,
        imageUrl
      );
    }
  }

  if (platform === 'x' || platform === 'all') {
    const twitter = new TwitterConnector();
    if (twitter.isConfigured()) {
      result = await twitter.post(content);
    }
  }

  if (platform === 'instagram' || platform === 'all') {
    if (integration.instagramConnected && integration.instagramAccountId && imageUrl) {
      result = await postToInstagram(
        integration.instagramAccountId,
        integration.facebookPageAccessToken!,
        content,
        imageUrl
      );
    }
  }

  res.json(result);
});
```

---

## 6. START SCHEDULER (add to server/index.ts)

```typescript
import { startMarketingScheduler } from './marketing-scheduler';

// Add after app.listen():
startMarketingScheduler();
```

---

## 7. FACEBOOK APP SETUP

1. Go to https://developers.facebook.com
2. Create or select your app
3. Add "Facebook Login" product
4. Add permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
5. Generate a Page Access Token (use the Token Debugger to extend to 60 days or never-expiring)
6. Store credentials in the `meta_integrations` table:

```sql
INSERT INTO meta_integrations (tenant_id, facebook_page_id, facebook_page_name, facebook_page_access_token, facebook_connected)
VALUES ('garagebot', 'YOUR_PAGE_ID', 'GarageBot', 'YOUR_TOKEN', true);
```

---

## 8. SEED CONTENT (run once)

```sql
INSERT INTO marketing_posts (tenant_id, content, platform) VALUES
('garagebot', 'Stop overpaying for auto repairs! GarageBot shows you fair prices for any car service.', 'facebook'),
('garagebot', 'Know before you go. GarageBot gives you repair estimates in seconds.', 'facebook'),
('garagebot', 'Mechanics hate this one simple trick... just kidding, they love informed customers!', 'x'),
('garagebot', 'Your car deserves fair pricing. Get instant estimates with GarageBot.', 'instagram'),
('garagebot', 'Brake job quote too high? Check it with GarageBot first.', 'all'),
('garagebot', 'Oil change, brakes, transmission - know the fair price before you pay.', 'all'),
('garagebot', 'Empower yourself at the mechanic. GarageBot has your back.', 'facebook'),
('garagebot', 'No more repair shop anxiety. Get estimates instantly.', 'instagram');
```

---

## 9. FRONTEND SETUP

1. The full frontend UI component is located at `handoffs/garagebot-marketing-hub.tsx` (8,333 lines)
2. Copy it to `client/src/pages/marketing-hub.tsx`
3. Add route in `App.tsx`:
```tsx
import MarketingHub from "@/pages/marketing-hub";
// ...
<Route path="/marketing" component={MarketingHub} />
```
4. Update imports - the frontend file references PaintPros-specific assets, you'll need to:
   - Remove/replace image imports at the top
   - Update tenant references from painting to auto repair
   - Adjust color schemes to match GarageBot branding

---

## 10. QUICK ADAPTATION CHECKLIST

- [ ] Add database schema and run `npm run db:push`
- [ ] Add secrets to Replit
- [ ] Create `server/social-connectors.ts`
- [ ] Create `server/marketing-scheduler.ts`
- [ ] Add API routes
- [ ] Start scheduler in index.ts
- [ ] Copy and adapt frontend file
- [ ] Connect Facebook/Instagram via Meta Developer
- [ ] Seed initial content
- [ ] Test posting!

---

## Notes

- The frontend file is built for PaintPros - you'll need to update branding, colors, and image imports
- The scheduler posts 7 times per day (8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm)
- X/Twitter free tier: 500 posts/month - the scheduler includes burst protection
- Instagram REQUIRES an image for every post
- Facebook can post with or without images
