export const themeType = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type ThemeType = typeof themeType[keyof typeof themeType];
