import { useEffect } from 'react';
import { Eye, EyeOff, RefreshCw, MousePointer, MousePointerClick } from 'lucide-react';
import { useOverlayStore } from '../../stores/overlayStore';
import OverlayPreview from './OverlayPreview';
import SettingsForm from './SettingsForm';

export default function PerfOverlay() {
  const active = useOverlayStore((s) => s.active);
  const config = useOverlayStore((s) => s.config);
  const currentMetrics = useOverlayStore((s) => s.currentMetrics);
  const fetchStatus = useOverlayStore((s) => s.fetchStatus);
  const fetchMetrics = useOverlayStore((s) => s.fetchMetrics);
  const toggleOverlay = useOverlayStore((s) => s.toggleOverlay);
  const updateConfig = useOverlayStore((s) => s.updateConfig);
  const setConfigLocal = useOverlayStore((s) => s.setConfigLocal);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (active) fetchMetrics();
    }, 2000);
    return () => clearInterval(id);
  }, [active]);

  const handleToggle = () => {
    toggleOverlay(!active);
  };

  const handleQuickToggle = (key: 'clickThrough') => {
    updateConfig({ [key]: !config[key] });
  };

  const handleRefreshMetrics = () => {
    fetchMetrics();
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Performance Overlay</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={handleRefreshMetrics}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
        </div>
      </div>

      {/* Main Toggle Card */}
      <div
        className="card animate-fadeIn"
        style={{
          padding: 24,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: active ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
              transition: 'all 0.3s',
            }}
          >
            <Eye size={28} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{active ? 'Overlay Active' : 'Overlay Inactive'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {active ? 'Performance overlay is displayed on screen' : 'Toggle to show real-time performance overlay'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {config.position} &middot; {config.opacity * 100}% opacity &middot; {config.refreshInterval}ms
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: config.clickThrough ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
              borderColor: config.clickThrough ? 'var(--accent)' : 'var(--border-color)',
              color: config.clickThrough ? 'var(--accent)' : 'var(--text-secondary)',
            }}
            onClick={() => handleQuickToggle('clickThrough')}
          >
            {config.clickThrough ? <MousePointerClick size={14} style={{ marginRight: 4 }} /> : <MousePointer size={14} style={{ marginRight: 4 }} />}
            Click-Through: {config.clickThrough ? 'ON' : 'OFF'}
          </button>
          <button
            className={`btn ${active ? 'btn-danger' : 'btn-success'}`}
            style={{ padding: '8px 20px', fontSize: 13 }}
            onClick={handleToggle}
          >
            {active ? <><EyeOff size={16} style={{ marginRight: 6 }} />关闭浮窗</> : <><Eye size={16} style={{ marginRight: 6 }} />开启浮窗</>}
          </button>
        </div>
      </div>

      {/* Preview + Settings */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="card" style={{ padding: 20, flex: 1, minWidth: 300 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Preview</h3>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <OverlayPreview config={config} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            The preview updates as you change settings below
          </div>
        </div>

        <SettingsForm config={config} onChange={updateConfig} />
      </div>

      {/* Live Metrics */}
      {active && currentMetrics && (
        <div className="card animate-fadeIn" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Live Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            <MetricCard label="CPU" value={`${currentMetrics.cpu.usage.toFixed(0)}%`} sub={`${currentMetrics.cpu.temp}°C`} color="var(--accent)" />
            <MetricCard label="Memory" value={`${currentMetrics.memory.usage.toFixed(1)}%`} sub={`${(currentMetrics.memory.used / 1024).toFixed(1)} GB`} color="var(--yellow)" />
            <MetricCard label="GPU" value={`${currentMetrics.gpu.usage.toFixed(0)}%`} sub={`${currentMetrics.gpu.temp}°C`} color="var(--purple)" />
            <MetricCard label="FPS" value={String(currentMetrics.fps.current)} sub={`min ${currentMetrics.fps.min}`} color="var(--green)" />
            <MetricCard label="Download" value={`${currentMetrics.network.downloadSpeed.toFixed(1)} MB/s`} sub={`↑ ${currentMetrics.network.uploadSpeed.toFixed(1)} MB/s`} color="var(--blue)" />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: 14, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{sub}</div>
    </div>
  );
}
