const palette = {
  metallic: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#EFEFEF',
    200: '#E8E8E8',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    850: '#1C1C1E',
    900: '#171717',
    950: '#0A0A0A',
    1000: '#000000',
  },
  success: '#2E3A2F', // Subdued luxury green
  warning: '#5C4A26', // Subdued luxury gold/amber
  error: '#4A1515',   // Deep oxblood
  info: '#1A2F4C',    // Deep navy
  
  // High contrast vibrant versions for text/icons on dark surfaces
  successBright: '#4ADE80',
  warningBright: '#FBBF24',
  errorBright: '#F87171',
  infoBright: '#60A5FA',
  accentBlue: '#3B82F6',
};

const light = {
  primary: palette.neutral[950],
  primaryLight: palette.neutral[500],
  primaryDark: palette.neutral[1000],
  accent: palette.metallic[500],

  background: palette.neutral[50],
  backgroundSecondary: palette.neutral[0],
  backgroundTertiary: palette.neutral[100],
  surface: palette.neutral[0],
  surfaceElevated: palette.neutral[0],

  text: palette.neutral[950],
  textSecondary: palette.neutral[600],
  textTertiary: palette.neutral[400],
  textInverse: palette.neutral[0],

  border: palette.neutral[200],
  borderLight: palette.neutral[150],
  divider: palette.neutral[150],

  cardGlass: 'rgba(255, 255, 255, 0.85)',
  cardGlassBorder: 'rgba(0, 0, 0, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.04)',

  success: palette.successBright,
  warning: palette.warningBright,
  error: palette.errorBright,
  info: palette.infoBright,

  statusBar: 'dark' as const,
  tint: palette.neutral[950],
  tabIconDefault: palette.neutral[400],
  tabIconSelected: palette.neutral[950],
};

const dark = {
  primary: palette.neutral[50],
  primaryLight: palette.neutral[300],
  primaryDark: palette.neutral[0],
  accent: palette.metallic[400],

  background: 'rgba(0, 0, 0, 0.6)',
  backgroundSecondary: 'rgba(10, 10, 10, 0.7)',
  backgroundTertiary: 'rgba(23, 23, 23, 0.8)',
  surface: 'rgba(10, 10, 10, 0.75)',
  surfaceElevated: 'rgba(23, 23, 23, 0.85)',

  text: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textTertiary: palette.neutral[600],
  textInverse: palette.neutral[950],

  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
  divider: 'rgba(255,255,255,0.08)',

  cardGlass: 'rgba(10, 10, 10, 0.75)',
  cardGlassBorder: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0,0,0,0.8)',
  shadow: 'rgba(0,0,0,0.4)',

  success: palette.successBright,
  warning: palette.warningBright,
  error: palette.errorBright,
  info: palette.infoBright,

  statusBar: 'light' as const,
  tint: palette.neutral[50],
  tabIconDefault: palette.neutral[600],
  tabIconSelected: palette.neutral[50],
};

export type ThemeColors = Omit<typeof light, 'statusBar'> & { statusBar: 'light' | 'dark' };

export default { light, dark, palette };
