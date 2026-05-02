import { useState } from 'react';
import { Eye, Shield, Clock, FileText, Trash2, Lock, AlertTriangle, Info } from 'lucide-react';
import { usePrivacyStore } from '../../stores/privacyStore';
import type { PrivacyRiskItem, BrowserTrace, RecentFileEntry } from '../../../electron/privacy/types';
import './PrivacyCleanup.css';

const RISK_COLORS: Record<string, string> = {
  critical: 'var(--red)',
  high: 'var(--orange)',
  medium: 'var(--yellow)',
  low: 'var(--green)',
};

const GRADE_COLORS: Record<string, string> = {
  Excellent: 'var(--green)',
  Good: 'var(--accent)',
  Fair: 'var(--yellow)',
  Poor: 'var(--orange)',
  Critical: 'var(--red)',
};

const TRACE_LABELS: Record<string, string> = {
  history: 'Browsing History',
  cache: 'Cache',
  cookies: 'Cookies',
  passwords: 'Saved Passwords',
  downloads: 'Download History',
  autofill: 'Autofill Data',
  sessions: 'Session Data',
};

const TRACE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  history: Clock,
  cache: FileText,
  cookies: Shield,
  passwords: Lock,
  downloads: FileText,
  autofill: FileText,
  sessions: Clock,
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = GRADE_COLORS[grade] || 'var(--text-secondary)';

  return (
    <div className="privacy-score-ring" style={{ position: 'relative', width: 130, height: 130 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--card-border)" strokeWidth="8" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 130, height: 130,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color }}>{score}</span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{grade}</span>
      </div>
    </div>
  );
}

function RiskCard({ item, expanded, onToggle }: { item: PrivacyRiskItem; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`privacy-risk-card privacy-risk-${item.risk}`}
      onClick={onToggle}
    >
      <div className="privacy-risk-header">
        <div>
          <span className="privacy-risk-category">{item.category}</span>
          <span className="privacy-risk-badge" style={{
            background: `${RISK_COLORS[item.risk]}20`,
            color: RISK_COLORS[item.risk],
            marginLeft: 8,
          }}>
            {item.risk}
          </span>
        </div>
        <AlertTriangle size={14} style={{ color: RISK_COLORS[item.risk], opacity: 0.7 }} />
      </div>
      <div className="privacy-risk-desc">{item.description}</div>
      {expanded && (
        <>
          <div className="privacy-risk-details">{item.details}</div>
          <div className="privacy-risk-recommendation">Recommendation: {item.recommendation}</div>
        </>
      )}
    </div>
  );
}

