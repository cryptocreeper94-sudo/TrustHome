export interface FeatureHelp {
  title: string;
  description: string;
  details: string[];
  examples?: string[];
}

export const SCREEN_HELP: Record<string, FeatureHelp> = {
  dashboard: {
    title: 'Your Dashboard',
    description: 'This is your command center. Everything you need to manage your business is accessible from here.',
    details: [
      'Stat cards show real-time metrics — tap any card to dive deeper',
      'Today\'s schedule keeps you on track with showings, meetings, and deadlines',
      'The activity feed shows recent actions across all your transactions',
      'Quick-access navigation takes you directly to any section',
    ],
    examples: [
      'Tap "Active Clients" to jump to your client list',
      'Swipe horizontally through property cards to see featured listings',
    ],
  },
  properties: {
    title: 'Properties & Listings',
    description: 'Manage your entire listing portfolio. View active, pending, and sold properties with detailed analytics.',
    details: [
      'Filter by status, price range, or property type',
      'Each listing card shows key stats like days on market and showing count',
      'MLS data syncs automatically to keep everything current',
      'Tap any listing for full details, photos, and activity history',
    ],
    examples: [
      'Use the filter pills to quickly find active vs. under contract listings',
      'The heart icon lets you save properties to your shortlist',
    ],
  },
  transactions: {
    title: 'Transaction Pipeline',
    description: 'Track every deal from initial contact through closing. Each transaction moves through defined stages with automated reminders.',
    details: [
      'Deals are organized by stage: Search, Offer, Under Contract, Closing',
      'Color-coded status indicators show urgency at a glance',
      'Deadline alerts prevent missed contingencies or filing dates',
      'All parties (lender, inspector, title, etc.) are linked to each transaction',
    ],
    examples: [
      'Tap a deal card to see the full timeline and connected parties',
      'Stage badges show how many days a deal has been at its current stage',
    ],
  },
  showings: {
    title: 'Calendar & Showings',
    description: 'Your visual schedule for showings, open houses, inspections, and meetings. Syncs with your external calendar.',
    details: [
      'Color-coded events by type — showings, open houses, inspections, meetings',
      'Tap any day to see its full agenda',
      'Upcoming events appear in a scrollable list below the calendar',
      'Calendar syncs with Google Calendar and Apple Calendar',
    ],
    examples: [
      'Blue dots indicate showing appointments, green for open houses',
      'Tap the + button to schedule a new event',
    ],
  },
  messages: {
    title: 'Messages',
    description: 'Communicate with clients, vendors, and team members. Every conversation is linked to its relevant transaction for full context.',
    details: [
      'Conversations are organized by contact with unread badges',
      'Transaction context appears at the top of each thread',
      'Supports text, documents, and image attachments',
    ],
  },
  documents: {
    title: 'Document Vault',
    description: 'All transaction documents in one secure location. Every document is tracked, versioned, and optionally verified on the blockchain.',
    details: [
      'Documents are organized by transaction with status tracking',
      'Blockchain verification provides tamper-proof integrity',
      'Version history tracks every change with timestamps',
      'e-Signature integration for seamless contract execution',
    ],
    examples: [
      'Green checkmarks indicate signed and verified documents',
      'The shield icon shows blockchain-verified files',
    ],
  },
  analytics: {
    title: 'Performance Analytics',
    description: 'Understand your business performance with real-time dashboards and trend analysis.',
    details: [
      'Track closings, revenue, and average sale price over time',
      'Lead source breakdown shows where your clients are coming from',
      'Conversion funnel reveals your pipeline efficiency',
      'Compare performance across time periods',
    ],
  },
  marketing: {
    title: 'Marketing Hub',
    description: 'Create, schedule, and manage your marketing across all channels. AI-powered tools help you generate compelling content.',
    details: [
      'AI content generation for listing descriptions and social posts',
      'Schedule posts across Facebook, Instagram, and other platforms',
      'Email campaign management with templates and tracking',
      'Performance metrics show engagement and reach',
    ],
  },
  marketingOverview: {
    title: 'Marketing Overview',
    description: 'Your marketing dashboard at a glance. Stats update in real time as you create and schedule posts.',
    details: [
      'Stat cards show your post count, scheduled items, total reach, and engagement rate',
      'The Suggested Post section uses AI to draft content based on your active listings',
      'Content Library breaks down your content by type — posts, emails, and ads',
      'Autopilot Status shows which social platforms are connected for auto-posting',
    ],
    examples: [
      'Tap "Post Now" on a suggested post to publish it immediately',
      'Connect your Facebook page under Autopilot Status to enable scheduling',
    ],
  },
  marketingContent: {
    title: 'Content Management',
    description: 'Create and manage social posts, email campaigns, and ad copy. Browse your content library and track status.',
    details: [
      'The carousel at the top shows your most recent content pieces',
      'Content is organized by status: Published, Scheduled, and Draft',
      'Each post shows its target platforms (FB, IG, X) and scheduled date',
      'Type badges indicate whether content is a Social Post, Email, or Ad Copy',
    ],
    examples: [
      'Expand the "Draft" section to find posts you haven\'t finished yet',
      'Platform pills show which channels each post targets',
    ],
  },
  marketingSchedule: {
    title: 'Content Schedule',
    description: 'Your weekly posting calendar. Plan your content distribution across the week for maximum reach.',
    details: [
      'Each day of the week is listed with a post count badge when content is queued',
      'Expand any day to see the specific posts scheduled with their times and platforms',
      'Days without content show "No posts scheduled" — tap to create content for that day',
      'The week header automatically shows the current week\'s date range',
    ],
    examples: [
      'Schedule posts from the Content tab, then see them appear here by day',
      'Aim for 3-5 posts per week across different platforms for best engagement',
    ],
  },
  marketingAnalytics: {
    title: 'Marketing Analytics',
    description: 'Track your marketing performance over the last 30 days. See what\'s working and optimize your strategy.',
    details: [
      'Performance bars show impressions, reach, clicks, engagement, and shares',
      'Key metrics cards display CTR, conversion rate, and cost per click',
      'Top Performing Content highlights your best posts by engagement',
      'All metrics update automatically as your posts receive interactions',
    ],
    examples: [
      'Compare your reach vs. engagement to understand content quality',
      'Use top-performing content as a template for future posts',
    ],
  },
  network: {
    title: 'Professional Network',
    description: 'Manage your contacts across the real estate ecosystem. Find and connect with inspectors, lenders, title companies, and more.',
    details: [
      'Organized by professional category for easy access',
      'Direct communication links for calls and messages',
      'Referral tracking and relationship management',
      'Quick-add contacts directly to active transactions',
    ],
  },
  blog: {
    title: 'Blog Management',
    description: 'Create and manage SEO-optimized blog content. AI tools help generate professional articles to establish your expertise.',
    details: [
      'AI-powered article generation with one-click publishing',
      'SEO-friendly formatting with meta tags and slugs',
      'Draft, published, and scheduled content management',
      'Blog posts appear on your public-facing website automatically',
    ],
  },
  settings: {
    title: 'Settings & Profile',
    description: 'Manage your account, notification preferences, integrations, and white-label branding customization.',
    details: [
      'Profile editing with license and brokerage information',
      'Notification controls for push, email, and SMS alerts',
      'Theme preferences with light, dark, and system modes',
      'White-label branding for your custom-branded experience',
      'Integration status for CRM, MLS, and ecosystem connections',
    ],
  },
  trustScore: {
    title: 'Trust Score',
    description: 'Your Trust Score is a comprehensive metric powered by the Trust Layer blockchain, reflecting your professional reputation and transaction history.',
    details: [
      'Score ranges from 0-100 based on verified activity',
      'Factors include: completed transactions, client reviews, document verification, and professional certifications',
      'Higher scores unlock premium features and priority placement',
      'Score is updated in real-time as transactions complete',
    ],
  },
  branding: {
    title: 'Branding & Profile',
    description: 'Customize your agent profile, brand identity, and client-facing materials. All branding changes sync across the TrustHome ecosystem.',
    details: [
      'Update your agent profile with photo, contact info, and license details',
      'Choose a primary brand color to personalize your experience',
      'Upload a custom logo for your brokerage or personal brand',
      'Share your agent landing page with clients via link or QR code',
      'Configure white-label settings for custom domains and email templates',
      'All changes sync with your DarkWave ecosystem account',
    ],
  },
  mlsSetup: {
    title: 'MLS Integration',
    description: 'Connect your MLS board to automatically sync listings and market data into TrustHome. Each agent connects their own MLS credentials.',
    details: [
      'Select your MLS data provider (Bridge, Spark, Trestle, or other)',
      'Enter your API credentials from your MLS board',
      'Test the connection before activating auto-sync',
      'TrustHome supports RESO Web API 2.0 standard',
      'Listings, photos, market data, and agent rosters all sync automatically',
      'Your credentials are encrypted and stored securely per-agent',
    ],
  },
  support: {
    title: 'Help & Support',
    description: 'Access help resources, frequently asked questions, contact support, and explore ecosystem links all in one place.',
    details: [
      'Quick Help provides one-tap access to getting started guides and video tutorials',
      'Browse frequently asked questions for instant answers to common topics',
      'Contact support via email, phone, or live chat during business hours',
      'Ecosystem Resources link to DarkWave Studios, Trust Layer, Trust Shield, and more',
      'Submit feature requests directly to the product team',
      'App Info displays the current version and build details',
    ],
  },
  leads: {
    title: 'Leads & CRM',
    description: 'Track every client from first contact to closing day. Smart lead scoring, automated follow-ups, and a pipeline view keep you organized.',
    details: [
      'Leads are organized by status: New, Contacted, Qualified, Under Contract',
      'Lead score is calculated from engagement, response time, and activity',
      'Contact cards show communication history and linked properties',
      'Automated follow-up reminders prevent leads from going cold',
    ],
    examples: [
      'Tap a lead card to see their full profile and conversation history',
      'Use filters to focus on hot leads that need attention today',
    ],
  },
  mediaStudio: {
    title: 'Media Studio',
    description: 'Create professional listing photos, virtual tours, and marketing materials. AI-powered tools help you produce stunning content.',
    details: [
      'Upload and edit photos with professional filters and adjustments',
      'Create virtual tour slideshows from your listing photos',
      'Generate branded flyers and social media graphics',
      'AI enhancement tools improve lighting, staging, and composition',
    ],
  },
  tasks: {
    title: 'Tasks & To-Do',
    description: 'Stay on top of your daily workflow. Tasks are linked to transactions, clients, and deadlines to keep everything connected.',
    details: [
      'Tasks are organized by priority and due date',
      'Each task can be linked to a specific transaction or client',
      'Overdue tasks are highlighted so nothing falls through the cracks',
      'Recurring tasks auto-generate for routine activities',
    ],
  },
  enterprise: {
    title: 'Enterprise Solutions',
    description: 'Explore TrustHome solutions for brokerages, teams, and large organizations. Custom branding, team management, and advanced analytics.',
    details: [
      'White-label the platform with your brokerage branding',
      'Team management tools for assigning leads and tracking performance',
      'Advanced analytics dashboards for office-wide metrics',
      'Custom integrations with your existing tech stack',
    ],
  },
  pricing: {
    title: 'Pricing Plans',
    description: 'Choose the plan that fits your business. From solo agents to enterprise brokerages, every plan includes core features with scaling options.',
    details: [
      'Compare features across Starter, Professional, and Enterprise tiers',
      'All plans include CRM, marketing tools, and document management',
      'Enterprise plans add team management and custom branding',
      'Annual billing saves you 20% compared to monthly',
    ],
  },
  hallmark: {
    title: 'Hallmark Verification',
    description: 'The TrustHome Hallmark is a blockchain-verified quality seal for inspections, appraisals, and professional services.',
    details: [
      'Each Hallmark is a unique, tamper-proof verification record',
      'Inspectors and professionals earn Hallmarks for verified work',
      'Clients can verify any Hallmark by scanning its QR code or ID',
      'Hallmarks build your professional reputation on the Trust Layer',
    ],
  },
  ecosystem: {
    title: 'DarkWave Ecosystem',
    description: 'Explore the full suite of DarkWave Studios products. TrustHome is part of a larger ecosystem of professional tools and platforms.',
    details: [
      'Browse all DarkWave products and services',
      'Each ecosystem app integrates with your TrustHome account',
      'Trust Layer provides cross-platform identity and verification',
      'Lume-V governance ensures data integrity across all platforms',
    ],
  },
  commandCenter: {
    title: 'Command Center',
    description: 'Your central dashboard with quick access to every tool. See your key metrics, upcoming tasks, and recent activity at a glance.',
    details: [
      'Stat cards show real-time metrics across all areas of your business',
      'Quick-launch tiles take you directly to any feature',
      'Activity feed shows the latest actions across your account',
      'Notifications alert you to items needing immediate attention',
    ],
  },
  affiliate: {
    title: 'Referral & Affiliate',
    description: 'Earn rewards by referring other agents and professionals to TrustHome. Track your referrals and commissions in real time.',
    details: [
      'Share your unique referral link to earn commissions',
      'Track who signed up and their subscription status',
      'Commissions are paid monthly for active referrals',
      'Top referrers unlock exclusive perks and recognition',
    ],
  },
  team: {
    title: 'Your Team',
    description: 'Meet the people behind TrustHome. Our team is dedicated to building the best tools for real estate professionals.',
    details: [
      'View team member profiles and roles',
      'Reach out directly to team members with questions',
      'Learn about the mission and values driving TrustHome',
    ],
  },
  kiosk: {
    title: 'Open House Kiosk',
    description: 'A digital sign-in experience for open houses. Capture visitor information automatically and follow up instantly.',
    details: [
      'Set up a tablet as a self-service sign-in kiosk',
      'Visitors enter their info and are automatically added as leads',
      'Instant follow-up emails are sent after sign-in',
      'All data syncs with your Leads & CRM in real time',
    ],
  },
  developer: {
    title: 'Developer Tools',
    description: 'Advanced tools for managing your TrustHome deployment. API access, system health, and configuration options.',
    details: [
      'Monitor system health and API endpoint status',
      'View and manage integration configurations',
      'Access developer documentation and API references',
      'Test webhooks and data sync connections',
    ],
  },
};
