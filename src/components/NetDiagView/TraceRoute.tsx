import { useState } from 'react';
import { useNetDiagStore } from '../../stores/netdiagStore';

export default function TraceRoute() {
  const { traceResult, traceRunning, runTraceRoute } = useNetDiagStore();
  const [target, setTarget] = useState('baidu.com');

  const handleTrace = () => {
    if (!target.trim()) return;
    runTraceRoute(target.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTrace();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">路由追踪</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>目标地址</label>
            <input
              className="input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 IP 或域名..."
              disabled={traceRunning}
              spellCheck={false}
            />
          </div>
          <button className="btn btn-primary" onClick={handleTrace} disabled={traceRunning} style={{ height: 36 }}>
            {traceRunning ? '追踪中...' : '开始追踪'}
          </button>
        </div>
      </div>

      {traceResult && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              路由到 {traceResult.target} ({traceResult.ip})
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              {traceResult.totalHops} 跳 | {traceResult.duration}s
            </span>
          </div>

          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {/* Vertical timeline line */}
            <div
              style={{
                position: 'absolute',
                left: 9,
                top: 12,
                bottom: 12,
                width: 2,
                background: 'var(--border-color)',
              }}
            />

            {traceResult.hops.map((hop, idx) => (
              <HopRow key={hop.hop} hop={hop} isLast={idx === traceResult.hops.length - 1} index={idx} />
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '0 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>总跳数: </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{traceResult.totalHops}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>目标 IP: </span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>{traceResult.ip}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>耗时: </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{traceResult.duration}s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HopRow({ hop, isLast, index }: { hop: { hop: number; ip: string; hostname: string; rtt1: number; rtt2: number; rtt3: number; location: string }; isLast: boolean; index: number }) {
  return (
    <div
      style={{
        position: 'relative',
        paddingLeft: 20,
        paddingTop: 8,
        paddingBottom: isLast ? 0 : 20,
      }}
    >
      {/* Dot on timeline */}
      <div
        style={{
          position: 'absolute',
          left: -19,
          top: 14,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: index === 0 ? 'var(--accent)' : isLast ? 'var(--green)' : 'var(--border-color)',
          border: '2px solid var(--bg-primary)',
          zIndex: 1,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', minWidth: 28 }}>
          #{hop.hop}
        </span>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-primary)' }}>
          {hop.ip}
        </span>
        {hop.hostname && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            ({hop.hostname})
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-muted)', color: 'var(--accent)' }}>
          {hop.location}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
        <span>{hop.rtt1} ms</span>
        <span>{hop.rtt2} ms</span>
        <span>{hop.rtt3} ms</span>
        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
          平均: {Math.round((hop.rtt1 + hop.rtt2 + hop.rtt3) / 3 * 100) / 100} ms
        </span>
      </div>
    </div>
  );
}
