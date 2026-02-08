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

**File location:** `handoffs/TRUSTLAYER_UNIVERSAL_AGENT_CONNECTIVITY_GUIDE.md`
