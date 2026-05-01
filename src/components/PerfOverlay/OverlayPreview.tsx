import type { OverlayConfig } from '../../stores/overlayStore';

interface Props {
  config: OverlayConfig;
}

function getFontPx(fontSize: number): string {
  if (fontSize < 11) return '9px';
  if (fontSize > 13) return '13px';
  return '11px';
}

export default function OverlayPreview({ config }: Props) {
  const { metrics, accentColor, fontSize, opacity } = config;
  const bg = `rgba(13, 17, 23, ${opacity})`;
  const barWidths = {
    cpu: 45,
    mem: 62,
    gpu: 28,
  };
  const fpsVal = 120;
  const netDown = 25.4;
  const netUp = 4.1;

  return (
    <div
      style={{
        background: bg,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 10px',
        width: 260,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {metrics.showCpu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 42, textAlign: 'right', fontWeight: 600, fontSize: getFontPx(fontSize), color: accentColor }}>CPU</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${barWidths.cpu}%`, height: '100%', borderRadius: 3, background: '#4fc3f7', transition: 'width 0.4s' }} />
            </div>
            <span style={{ width: 36, textAlign: 'right', fontFamily: 'monospace', fontSize: 10, color: '#ccc' }}>{barWidths.cpu}%</span>
          </div>
        )}

        {metrics.showMemory && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 42, textAlign: 'right', fontWeight: 600, fontSize: getFontPx(fontSize), color: accentColor }}>MEM</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${barWidths.mem}%`, height: '100%', borderRadius: 3, background: '#ffb74d', transition: 'width 0.4s' }} />
            </div>
            <span style={{ width: 36, textAlign: 'right', fontFamily: 'monospace', fontSize: 10, color: '#ccc' }}>{barWidths.mem}%</span>
          </div>
        )}

        {metrics.showGpu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 42, textAlign: 'right', fontWeight: 600, fontSize: getFontPx(fontSize), color: accentColor }}>GPU</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${barWidths.gpu}%`, height: '100%', borderRadius: 3, background: '#4fc3f7', transition: 'width 0.4s' }} />
            </div>
            <span style={{ width: 36, textAlign: 'right', fontFamily: 'monospace', fontSize: 10, color: '#ccc' }}>{barWidths.gpu}%</span>
          </div>
        )}

        {(metrics.showFps || metrics.showNetwork) && (
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
        )}

        {metrics.showFps && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 42, textAlign: 'right', fontWeight: 600, fontSize: getFontPx(fontSize), color: accentColor }}>FPS</span>
            <div style={{ flex: 1 }} />
            <span style={{ width: 36, textAlign: 'right', fontFamily: 'monospace', fontSize: fontSize < 11 ? 9 : 10, fontWeight: 600, color: '#66bb6a' }}>{fpsVal}</span>
          </div>
        )}

        {metrics.showNetwork && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 42, textAlign: 'right', fontWeight: 600, fontSize: getFontPx(fontSize), color: accentColor }}>NET</span>
            <div style={{ flex: 1 }} />
            <span style={{ width: 82, textAlign: 'right', fontFamily: 'monospace', fontSize: 9, color: '#ccc' }}>
              ↓{netDown.toFixed(0)} ↑{netUp.toFixed(0)} MB/s
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
