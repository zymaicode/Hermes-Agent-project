import { useEffect, useState } from 'react';
import {
  Monitor, MonitorSmartphone, Cpu, Palette, Star,
  RefreshCw, ChevronRight, ChevronDown,
} from 'lucide-react';
import { useDisplayStore } from '../../stores/displayStore';

export default function DisplayView() {
  const displays = useDisplayStore((s) => s.displays);
  const adapter = useDisplayStore((s) => s.adapter);
  const colorProfiles = useDisplayStore((s) => s.colorProfiles);
  const fetchDisplays = useDisplayStore((s) => s.fetchDisplays);
  const fetchAdapter = useDisplayStore((s) => s.fetchAdapter);
  const fetchColorProfiles = useDisplayStore((s) => s.fetchColorProfiles);

  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => { fetchDisplays(); fetchAdapter(); fetchColorProfiles(); }, []);

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Display Information</h2>
        <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { fetchDisplays(); fetchAdapter(); fetchColorProfiles(); }}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
        </button>
      </div>

      {/* Adapter card */}
      {adapter && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="flex items-center gap-3 mb-3">
            <Cpu size={28} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{adapter.name}</h3>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adapter.vendor}</div>
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            {[
              { label: 'Driver', value: adapter.driverVersion, color: 'var(--accent)' },
              { label: 'Date', value: adapter.driverDate, color: 'var(--text-secondary)' },
              { label: 'VRAM', value: `${(adapter.vram / 1024).toFixed(0)} GB`, color: 'var(--green)' },
              { label: 'DirectX', value: `DirectX ${adapter.directXSupport.replace('_', '.')}`, color: 'var(--purple)' },
              { label: 'Vulkan', value: adapter.vulkanSupport ? 'Supported' : 'N/A', color: adapter.vulkanSupport ? 'var(--teal)' : 'var(--text-secondary)' },
              { label: 'OpenGL', value: adapter.openGLVersion, color: 'var(--blue)' },
              { label: 'Feature Level', value: adapter.featureLevel, color: 'var(--orange)' },
            ].map((b) => (
              <span key={b.label} style={{
                fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 12,
                background: b.color + '22', color: b.color,
              }}>
                {b.label}: {b.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Displays */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${displays.length}, 1fr)`, gap: 16, marginBottom: 16 }}>
        {displays.map((d) => (
          <div key={d.serialNumber} className="card" style={{ padding: 20, position: 'relative' }}>
            {d.primary && (
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Star size={16} style={{ color: 'var(--yellow)' }} fill="var(--yellow)" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              {d.connectionType === 'USB-C' ? <MonitorSmartphone size={24} /> : <Monitor size={24} />}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.manufacturer} — {d.model}</div>
              </div>
            </div>

            {/* Resolution + refresh */}
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {d.resolution.width} × {d.resolution.height}
              <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-secondary)' }}>
                @{d.refreshRate}Hz
              </span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6,
                background: 'var(--accent-muted)', color: 'var(--accent)', fontWeight: 500,
              }}>
                {d.connectionType}
              </span>
              {d.hdrSupported && (
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 6,
                  background: d.hdrEnabled ? 'var(--yellow)' + '33' : 'var(--bg-hover)',
                  color: d.hdrEnabled ? 'var(--yellow)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  HDR{d.hdrEnabled ? ' On' : ' Off'}
                </span>
              )}
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6,
                background: 'var(--bg-hover)', color: 'var(--text-secondary)',
              }}>
                {d.bitDepth}-bit {d.colorFormat}
              </span>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 11 }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>DPI:</span> {d.dpi}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Scaling:</span> {d.scaling}%</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Size:</span> {(d.physicalSize.width / 25.4).toFixed(1)}" × {(d.physicalSize.height / 25.4).toFixed(1)}"</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Aspect:</span> {d.aspectRatio}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Pixel Pitch:</span> {d.pixelPitch.toFixed(4)} mm</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>EDID:</span> v{d.edidVersion}</div>
            </div>

            {/* Color coverage */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>sRGB Coverage</div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.sRGB}%`, background: 'var(--green)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 2, fontWeight: 600 }}>{d.sRGB}%</div>
              {d.dciP3 > 0 && (
                <>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, marginTop: 8 }}>DCI-P3 Coverage</div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.dciP3}%`, background: 'var(--purple)', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--purple)', marginTop: 2, fontWeight: 600 }}>{d.dciP3}%</div>
                </>
              )}
            </div>

            {/* Supported refresh rates */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>Refresh Rates</div>
              <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                {d.supportedRefreshRates.map((r) => (
                  <span key={r} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 4,
                    background: r === d.refreshRate ? 'var(--accent-muted)' : 'var(--bg-hover)',
                    color: r === d.refreshRate ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: r === d.refreshRate ? 600 : 400,
                  }}>
                    {r}Hz
                  </span>
                ))}
              </div>
            </div>

            {/* HDR Formats */}
            {d.hdrFormats.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>HDR Formats</div>
                <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                  {d.hdrFormats.map((h) => (
                    <span key={h} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--yellow)22', color: 'var(--yellow)', fontWeight: 500 }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Color Profiles */}
      <div>
        <button
          className="btn"
          style={{
            width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 600,
            justifyContent: 'flex-start', gap: 8,
          }}
          onClick={() => setShowProfiles(!showProfiles)}
        >
          {showProfiles ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Palette size={14} />
          Color Profiles ({colorProfiles.length})
        </button>
        {showProfiles && (
          <div className="card" style={{ overflow: 'auto', maxHeight: 180, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px',
              padding: '6px 12px', borderBottom: '1px solid var(--border-color)',
              fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
            }}>
              <span>Profile</span>
              <span>Gamut</span>
              <span>Whitepoint</span>
              <span>Gamma</span>
            </div>
            {colorProfiles.map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px',
                padding: '5px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, alignItems: 'center',
              }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name} {p.isDefault && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600 }}>(default)</span>}
                </span>
                <span className="text-mono" style={{ fontSize: 10 }}>{p.gamut}</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{p.whitepoint}</span>
                <span className="text-mono" style={{ fontSize: 10 }}>{p.gamma}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
