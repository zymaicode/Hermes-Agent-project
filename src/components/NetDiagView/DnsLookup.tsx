import { useState } from 'react';
import { useNetDiagStore } from '../../stores/netdiagStore';

const RECORD_TYPES = [
  { value: '', label: '全部记录' },
  { value: 'A', label: 'A (IPv4)' },
  { value: 'AAAA', label: 'AAAA (IPv6)' },
  { value: 'CNAME', label: 'CNAME (别名)' },
  { value: 'MX', label: 'MX (邮件)' },
  { value: 'NS', label: 'NS (域名服务器)' },
  { value: 'TXT', label: 'TXT (文本)' },
  { value: 'SOA', label: 'SOA (授权)' },
];

const RECORD_COLORS: Record<string, string> = {
  A: '#4fc3f7',
  AAAA: '#ce93d8',
  CNAME: '#ff8a65',
  MX: '#81c784',
  NS: '#ffd54f',
  TXT: '#90a4ae',
  SOA: '#e57373',
};

export default function DnsLookup() {
  const { dnsResult, dnsRunning, runDnsLookup } = useNetDiagStore();
  const [domain, setDomain] = useState('baidu.com');
  const [recordType, setRecordType] = useState('');

  const handleLookup = () => {
    if (!domain.trim()) return;
    const types = recordType ? [recordType] : undefined;
    runDnsLookup(domain.trim(), types);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  };

  // Group records by type
  const grouped = dnsResult
    ? dnsResult.records.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
      }, {} as Record<string, typeof dnsResult.records>)
    : null;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">DNS 查询</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>域名</label>
            <input
              className="input"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入域名..."
              disabled={dnsRunning}
              spellCheck={false}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>记录类型</label>
            <select
              className="input"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              disabled={dnsRunning}
            >
              {RECORD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleLookup} disabled={dnsRunning} style={{ height: 36 }}>
            {dnsRunning ? '查询中...' : '查询'}
          </button>
        </div>
      </div>

      {dnsResult && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{dnsResult.domain} 的 DNS 记录</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 12 }}>
              解析器: {dnsResult.resolver}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
              {dnsResult.records.length} 条记录 | {dnsResult.duration}s
            </span>
          </div>

          {grouped && Object.entries(grouped).map(([type, records]) => (
            <div key={type} style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 8, marginTop: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${RECORD_COLORS[type] || 'var(--accent)'}22`,
                    color: RECORD_COLORS[type] || 'var(--accent)',
                    border: `1px solid ${RECORD_COLORS[type] || 'var(--accent)'}44`,
                  }}
                >
                  {type}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>
                  {records.length} 条
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>值</th>
                      <th style={{ ...thStyle, width: 100 }}>TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)', wordBreak: 'break-all' }}>
                          {r.value}
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {r.ttl}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {dnsResult.records.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              未找到记录
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
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
