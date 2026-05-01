import type { OverlayConfig } from '../../stores/overlayStore';

interface Props {
  config: OverlayConfig;
  onChange: (partial: Partial<OverlayConfig>) => void;
}

const POSITION_OPTIONS: { value: OverlayConfig['position']; label: string }[] = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
];

const REFRESH_OPTIONS = [
  { value: 250, label: '250ms' },
  { value: 500, label: '500ms' },
  { value: 1000, label: '1s' },
  { value: 2000, label: '2s' },
  { value: 5000, label: '5s' },
];

const FONT_OPTIONS = [
  { value: 10, label: 'Small' },
  { value: 12, label: 'Medium' },
  { value: 14, label: 'Large' },
];

export default function SettingsForm({ config, onChange }: Props) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Settings</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Position */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Position</label>
          <select
            className="input"
            value={config.position}
            onChange={(e) => onChange({ position: e.target.value as OverlayConfig['position'] })}
            style={{ width: '100%' }}
          >
            {POSITION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Opacity */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
            Opacity: {(config.opacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="30"
            max="100"
            value={Math.round(config.opacity * 100)}
            onChange={(e) => onChange({ opacity: parseInt(e.target.value) / 100 })}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </div>

        {/* Font Size */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Font Size</label>
          <select
            className="input"
            value={config.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Refresh Rate */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Refresh Rate</label>
          <select
            className="input"
            value={config.refreshInterval}
            onChange={(e) => onChange({ refreshInterval: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          >
            {REFRESH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Accent Color */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{config.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Metric Toggles */}
      <div style={{ marginTop: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Display Metrics</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {([
            { key: 'showCpu' as const, label: 'CPU' },
            { key: 'showMemory' as const, label: 'Memory' },
            { key: 'showGpu' as const, label: 'GPU' },
            { key: 'showFps' as const, label: 'FPS' },
            { key: 'showNetwork' as const, label: 'Network' },
          ]).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: config.metrics[key] ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
                border: config.metrics[key] ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                fontSize: 12,
                color: config.metrics[key] ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: config.metrics[key] ? 500 : 400,
              }}
            >
              <input
                type="checkbox"
                checked={config.metrics[key]}
                onChange={(e) => onChange({ metrics: { ...config.metrics, [key]: e.target.checked } })}
                style={{ display: 'none' }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 12 }}>Click-Through</span>
          <input
            type="checkbox"
            checked={config.clickThrough}
            onChange={(e) => onChange({ clickThrough: e.target.checked })}
            style={{ accentColor: 'var(--accent)' }}
          />
        </label>

        <label className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 12 }}>Auto-hide in Fullscreen</span>
          <input
            type="checkbox"
            checked={config.autoHide}
            onChange={(e) => onChange({ autoHide: e.target.checked })}
            style={{ accentColor: 'var(--accent)' }}
          />
        </label>
      </div>
    </div>
  );
}
