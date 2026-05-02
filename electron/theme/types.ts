export type DashLayout = 'grid' | 'vertical' | 'compact';

export type ColorTheme =
  | 'default'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'midnight';

export interface ThemeConfig {
  layout: DashLayout;
  colorTheme: ColorTheme;
  showHealthScore: boolean;
  showSparklines: boolean;
  showTempChart: boolean;
  showDiskActivity: boolean;
  showMemComposition: boolean;
  cardOrder: string[];
  cardOpacity: number;
  fontSize: 'small' | 'medium' | 'large';
}

export const DASHBOARD_THEME_DEFAULTS: ThemeConfig = {
  layout: 'grid',
  colorTheme: 'default',
  showHealthScore: true,
  showSparklines: true,
  showTempChart: true,
  showDiskActivity: true,
  showMemComposition: true,
  cardOrder: ['cpu', 'memory', 'disk', 'gpu', 'health'],
  cardOpacity: 1.0,
  fontSize: 'medium',
};
