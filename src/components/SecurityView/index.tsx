import { useEffect } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Search, Check, X, Clock,
  Fingerprint, Key, UserCog, HardDrive, RefreshCw, Globe, Monitor, AlertTriangle,
} from 'lucide-react';
import { useSecurityStore } from '../../stores/securityStore';
import { LoadingSpinner } from '../common/LoadingState';

const OVERALL_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; bg: string; label: string }> = {
  protected: { icon: ShieldCheck, color: 'var(--green)', bg: 'rgba(63,185,80,0.08)', label: 'Protected' },
  warning: { icon: ShieldAlert, color: 'var(--yellow)', bg: 'rgba(210,153,34,0.08)', label: 'Warning' },
  critical: { icon: ShieldX, color: 'var(--red)', bg: 'rgba(248,81,73,0.08)', label: 'At Risk' },
};

export default function SecurityView() {
  const {
    status, loading, scanning, scanResult,
    fetchStatus, runQuickScan, clearScanResult,
  } = useSecurityStore();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (scanResult) {
      const t = setTimeout(clearScanResult, 5000);
      return () => clearTimeout(t);
    }
  }, [scanResult, clearScanResult]);

  if (loading && !status) {
    return (
      <LoadingSpinner />
    );
  }

  if (!status) return null;

  const overall = OVERALL_CONFIG[status.overall];
  const OverallIcon = overall.icon;

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Security Center</h2>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">Windows Security</span>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div style={{
        padding: 20, borderRadius: 'var(--radius)', marginBottom: 16,
        background: overall.bg, border: `1px solid ${overall.color}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ color: overall.color, display: 'flex' }}><OverallIcon size={40} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: overall.color }}>System {overall.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Last scan: {status.antivirus.lastScan} &middot; {status.antivirus.name}
          </div>
          {scanResult && (
            <div style={{ marginTop: 6, fontSize: 12, color: scanResult.status === 'clean' ? 'var(--green)' : 'var(--red)' }}>
              Scan complete: {scanResult.scanned.toLocaleString()} items in {scanResult.duration} &mdash; {scanResult.threats === 0 ? 'No threats found' : `${scanResult.threats} threats found`}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          disabled={scanning}
          onClick={runQuickScan}
        >
          {scanning ? (
            <><RefreshCw size={14} className="spin" /> Scanning...</>
          ) : (
            <><Search size={14} /> Run Quick Scan</>
          )}
        </button>
      </div>

      {/* Section Cards - 2 column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        {/* Antivirus */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: status.antivirus.enabled ? 'var(--green)' : 'var(--red)' }} />
              <span className="card-title">Antivirus</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
              color: status.antivirus.enabled ? 'var(--green)' : 'var(--red)',
              background: status.antivirus.enabled ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)',
            }}>
              {status.antivirus.enabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div style={{ fontSize: 13 }}>{status.antivirus.name}</div>
          <div className="text-sm" style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="flex items-center gap-2">
              {status.antivirus.definitions.startsWith('Up to date') ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Definitions: {status.antivirus.definitions}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={12} color="var(--green)" />
              <span>Last scan: {status.antivirus.lastScan}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.antivirus.realTimeProtection ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Real-time protection: {status.antivirus.realTimeProtection ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>

        {/* Firewall */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: status.firewall.enabled ? 'var(--green)' : 'var(--red)' }} />
              <span className="card-title">Firewall</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
              color: status.firewall.enabled ? 'var(--green)' : 'var(--red)',
              background: status.firewall.enabled ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)',
            }}>
              {status.firewall.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="flex items-center gap-2">
              {status.firewall.enabled ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Windows Firewall: {status.firewall.enabled ? 'Active' : 'Inactive'}</span>
            </div>
            <div><span className="text-muted">Active rules: </span>{status.firewall.activeRules}</div>
            <div><span className="text-muted">Public network: </span>
              <span style={{ color: status.firewall.publicNetwork === 'blocked' ? 'var(--green)' : 'var(--yellow)' }}>
                {status.firewall.publicNetwork === 'blocked' ? 'Blocked' : 'Allowed'}
              </span>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <UserCog size={16} style={{ color: 'var(--accent)' }} />
              <span className="card-title">Account Security</span>
            </div>
          </div>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="flex items-center gap-2">
              {status.account.passwordProtected ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Password protected</span>
            </div>
            <div className="flex items-center gap-2">
              {status.account.hasPin ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Windows Hello PIN</span>
            </div>
            <div className="flex items-center gap-2">
              {status.account.hasFingerprint ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--yellow)" />}
              <span>Fingerprint: {status.account.hasFingerprint ? 'Configured' : 'Not configured'}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.account.isAdmin ? <ShieldAlert size={12} color="var(--yellow)" /> : <Check size={12} color="var(--green)" />}
              <span>Admin account: {status.account.isAdmin ? 'Yes (consider standard user)' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.account.uacEnabled ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>UAC: {status.account.uacEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>Last password change: {status.account.lastPasswordChange}</div>
          </div>
        </div>

        {/* Encryption */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <HardDrive size={16} style={{ color: status.encryption.bitlockerEnabled ? 'var(--green)' : 'var(--yellow)' }} />
              <span className="card-title">Encryption</span>
            </div>
          </div>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="flex items-center gap-2">
              {status.encryption.bitlockerEnabled ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>BitLocker: {status.encryption.bitlockerEnabled ? 'Active' : 'Off'}</span>
            </div>
            <div><span className="text-muted">Encrypted drives: </span>{status.encryption.encryptedDrives.join(', ')}</div>
            <div className="flex items-center gap-2">
              {status.encryption.deviceEncryption ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Device encryption support: {status.encryption.deviceEncryption ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Windows Update */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} style={{ color: status.updates.windowsUpdate === 'upToDate' ? 'var(--green)' : 'var(--yellow)' }} />
              <span className="card-title">Windows Update</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
              color: status.updates.windowsUpdate === 'upToDate' ? 'var(--green)' : 'var(--yellow)',
              background: status.updates.windowsUpdate === 'upToDate' ? 'rgba(63,185,80,0.12)' : 'rgba(210,153,34,0.12)',
              textTransform: 'capitalize',
            }}>
              {status.updates.windowsUpdate === 'upToDate' ? 'Up to date' : status.updates.windowsUpdate}
            </span>
          </div>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>Last check: {status.updates.lastUpdateCheck}</div>
            <div style={{ color: status.updates.pendingUpdates > 0 ? 'var(--yellow)' : 'var(--green)' }}>
              Pending updates: {status.updates.pendingUpdates}
            </div>
          </div>
        </div>

        {/* Browser */}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <span className="card-title">Browser Security</span>
            </div>
          </div>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div><span className="text-muted">Default: </span>{status.browser.defaultBrowser}</div>
            <div className="flex items-center gap-2">
              {status.browser.safeBrowsingEnabled ? <Check size={12} color="var(--green)" /> : <X size={12} color="var(--red)" />}
              <span>Safe browsing: {status.browser.safeBrowsingEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.browser.adBlockPresent ? <Check size={12} color="var(--green)" /> : <ShieldAlert size={12} color="var(--yellow)" />}
              <span>Ad blocker: {status.browser.adBlockPresent ? 'Present' : 'Not detected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {status.recommendations.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {status.recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 'var(--radius)', background: 'var(--bg-primary)',
                border: '1px solid var(--border-muted)',
              }}>
                {i === 0 ? (
                  <AlertTriangle size={16} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontSize: 13 }}>{rec}</span>
                <button className="btn btn-sm">Fix it</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
