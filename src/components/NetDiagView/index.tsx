import { useState } from 'react';
import { Network, Globe, Router, Search, Gauge } from 'lucide-react';
import PingTool from './PingTool';
import TraceRoute from './TraceRoute';
import PortScanner from './PortScanner';
import DnsLookup from './DnsLookup';
import BandwidthTest from './BandwidthTest';

type NetDiagTab = 'ping' | 'traceroute' | 'portscan' | 'dns' | 'bandwidth';

const TABS: { id: NetDiagTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'ping', label: 'Ping 测试', icon: Network },
  { id: 'traceroute', label: '路由追踪', icon: Router },
  { id: 'portscan', label: '端口扫描', icon: Search },
  { id: 'dns', label: 'DNS 查询', icon: Globe },
  { id: 'bandwidth', label: '带宽测试', icon: Gauge },
];

export default function NetDiagView() {
  const [activeTab, setActiveTab] = useState<NetDiagTab>('ping');

  const renderTool = () => {
    switch (activeTab) {
      case 'ping':
        return <PingTool />;
      case 'traceroute':
        return <TraceRoute />;
      case 'portscan':
        return <PortScanner />;
      case 'dns':
        return <DnsLookup />;
      case 'bandwidth':
        return <BandwidthTest />;
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>网络诊断工具箱</h2>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                background: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                borderRadius: 'var(--radius) var(--radius) 0 0',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>{renderTool()}</div>
    </div>
  );
}
