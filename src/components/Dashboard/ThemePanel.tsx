import { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import './ThemePanel.css';
import type { DashLayout, ColorTheme } from '../../../electron/theme/types';

const CARD_LABELS: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  disk: 'Disk',
  gpu: 'GPU',
  health: 'Health Score',
};

const COLOR_SWATCHES: Record<ColorTheme, { bg: string; accent: string; label: string }> = {
  default: { bg: '#1a1a2e', accent: 'var(--accent)', label: 'Default' },
  ocean: { bg: '#0f172a', accent: '#38bdf8', label: 'Ocean' },
  sunset: { bg: '#1c1917', accent: '#fb923c', label: 'Sunset' },
  forest: { bg: '#0c1917', accent: '#4ade80', label: 'Forest' },
  midnight: { bg: '#0f0a1a', accent: '#a78bfa', label: 'Midnight' },
};

export default function ThemePanel({ onClose }: { onClose: () => void }) {
  const { config, updateTheme, resetTheme } = useThemeStore();
  const [closing, setClosing] = useState(false);

  if (!config) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 150);
  };

  const handleReset = () => {
    resetTheme();
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const order = [...config.cardOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
    updateTheme({ cardOrder: order });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', zIndex: 999,
        }}
        onClick={handleClose}
      />
      <div className={`theme-panel-overlay${closing ? ' closing' : ''}`}>
        <div className="theme-panel-header">
          <span className="theme-panel-title">Dashboard Theme</span>
          <div className="theme-panel-close" onClick={handleClose}>
            <X size={18} />
          </div>
        </div>
        <div className="theme-panel-body">
          {/* Layout Selection */}
          <div className="theme-section">
            <div className="theme-section-title">Layout</div>
            <div className="theme-layout-grid">
              {(['grid', 'vertical', 'compact'] as DashLayout[]).map((l) => (
                <button
                  key={l}
                  className={`theme-layout-btn${config.layout === l ? ' active' : ''}`}
                  onClick={() => updateTheme({ layout: l })}
                >
                  {l === 'grid' ? 'Grid' : l === 'vertical' ? 'Vertical' : 'Compact'}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme */}
          <div className="theme-section">
            <div className="theme-section-title">Color Theme</div>
            <div className="theme-color-grid">
              {(Object.keys(COLOR_SWATCHES) as ColorTheme[]).map((key) => {
                const swatch = COLOR_SWATCHES[key];
                return (
                  <button
                    key={key}
                    className={`theme-color-btn${config.colorTheme === key ? ' active' : ''}`}
                    onClick={() => updateTheme({ colorTheme: key })}
                  >
                    <div
                      className="theme-color-swatch"
                      style={{
                        background: `linear-gradient(90deg, ${swatch.bg} 50%, ${swatch.accent} 50%)`,
                      }}
                    />
                    <div>{swatch.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="theme-section">
            <div className="theme-section-title">Display Options</div>
            <ToggleRow
              label="Health Score"
              checked={config.showHealthScore}
              onChange={(v) => updateTheme({ showHealthScore: v })}
            />
            <ToggleRow
              label="Mini Sparklines"
              checked={config.showSparklines}
              onChange={(v) => updateTheme({ showSparklines: v })}
            />
            <ToggleRow
              label="Temperature Chart"
              checked={config.showTempChart}
              onChange={(v) => updateTheme({ showTempChart: v })}
            />
            <ToggleRow
              label="Disk Activity"
              checked={config.showDiskActivity}
              onChange={(v) => updateTheme({ showDiskActivity: v })}
            />
            <ToggleRow
              label="Memory Composition"
              checked={config.showMemComposition}
              onChange={(v) => updateTheme({ showMemComposition: v })}
            />
          </div>

          {/* Card Opacity */}
          <div className="theme-section">
            <div className="theme-section-title">Card Opacity</div>
            <div className="theme-slider-row">
              <input
                type="range"
                className="theme-slider"
                min={0.5}
                max={1.0}
                step={0.05}
                value={config.cardOpacity}
                onChange={(e) => updateTheme({ cardOpacity: parseFloat(e.target.value) })}
              />
              <span className="theme-slider-value">{config.cardOpacity.toFixed(2)}</span>
            </div>
          </div>

          {/* Font Size */}
          <div className="theme-section">
            <div className="theme-section-title">Font Size</div>
            <div className="theme-font-grid">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  className={`theme-font-btn${config.fontSize === s ? ' active' : ''}`}
                  onClick={() => updateTheme({ fontSize: s })}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Card Order */}
          <div className="theme-section">
            <div className="theme-section-title">Card Order</div>
            <div className="theme-order-list">
              {config.cardOrder.map((key, i) => (
                <div key={key} className="theme-order-item">
                  <span>{CARD_LABELS[key] ?? key}</span>
                  <div className="theme-order-btns">
                    <span
                      className="theme-order-btn"
                      onClick={() => moveCard(i, 'up')}
                    >
                      <ChevronUp size={14} />
                    </span>
                    <span
                      className="theme-order-btn"
                      onClick={() => moveCard(i, 'down')}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button className="theme-reset-btn" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="theme-toggle-row">
      <span className="theme-toggle-label">{label}</span>
      <button
        className={`theme-toggle-switch${checked ? ' on' : ' off'}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
