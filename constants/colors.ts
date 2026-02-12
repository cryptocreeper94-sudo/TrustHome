const palette = {
  teal: {
    50: '#E6F5F3',
    100: '#B3E0DA',
    200: '#80CBC1',
    300: '#4DB6A8',
    400: '#26A69A',
    500: '#1A8A7E',
    600: '#157A70',
    700: '#0F6B62',
    800: '#0A5B54',
    900: '#064A44',
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
    750: '#333333',
    800: '#262626',
    850: '#1C1C1E',
    900: '#171717',
    950: '#0D0D0D',
    1000: '#000000',
  },
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
};

const light = {
  primary: palette.teal[500],
  primaryLight: palette.teal[100],
  primaryDark: palette.teal[700],
  accent: palette.teal[400],

  background: palette.neutral[50],
  backgroundSecondary: palette.neutral[0],
  backgroundTertiary: palette.neutral[100],
  surface: palette.neutral[0],
  surfaceElevated: palette.neutral[0],

  text: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textTertiary: palette.neutral[400],
  textInverse: palette.neutral[0],

  border: palette.neutral[200],
  borderLight: palette.neutral[150],
  divider: palette.neutral[150],

  cardGlass: 'rgba(255, 255, 255, 0.72)',
  cardGlassBorder: 'rgba(255, 255, 255, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,

  statusBar: 'dark' as const,
  tint: palette.teal[500],
  tabIconDefault: palette.neutral[400],
  tabIconSelected: palette.teal[500],
};

const dark = {
  primary: palette.teal[400],
  primaryLight: palette.teal[900],
  primaryDark: palette.teal[300],
  accent: palette.teal[300],

  background: palette.neutral[950],
  backgroundSecondary: palette.neutral[900],
  backgroundTertiary: palette.neutral[850],
  surface: palette.neutral[850],
  surfaceElevated: palette.neutral[800],

  text: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textTertiary: palette.neutral[500],
  textInverse: palette.neutral[900],

  border: palette.neutral[750],
  borderLight: palette.neutral[800],
  divider: palette.neutral[800],

  cardGlass: 'rgba(28, 28, 30, 0.72)',
  cardGlassBorder: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#0A84FF',

  statusBar: 'light' as const,
  tint: palette.teal[400],
  tabIconDefault: palette.neutral[500],
  tabIconSelected: palette.teal[400],
};

export type ThemeColors = Omit<typeof light, 'statusBar'> & { statusBar: 'light' | 'dark' };

export default { light, dark, palette };
