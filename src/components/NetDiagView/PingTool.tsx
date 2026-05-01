import { useState } from 'react';
import { useNetDiagStore } from '../../stores/netdiagStore';

export default function PingTool() {
  const { pingResult, pingRunning, runPing } = useNetDiagStore();
  const [target, setTarget] = useState('baidu.com');
  const [count, setCount] = useState(4);

  const handlePing = () => {
    if (!target.trim()) return;
    runPing(target.trim(), count, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePing();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Ping 测试</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>目标地址</label>
            <input
              className="input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 IP 或域名..."
              disabled={pingRunning}
              spellCheck={false}
            />
          </div>
          <div style={{ width: 80 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>次数</label>
            <select
              className="input"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={pingRunning}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handlePing} disabled={pingRunning} style={{ height: 36 }}>
            {pingRunning ? 'Pinging...' : '开始 Ping'}
          </button>
        </div>
      </div>

      {pingResult && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">统计信息</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <StatItem label="目标" value={pingResult.target} />
              <StatItem label="IP 地址" value={pingResult.ip} />
              <StatItem label="发送" value={`${pingResult.sent}`} />
              <StatItem label="接收" value={`${pingResult.received}`} />
              <StatItem label="丢包率" value={`${pingResult.loss}%`} color={pingResult.loss > 0 ? 'var(--red)' : 'var(--green)'} />
              <StatItem label="最小延迟" value={`${pingResult.rtt.min} ms`} />
              <StatItem label="最大延迟" value={`${pingResult.rtt.max} ms`} />
              <StatItem label="平均延迟" value={`${pingResult.rtt.avg} ms`} />
              <StatItem label="上次延迟" value={`${pingResult.rtt.last} ms`} />
              <StatItem label="TTL" value={`${pingResult.ttl}`} />
              <StatItem label="耗时" value={`${pingResult.duration}s`} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>成功率</span>
                <div style={{ flex: 1, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${100 - pingResult.loss}%`,
                      background: pingResult.loss === 0 ? 'var(--green)' : pingResult.loss < 50 ? 'var(--yellow)' : 'var(--red)',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{100 - pingResult.loss}%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">延迟趋势</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '8px 0' }}>
              {[pingResult.rtt.avg * 0.8, pingResult.rtt.avg * 0.9, pingResult.rtt.avg, pingResult.rtt.avg * 1.1, pingResult.rtt.avg * 0.95, pingResult.rtt.avg * 1.05, pingResult.rtt.avg * 0.85, pingResult.rtt.last].map((val, i) => {
                const maxVal = Math.max(...[pingResult.rtt.avg * 0.8, pingResult.rtt.avg * 0.9, pingResult.rtt.avg, pingResult.rtt.avg * 1.1, pingResult.rtt.avg * 0.95, pingResult.rtt.avg * 1.05, pingResult.rtt.avg * 0.85, pingResult.rtt.last]);
                const h = (val / maxVal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{Math.round(val)}ms</span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 40,
                        height: `${Math.max(h, 4)}%`,
                        background: val > pingResult.rtt.avg * 1.2 ? 'var(--red)' : 'var(--accent)',
                        borderRadius: 'var(--radius)',
                        minHeight: 4,
                        transition: 'height 0.3s',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)' }}>
        {value}
      </div>
    </div>
  );
}
