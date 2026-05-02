export interface ThemeCSSVars {
  '--dash-card-bg': string;
  '--dash-card-border': string;
  '--dash-accent': string;
  '--dash-accent-2': string;
  '--dash-chart-line': string;
  '--dash-chart-fill': string;
  '--dash-text-primary': string;
  '--dash-text-secondary': string;
}

const themePalettes: Record<string, ThemeCSSVars> = {
  default: {
    '--dash-card-bg': 'var(--card-bg)',
    '--dash-card-border': 'var(--card-border)',
    '--dash-accent': 'var(--accent)',
    '--dash-accent-2': '#7c3aed',
    '--dash-chart-line': 'var(--accent)',
    '--dash-chart-fill': 'var(--accent)',
    '--dash-text-primary': 'var(--text-primary)',
    '--dash-text-secondary': 'var(--text-secondary)',
  },
  ocean: {
    '--dash-card-bg': '#0f172a',
    '--dash-card-border': '#1e3a5f',
    '--dash-accent': '#38bdf8',
    '--dash-accent-2': '#2dd4bf',
    '--dash-chart-line': '#38bdf8',
    '--dash-chart-fill': '#38bdf8',
    '--dash-text-primary': '#e0f2fe',
    '--dash-text-secondary': '#7dd3fc',
  },
  sunset: {
    '--dash-card-bg': '#1c1917',
    '--dash-card-border': '#7c2d12',
    '--dash-accent': '#fb923c',
    '--dash-accent-2': '#ef4444',
    '--dash-chart-line': '#fb923c',
    '--dash-chart-fill': '#fb923c',
    '--dash-text-primary': '#ffedd5',
    '--dash-text-secondary': '#fdba74',
  },
  forest: {
    '--dash-card-bg': '#0c1917',
    '--dash-card-border': '#1a3a2c',
    '--dash-accent': '#4ade80',
    '--dash-accent-2': '#a3e635',
    '--dash-chart-line': '#4ade80',
    '--dash-chart-fill': '#4ade80',
    '--dash-text-primary': '#ecfdf5',
    '--dash-text-secondary': '#86efac',
  },
  midnight: {
    '--dash-card-bg': '#0f0a1a',
    '--dash-card-border': '#2a1a4e',
    '--dash-accent': '#a78bfa',
    '--dash-accent-2': '#c084fc',
    '--dash-chart-line': '#a78bfa',
    '--dash-chart-fill': '#a78bfa',
    '--dash-text-primary': '#ede9fe',
    '--dash-text-secondary': '#c4b5fd',
  },
};

export function getThemeCSSVars(themeName: string): ThemeCSSVars {
  return themePalettes[themeName] ?? themePalettes.default;
}
