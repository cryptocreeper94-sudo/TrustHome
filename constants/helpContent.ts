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
      'Connected to Signal Chat for cross-ecosystem messaging',
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
};
