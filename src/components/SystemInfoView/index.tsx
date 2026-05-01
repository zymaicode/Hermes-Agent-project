import { useEffect, useState } from 'react';
import { Monitor, Cpu, Battery, Clock, HardDrive, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useSystemStore } from '../../stores/systemStore';
import { LoadingSpinner } from '../common/LoadingState';

export default function SystemInfoView() {
  const { info, loading, envSearch, fetchInfo, setEnvSearch } = useSystemStore();
  const [envExpanded, setEnvExpanded] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  if (loading || !info) {
    return (
      <LoadingSpinner />
    );
  }

  const filteredEnv = envSearch
    ? info.environment.variables.filter(
        (v) => v.name.toLowerCase().includes(envSearch.toLowerCase()) || v.value.toLowerCase().includes(envSearch.toLowerCase())
      )
    : info.environment.variables;

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>System Information</h2>
        <button className="btn" onClick={fetchInfo}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* OS Section */}
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), #1a6dd4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Monitor size={28} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{info.os.name}</div>
            <div className="text-sm text-muted">
              Version {info.os.version} &middot; Build {info.os.buildNumber} &middot; {info.os.edition}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <InfoItem icon={Clock} label="Uptime" value={info.os.uptime} />
          <InfoItem icon={Cpu} label="Architecture" value={info.os.architecture} />
          <InfoItem icon={HardDrive} label="Install Date" value={info.os.installDate} />
          <InfoItem icon={Clock} label="Last Boot" value={info.os.lastBoot.replace('T', ' ').slice(0, 16)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Computer Section */}
        <div className="card">
          <div className="card-header"><span className="card-title">Computer</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Name" value={info.computer.name} />
            <Field label="Manufacturer" value={info.computer.manufacturer} />
            <Field label="Model" value={info.computer.model} />
            <Field label="Serial Number" value={info.computer.serialNumber} />
            <Field label="BIOS Vendor" value={info.computer.biosVendor} />
            <Field label="BIOS Version" value={info.computer.biosVersion} />
            <Field label="BIOS Date" value={info.computer.biosDate} />
            <Field label="Processors" value={`${info.environment.processorCount} cores / ${info.environment.logicalProcessors} logical`} />
          </div>
        </div>

        {/* Power Section */}
        <div className="card">
          <div className="card-header"><span className="card-title">Power</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Battery size={24} style={{ color: info.power.powerSource === 'AC' ? 'var(--green)' : 'var(--yellow)' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {info.power.powerSource === 'AC' ? 'AC Power' : 'Battery'}
              </div>
              <div className="text-sm text-muted">
                {info.power.powerSource === 'AC' ? 'Plugged in' : `${info.power.batteryPercent ?? '?'}% remaining`}
              </div>
            </div>
          </div>
          {info.power.powerSource === 'Battery' && info.power.batteryPercent !== undefined && (
            <div style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Battery Level</span>
                <span className="text-mono" style={{ fontSize: 12 }}>{info.power.batteryPercent}%</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-bar-fill green" style={{ width: `${info.power.batteryPercent}%` }} />
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Remaining" value={info.power.batteryRemaining ?? 'N/A'} />
            <Field label="Battery Health" value={info.power.batteryHealth ? `${info.power.batteryHealth}%` : 'N/A'} />
          </div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="card">
        <div
          className="card-header"
          style={{ cursor: 'pointer' }}
          onClick={() => setEnvExpanded(!envExpanded)}
        >
          <div className="flex items-center gap-2">
            {envExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />}
            <span className="card-title">Environment Variables ({info.environment.variables.length})</span>
          </div>
        </div>
        {envExpanded && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-secondary)' }} />
              <input
                className="input"
                placeholder="Search variables..."
                value={envSearch}
                onChange={(e) => setEnvSearch(e.target.value)}
                style={{ paddingLeft: 30 }}
              />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnv.map((v) => (
                    <tr key={v.name}>
                      <td className="text-mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {v.name}
                      </td>
                      <td className="text-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>
                        {v.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ flexShrink: 0 }}><Icon size={16} color="var(--accent)" /></span>
      <div>
        <div className="stat-label">{label}</div>
        <div className="text-mono" style={{ fontSize: 13 }}>{value}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="text-mono" style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}
