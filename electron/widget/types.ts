export type WidgetId = 'cpu' | 'memory' | 'disk' | 'gpu' | 'health' | 'temperature' | 'memComposition' | 'diskActivity' | 'performanceHistory' | 'memoryDetails' | 'storage';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  width: number;
  height: 'auto' | 'compact' | 'tall';
  order: number;
  minimized: boolean;
}

export interface WidgetLayout {
  widgets: WidgetConfig[];
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'cpu',              visible: true,  width: 1, height: 'auto', order: 0,  minimized: false },
  { id: 'memory',           visible: true,  width: 1, height: 'auto', order: 1,  minimized: false },
  { id: 'disk',             visible: true,  width: 1, height: 'auto', order: 2,  minimized: false },
  { id: 'gpu',              visible: true,  width: 1, height: 'auto', order: 3,  minimized: false },
  { id: 'health',           visible: true,  width: 1, height: 'auto', order: 4,  minimized: false },
  { id: 'temperature',      visible: true,  width: 3, height: 'auto', order: 5,  minimized: false },
  { id: 'memComposition',   visible: true,  width: 2, height: 'auto', order: 6,  minimized: false },
  { id: 'diskActivity',     visible: true,  width: 2, height: 'auto', order: 7,  minimized: false },
  { id: 'performanceHistory', visible: true, width: 4, height: 'auto', order: 8,  minimized: false },
  { id: 'memoryDetails',    visible: true,  width: 2, height: 'auto', order: 9,  minimized: false },
  { id: 'storage',          visible: true,  width: 2, height: 'auto', order: 10, minimized: false },
];
