export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const theme: ThemeColors = {
  primary: '#aa3bff',
  secondary: '#6b6375',
  accent: '#c084fc',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
};
