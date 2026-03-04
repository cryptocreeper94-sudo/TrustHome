export interface EcosystemApp {
  id: number;
  name: string;
  prefix: string;
  genesisMark: string;
}

export const ECOSYSTEM_REGISTRY: EcosystemApp[] = [
  { id: 1, name: 'Trust Layer Hub', prefix: 'TH', genesisMark: 'TH-00000001' },
  { id: 2, name: 'Trust Layer (L1)', prefix: 'TL', genesisMark: 'TL-00000001' },
  { id: 3, name: 'TrustHome', prefix: 'TR', genesisMark: 'TR-00000001' },
  { id: 4, name: 'TrustVault', prefix: 'TV', genesisMark: 'TV-00000001' },
  { id: 5, name: 'TLID.io', prefix: 'TI', genesisMark: 'TI-00000001' },
  { id: 6, name: 'THE VOID', prefix: 'VO', genesisMark: 'VO-00000001' },
  { id: 7, name: 'Signal Chat', prefix: 'SC', genesisMark: 'SC-00000001' },
  { id: 8, name: 'DarkWave Studio', prefix: 'DS', genesisMark: 'DS-00000001' },
  { id: 9, name: 'Guardian Shield', prefix: 'GS', genesisMark: 'GS-00000001' },
  { id: 10, name: 'Guardian Scanner', prefix: 'GN', genesisMark: 'GN-00000001' },
  { id: 11, name: 'Guardian Screener', prefix: 'GR', genesisMark: 'GR-00000001' },
  { id: 12, name: 'TradeWorks AI', prefix: 'TW', genesisMark: 'TW-00000001' },
  { id: 13, name: 'StrikeAgent', prefix: 'SA', genesisMark: 'SA-00000001' },
  { id: 14, name: 'Pulse', prefix: 'PU', genesisMark: 'PU-00000001' },
  { id: 15, name: 'Chronicles', prefix: 'CH', genesisMark: 'CH-00000001' },
  { id: 16, name: 'The Arcade', prefix: 'AR', genesisMark: 'AR-00000001' },
  { id: 17, name: 'Bomber', prefix: 'BO', genesisMark: 'BO-00000001' },
  { id: 18, name: 'Trust Golf', prefix: 'TG', genesisMark: 'TG-00000001' },
  { id: 19, name: 'ORBIT Staffing OS', prefix: 'OR', genesisMark: 'OR-00000001' },
  { id: 20, name: 'Orby Commander', prefix: 'OC', genesisMark: 'OC-00000001' },
  { id: 21, name: 'GarageBot', prefix: 'GB', genesisMark: 'GB-00000001' },
  { id: 22, name: 'Lot Ops Pro', prefix: 'LO', genesisMark: 'LO-00000001' },
  { id: 23, name: 'TORQUE', prefix: 'TQ', genesisMark: 'TQ-00000001' },
  { id: 24, name: 'TL Driver Connect', prefix: 'DC', genesisMark: 'DC-00000001' },
  { id: 25, name: 'VedaSolus', prefix: 'VS', genesisMark: 'VS-00000001' },
  { id: 26, name: 'Verdara', prefix: 'VD', genesisMark: 'VD-00000001' },
  { id: 27, name: 'Arbora', prefix: 'AB', genesisMark: 'AB-00000001' },
  { id: 28, name: 'PaintPros', prefix: 'PP', genesisMark: 'PP-00000001' },
  { id: 29, name: 'Nashville Painting Professionals', prefix: 'NP', genesisMark: 'NP-00000001' },
  { id: 30, name: 'Trust Book', prefix: 'TB', genesisMark: 'TB-00000001' },
  { id: 31, name: 'DarkWave Academy', prefix: 'DA', genesisMark: 'DA-00000001' },
  { id: 32, name: 'Happy Eats', prefix: 'HE', genesisMark: 'HE-00000001' },
  { id: 33, name: 'Brew & Board Coffee', prefix: 'BB', genesisMark: 'BB-00000001' },
];

export const HALLMARK_FORMAT = {
  pattern: '[PREFIX]-[8-DIGIT-PADDED]',
  example: 'TR-00000001',
  parentGenesis: 'TH-00000001',
  totalApps: 33,
};

export const AFFILIATE_CONFIG = {
  tiers: [
    { name: 'Base', minReferrals: 0, rate: 0.10 },
    { name: 'Silver', minReferrals: 5, rate: 0.125 },
    { name: 'Gold', minReferrals: 15, rate: 0.15 },
    { name: 'Platinum', minReferrals: 30, rate: 0.175 },
    { name: 'Diamond', minReferrals: 50, rate: 0.20 },
  ],
  currency: 'SIG',
  minPayout: 10,
  linkFormat: '/ref/{uniqueHash}',
};
