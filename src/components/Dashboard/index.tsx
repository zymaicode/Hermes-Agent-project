import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Palette, Grid3x3 } from 'lucide-react';
import { useHardwareStore } from '../../stores/hardwareStore';
import { useHealthStore } from '../../stores/healthStore';
import { useThemeStore } from '../../stores/themeStore';
import { useWidgetStore } from '../../stores/widgetStore';
import ThemePanel from './ThemePanel';
import WidgetGrid from './WidgetGrid';
import WidgetPanel from './WidgetPanel';
import {
  CpuWidget, MemoryWidget, DiskWidget, GpuWidget, HealthWidget,
  TemperatureWidget, MemCompositionWidget, DiskActivityWidget,
  PerfHistoryWidget, MemoryDetailsWidget, StorageWidget,
} from './widgets';
import type { WidgetConfig } from '../../../electron/widget/types';

export default function Dashboard() {
  const snapshot = useHardwareStore((s) => s.snapshot);
  const history = useHardwareStore((s) => s.history);
  const polling = useHardwareStore((s) => s.polling);
  const healthScore = useHealthStore((s) => s.score);
  const fetchHealth = useHealthStore((s) => s.fetchScore);
  const config = useThemeStore((s) => s.config);
  const cssVars = useThemeStore((s) => s.cssVars);
  const { layout, loadLayout } = useWidgetStore();
  const [lastUpdated, setLastUpdated] = useState('');
  const [tempHistory, setTempHistory] = useState<Array<{ time: number; cpu: number; gpu: number; disk: number }>>([]);
  const [diskActivity, setDiskActivity] = useState<Array<{ name: string; read: number; write: number }>>([]);
  const [memComposition, setMemComposition] = useState<Array<{ time: number; used: number; cache: number; free: number }>>([]);
  const tickRef = useRef(0);
  const prevDisplayRef = useRef({ cpu: '', memory: '', disk: '', gpu: '' });
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(false);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  useEffect(() => {
    if (snapshot) {
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }
  }, [snapshot]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    if (!snapshot) return;
    tickRef.current++;
    const t = tickRef.current;
    setTempHistory((prev) => {
      const next = [...prev, { time: t, cpu: snapshot.cpu.temp + (Math.random() - 0.5) * 4, gpu: snapshot.gpu.temp + (Math.random() - 0.5) * 4, disk: (snapshot.disks[0]?.temp ?? 35) + (Math.random() - 0.5) * 2 }];
      return next.slice(-60);
    });
    setDiskActivity((prev) => {
      const next = [...prev];
      for (const disk of snapshot.disks) {
        const read = Math.max(0, 50 + Math.random() * 400 - (disk.usagePercent * 2));
        const write = Math.max(0, 10 + Math.random() * 200 - (disk.usagePercent * 1.5));
        next.push({ name: disk.name, read: Math.round(read), write: Math.round(write) });
      }
      return next.slice(-60);
    });
    setMemComposition((prev) => {
      const cache = Math.round((snapshot.memory.total - snapshot.memory.used - snapshot.memory.available) * 10) / 10;
      const used = snapshot.memory.used - cache;
      const next = [...prev, { time: t, used: Math.max(0, used), cache: Math.max(0, cache), free: snapshot.memory.available }];
      return next.slice(-60);
    });

    // Detect value changes for highlight animation
    const cpuKey = snapshot.cpu.usage.toFixed(1);
    const memKey = snapshot.memory.usagePercent.toFixed(1);
    const diskKey = (snapshot.disks[0]?.usagePercent ?? 0).toFixed(0);
    const gpuKey = snapshot.gpu.usage.toFixed(1);
    const prev = prevDisplayRef.current;
    const newHighlights = new Set<string>();
    if (prev.cpu !== cpuKey && prev.cpu !== '') newHighlights.add('cpu');
    if (prev.memory !== memKey && prev.memory !== '') newHighlights.add('memory');
    if (prev.disk !== diskKey && prev.disk !== '') newHighlights.add('disk');
    if (prev.gpu !== gpuKey && prev.gpu !== '') newHighlights.add('gpu');
    prevDisplayRef.current = { cpu: cpuKey, memory: memKey, disk: diskKey, gpu: gpuKey };
    if (newHighlights.size > 0) {
      setHighlighted(newHighlights);
      const timer = setTimeout(() => setHighlighted(new Set()), 500);
      return () => clearTimeout(timer);
    }
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const { cpu, memory, disks, gpu } = snapshot;
  const cpuHistory = history.slice(-30).map((v) => ({ val: v }));
  const memHistory = history.slice(-30).map(() => ({ val: memory.usagePercent + (Math.random() - 0.5) * 2 }));
  const diskHistory = history.slice(-30).map(() => ({ val: disks[0].usagePercent + (Math.random() - 0.5) }));
  const gpuHistory = history.slice(-30).map(() => ({ val: gpu.usage + (Math.random() - 0.5) * 2 }));
  const timestamp = lastUpdated ? `Last updated: ${lastUpdated}` : '';
  const showSparklines = config?.showSparklines !== false;

  // Visible widgets sorted by order
  const visibleWidgets = useMemo(() => {
    if (!layout) return [];
    return [...layout.widgets].filter((w) => w.visible).sort((a, b) => a.order - b.order);
  }, [layout]);

  const renderWidgetContent = useCallback((widget: WidgetConfig): React.ReactNode => {
    switch (widget.id) {
      case 'cpu':
        return <CpuWidget cpu={cpu} cpuHistory={cpuHistory} timestamp={timestamp} showSparklines={showSparklines} />;
      case 'memory':
        return <MemoryWidget memory={memory} memHistory={memHistory} timestamp={timestamp} showSparklines={showSparklines} />;
      case 'disk':
        return <DiskWidget disk={disks[0]} diskHistory={diskHistory} timestamp={timestamp} showSparklines={showSparklines} />;
      case 'gpu':
        return <GpuWidget gpu={gpu} gpuHistory={gpuHistory} timestamp={timestamp} showSparklines={showSparklines} />;
      case 'health':
        return <HealthWidget healthScore={healthScore} timestamp={timestamp} />;
      case 'temperature':
        return <TemperatureWidget cpu={cpu} gpu={gpu} disk={disks[0]} tempHistory={tempHistory} />;
      case 'memComposition':
        return <MemCompositionWidget memory={memory} memComposition={memComposition} />;
      case 'diskActivity':
        return <DiskActivityWidget disks={disks} diskActivity={diskActivity} />;
      case 'performanceHistory':
        return <PerfHistoryWidget history={history} cpu={cpu} memory={memory} gpu={gpu} />;
      case 'memoryDetails':
        return <MemoryDetailsWidget memory={memory} />;
      case 'storage':
        return <StorageWidget disks={disks} />;
      default:
        return null;
    }
  }, [cpu, memory, disks, gpu, cpuHistory, memHistory, diskHistory, gpuHistory, timestamp, showSparklines, healthScore, tempHistory, diskActivity, memComposition, history]);

  // Apply font size scaling
  const fontSizeScale = config?.fontSize === 'small' ? '0.85em' : config?.fontSize === 'large' ? '1.15em' : '1em';

  // Determine layout class
  const layoutClass = config?.layout === 'vertical' ? 'dash-layout-vertical' : config?.layout === 'compact' ? 'dash-layout-compact' : 'dash-layout-grid';

  return (
    <div className={`flex-col animate-fadeIn ${layoutClass}`} style={{ height: '100%', overflowY: 'auto', fontSize: fontSizeScale, ...cssVars }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWidgetPanelOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              opacity: 0.7, transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            title="Widget Settings"
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => setThemePanelOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              opacity: 0.7, transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            title="Theme Settings"
          >
            <Palette size={16} />
          </button>
          <span className={`pulse-dot${polling ? ' active' : ''}`} />
          <span className="text-sm text-muted text-mono">Polling: 1s interval</span>
        </div>
      </div>

      {/* Widget Grid */}
      <WidgetGrid
        widgets={visibleWidgets}
        renderContent={renderWidgetContent}
        highlighted={highlighted}
        layout={config?.layout}
      />

      {/* Panels */}
      {themePanelOpen && <ThemePanel onClose={() => setThemePanelOpen(false)} />}
      {widgetPanelOpen && <WidgetPanel onClose={() => setWidgetPanelOpen(false)} />}
    </div>
  );
}
