import { useState } from 'react';
import { useNetDiagStore } from '../../stores/netdiagStore';

type ScanPreset = 'quick' | 'common' | 'full';

const PRESETS: Record<ScanPreset, { label: string; ports: number[] | undefined }> = {
  quick: { label: '快速扫描', ports: [22, 80, 443, 3389, 8080, 8443] },
  common: { label: '常用端口', ports: undefined },
  full: { label: '全端口 (1-1024)', ports: Array.from({ length: 1024 }, (_, i) => i + 1) },
};

export default function PortScanner() {
  const { portScanResult, portScanRunning, runPortScan } = useNetDiagStore();
  const [target, setTarget] = useState('localhost');
  const [preset, setPreset] = useState<ScanPreset>('common');

  const handleScan = () => {
    if (!target.trim()) return;
    runPortScan(target.trim(), PRESETS[preset].ports);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">端口扫描</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>目标 IP</label>
            <input
              className="input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入目标 IP..."
              disabled={portScanRunning}
              spellCheck={false}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>扫描模式</label>
            <div style={{ display: 'flex', gap: 2 }}>
              {(Object.entries(PRESETS) as [ScanPreset, { label: string; ports: number[] | undefined }][]).map(([key, val]) => (
                <button
                  key={key}
                  className="btn"
                  onClick={() => setPreset(key)}
                  disabled={portScanRunning}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    background: preset === key ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: preset === key ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleScan} disabled={portScanRunning} style={{ height: 36 }}>
            {portScanRunning ? '扫描中...' : '开始扫描'}
          </button>
        </div>
      </div>

      {portScanResult && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {portScanResult.target} 的扫描结果
            </span>
            <span style={{ fontSize: 12, color: 'var(--green)', marginLeft: 12 }}>
              {portScanResult.openCount} 个开放
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
              / {portScanResult.ports.length} 个端口 ({portScanResult.duration}s)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>端口</th>
                  <th style={thStyle}>服务</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>Banner</th>
                </tr>
              </thead>
              <tbody>
                {portScanResult.ports.map((p) => (
                  <tr key={p.port} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                      {p.port}
                    </td>
                    <td style={tdStyle}>{p.service}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          background: p.state === 'open' ? 'rgba(0,200,83,0.15)' : p.state === 'filtered' ? 'rgba(255,171,0,0.15)' : 'rgba(128,128,128,0.15)',
                          color: p.state === 'open' ? 'var(--green)' : p.state === 'filtered' ? 'var(--yellow)' : 'var(--text-secondary)',
                        }}
                      >
                        {p.state === 'open' ? '开放' : p.state === 'filtered' ? '过滤' : '关闭'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {p.banner || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {portScanResult.openCount > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>开放端口: </span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono, monospace)', color: 'var(--green)' }}>
                {portScanResult.ports.filter((p) => p.state === 'open').map((p) => `${p.port}/${p.service}`).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  borderBottom: '2px solid var(--border-color)',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  color: 'var(--text-primary)',
};