function BrowserTraceTable({ traces, onClean }: { traces: BrowserTrace[]; onClean: (trace: BrowserTrace) => void }) {
  return (
    <table className="privacy-table">
      <thead>
        <tr>
          <th>Trace Type</th>
          <th>Records</th>
          <th>Size (MB)</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {traces.map((t) => {
          const Icon = TRACE_ICONS[t.traceType] || Info;
          return (
            <tr key={t.traceType}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="privacy-file-icon"><Icon size={14} /></span>
                  {TRACE_LABELS[t.traceType] || t.traceType}
                </div>
              </td>
              <td>{t.count.toLocaleString()}</td>
              <td>{t.sizeMB.toFixed(1)} MB</td>
              <td>
                {t.canClean ? (
                  <span style={{ fontSize: 11, color: 'var(--orange)' }}>Can clean</span>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>In use</span>
                )}
              </td>
              <td>
                <button
                  className={`privacy-clean-btn ${t.canClean ? 'can-clean' : ''}`}
                  disabled={!t.canClean}
                  onClick={(e) => { e.stopPropagation(); onClean(t); }}
                >
                  Clean
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PrivacyCleanup() {
  const { scanResult, scanning, cleaning, runScan, cleanAll, cleanBrowserTrace, clearRecentFiles } = usePrivacyStore();
  const [activeBrowser, setActiveBrowser] = useState(0);
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
  const [cleaningTrace, setCleaningTrace] = useState<string | null>(null);
  const [cleaningFiles, setCleaningFiles] = useState(false);

  const browsers = ['Chrome', 'Firefox', 'Edge', 'Brave'];

  const handleCleanTrace = async (trace: BrowserTrace) => {
    setCleaningTrace(`${trace.browser}:${trace.traceType}`);
    await cleanBrowserTrace(trace.browser, trace.traceType);
    setCleaningTrace(null);
  };

  const handleCleanAll = async () => {
    await cleanAll();
  };

  const handleClearRecentFiles = async () => {
    setCleaningFiles(true);
    await clearRecentFiles();
    setCleaningFiles(false);
  };

  if (!scanResult && !scanning) {
    return (
      <div className="privacy-page">
        <div className="privacy-header">
          <h2 className="privacy-title">Privacy Cleanup</h2>
        </div>
        <div className="privacy-empty">
          <span className="privacy-empty-icon"><Eye size={64} /></span>
          <h3>Privacy Scan</h3>
          <p>
            Scan your system for browser traces, saved passwords, cached data,
            and other privacy-sensitive information that can be cleaned.
          </p>
          <button className="privacy-scan-btn" onClick={runScan}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={16} /> Scan Now
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (scanning && !scanResult) {
    return (
      <div className="privacy-page">
        <div className="privacy-header">
          <h2 className="privacy-title">Privacy Cleanup</h2>
        </div>
        <div className="privacy-empty">
          <div style={{ animation: 'spin 1s linear infinite' }}>
            <Shield size={48} />
          </div>
          <h3>Scanning...</h3>
          <p>Analyzing browser traces, recent files, and privacy risks.</p>
        </div>
      </div>
    );
  }

  if (!scanResult) return null;

  const currentBrowserTraces = scanResult.browsers.filter(b => b.browser === browsers[activeBrowser]);

  return (
    <div className="privacy-page">
      {/* Header */}
      <div className="privacy-header">
        <h2 className="privacy-title">Privacy Cleanup</h2>
      </div>

      {/* Score Section */}
      <div className="privacy-score-section">
        <ScoreRing score={scanResult.privacyScore} grade={scanResult.privacyGrade} />
        <div className="privacy-score-info">
          <div className="privacy-score-value" style={{ color: GRADE_COLORS[scanResult.privacyGrade] }}>
            {scanResult.privacyScore}
          </div>
          <div className="privacy-score-grade" style={{ color: GRADE_COLORS[scanResult.privacyGrade] }}>
            {scanResult.privacyGrade}
          </div>
          <div className="privacy-score-detail">
            Total cleanable: <strong>{scanResult.totalCleanableMB.toFixed(1)} MB</strong> &middot;
            Browser traces: <strong>{scanResult.browsers.filter(b => b.canClean).length}</strong> &middot;
            Recent files: <strong>{scanResult.recentFilesCount}</strong> &middot;
            Risks: <strong>{scanResult.risks.filter(r => r.risk === 'critical' || r.risk === 'high').length}</strong> high/critical
          </div>
        </div>
        <div className="privacy-score-actions">
          <button className="privacy-scan-btn" onClick={runScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
          <button className="privacy-clean-all-btn" onClick={handleCleanAll} disabled={cleaning || scanning}>
            {cleaning ? 'Cleaning...' : 'Clean All'}
          </button>
        </div>
      </div>

      {/* Risk Overview */}
      {scanResult.risks.length > 0 && (
        <div className="privacy-risks">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Risk Overview</h3>
          {scanResult.risks.map((risk, i) => (
            <RiskCard
              key={risk.category}
              item={risk}
              expanded={expandedRisk === i}
              onToggle={() => setExpandedRisk(expandedRisk === i ? null : i)}
            />
          ))}
        </div>
      )}

      {/* Browser Traces */}
      <div className="privacy-browser-section">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Browser Traces</h3>
        <div className="privacy-browser-tabs">
          {browsers.map((b, i) => (
            <button
              key={b}
              className={`privacy-browser-tab ${i === activeBrowser ? 'active' : ''}`}
              onClick={() => setActiveBrowser(i)}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="privacy-browser-content">
          <div className="privacy-browser-header">
            <span style={{ fontSize: 14, fontWeight: 600 }}>{browsers[activeBrowser]}</span>
            <button
              className="privacy-browser-clean-all"
              onClick={handleCleanAll}
              disabled={cleaning}
            >
              {cleaning ? 'Cleaning...' : 'Clean All'}
            </button>
          </div>
          <BrowserTraceTable
            traces={currentBrowserTraces}
            onClean={handleCleanTrace}
          />
        </div>
      </div>

      {/* Recent Files */}
      <div className="privacy-files-section">
        <div className="privacy-files-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Files</h3>
            <span className="privacy-files-count">{scanResult.recentFilesCount} files tracked</span>
          </div>
          <button className="privacy-clear-files-btn" onClick={handleClearRecentFiles} disabled={cleaningFiles}>
            {cleaningFiles ? 'Clearing...' : 'Clear Recent Files'}
          </button>
        </div>
        {scanResult.recentFiles.map((file, i) => (
          <div key={i} className="privacy-file-row">
            <span className="privacy-file-icon"><FileText size={14} /></span>
            <span className="privacy-file-name">{file.name}</span>
            <span className="privacy-file-path">{file.path}</span>
            <span className="privacy-file-app">{file.appName}</span>
            <span className="privacy-file-time">{formatTime(file.lastAccessed)}</span>
            <span className="privacy-file-size">{file.sizeKB >= 1024 ? `${(file.sizeKB / 1024).toFixed(1)} MB` : `${file.sizeKB} KB`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
