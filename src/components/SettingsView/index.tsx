import { useState, useEffect, useCallback } from 'react';
import {
  Save, Check, Info, Server, Cpu, RefreshCw, Bell, BellOff,
  Monitor, Globe, Database, Download, RotateCcw, Trash2,
  ChevronDown, ChevronRight, Loader2, XCircle,
} from 'lucide-react';
import iconUrl from '../../../assets/icon_64x64.png';

/* ── Types ─────────────────────────────────────── */

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const DEFAULT_SETTINGS: Record<string, string> = {
  ai_endpoint: 'https://api.deepseek.com',
  ai_model: 'deepseek-v4-pro',
  ai_api_key: '',
  refresh_interval: '1000',
  monitoring_enabled: 'true',
  notifications_enabled: 'true',
  notifications_auto_dismiss: '5',
  theme: 'dark',
  language: 'en',
};

/* ── Collapsible Section ──────────────────────── */

function Section({
  icon,
  title,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card settings-card">
      <div className="settings-section-header" onClick={() => setOpen(!open)}>
        <span className="flex items-center" style={{ gap: 8 }}>
          {icon}
          <span className="card-title">{title}</span>
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {open && <div className="settings-section-body">{children}</div>}
    </div>
  );
}

/* ── Main Component ───────────────────────────── */

export default function SettingsView() {
  const [endpoint, setEndpoint] = useState(DEFAULT_SETTINGS.ai_endpoint);
  const [model, setModel] = useState(DEFAULT_SETTINGS.ai_model);
  const [apiKey, setApiKey] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_SETTINGS.refresh_interval);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoDismiss, setAutoDismiss] = useState(DEFAULT_SETTINGS.notifications_auto_dismiss);
  const [theme, setTheme] = useState(DEFAULT_SETTINGS.theme);
  const [language, setLanguage] = useState(DEFAULT_SETTINGS.language);
  const [saved, setSaved] = useState(false);

  /* Connection test */
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('idle');
  const [connError, setConnError] = useState('');

  /* ── Load settings ─────────────────────────── */

  useEffect(() => {
    window.pchelper.getAllSettings().then((settings) => {
      const map: Record<string, string> = {};
      for (const s of settings) map[s.key] = s.value;
      if (map.ai_endpoint) setEndpoint(map.ai_endpoint);
      if (map.ai_model) setModel(map.ai_model);
      if (map.ai_api_key) setApiKey(map.ai_api_key);
      if (map.refresh_interval) setRefreshInterval(map.refresh_interval);
      if (map.monitoring_enabled) setMonitoringEnabled(map.monitoring_enabled === 'true');
      if (map.notifications_enabled) setNotificationsEnabled(map.notifications_enabled === 'true');
      if (map.notifications_auto_dismiss) setAutoDismiss(map.notifications_auto_dismiss);
      if (map.theme) setTheme(map.theme);
      if (map.language) setLanguage(map.language);
    });
  }, []);

  /* ── Helpers ───────────────────────────────── */

  const save = useCallback(async (key: string, value: string) => {
    await window.pchelper.setSetting(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ── Test connection ────────────────────────── */

  async function handleTestConnection() {
    if (!apiKey) {
      setConnStatus('error');
      setConnError('API key is required');
      return;
    }
    setConnStatus('testing');
    setConnError('');
    try {
      const result = await window.pchelper.testAiConnection(endpoint, model, apiKey);
      if (result.success) {
        setConnStatus('success');
      } else {
        setConnStatus('error');
        setConnError(result.error || 'Connection failed');
      }
    } catch (err) {
      setConnStatus('error');
      setConnError(String(err));
    }
  }

  /* ── Export settings ────────────────────────── */

  async function handleExportSettings() {
    const settings = await window.pchelper.getAllSettings();
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pchelper-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Reset to defaults ──────────────────────── */

  async function handleResetDefaults() {
    if (!confirm('Reset all settings to their default values? This cannot be undone.')) return;
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await window.pchelper.setSetting(key, value);
    }
    setEndpoint(DEFAULT_SETTINGS.ai_endpoint);
    setModel(DEFAULT_SETTINGS.ai_model);
    setApiKey('');
    setRefreshInterval(DEFAULT_SETTINGS.refresh_interval);
    setMonitoringEnabled(true);
    setNotificationsEnabled(true);
    setAutoDismiss(DEFAULT_SETTINGS.notifications_auto_dismiss);
    setTheme(DEFAULT_SETTINGS.theme);
    setLanguage(DEFAULT_SETTINGS.language);
    flashSaved();
  }

  /* ── Clear local data ───────────────────────── */

  async function handleClearLocalData() {
    if (!confirm('This will delete ALL locally stored data including chat history, alerts, health scores, and hardware history. This cannot be undone.\n\nAre you sure?')) return;
    const result = await window.pchelper.clearLocalData();
    if (result.success) {
      alert('Local data cleared successfully. Settings have been reset.');
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await window.pchelper.setSetting(key, value);
      }
      setEndpoint(DEFAULT_SETTINGS.ai_endpoint);
      setModel(DEFAULT_SETTINGS.ai_model);
      setApiKey('');
      setRefreshInterval(DEFAULT_SETTINGS.refresh_interval);
      setMonitoringEnabled(true);
      setNotificationsEnabled(true);
      setAutoDismiss(DEFAULT_SETTINGS.notifications_auto_dismiss);
      setTheme(DEFAULT_SETTINGS.theme);
      setLanguage(DEFAULT_SETTINGS.language);
    }
  }

  /* ── Render ─────────────────────────────────── */

  return (
    <div className="flex-col" style={{ gap: 20, maxWidth: 680 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="settings-heading">Settings</h2>
        {saved && (
          <span className="settings-saved-badge">
            <Check size={14} />
            Saved
          </span>
        )}
      </div>

      {/* ── 1. AI & API ────────────────────────── */}
      <Section
        icon={<Server size={14} style={{ color: 'var(--accent)' }} />}
        title="AI & API"
      >
        <div className="flex-col" style={{ gap: 14 }}>
          <div>
            <label className="settings-label">API Endpoint</label>
            <input
              className="input"
              value={endpoint}
              placeholder="https://api.deepseek.com"
              onChange={(e) => setEndpoint(e.target.value)}
              onBlur={() => save('ai_endpoint', endpoint)}
            />
          </div>
          <div>
            <label className="settings-label">Model</label>
            <select
              className="input"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                save('ai_model', e.target.value);
              }}
              style={{ cursor: 'pointer' }}
            >
              <option value="deepseek-v4-pro">DeepSeek V4 Pro (默认)</option>
              <option value="deepseek-reasoner">DeepSeek R1</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            </select>
          </div>
          <div>
            <label className="settings-label">API Key</label>
            <div className="flex items-center" style={{ gap: 8 }}>
              <input
                className="input"
                type="password"
                value={apiKey}
                placeholder="sk-..."
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => save('ai_api_key', apiKey)}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-sm"
                onClick={handleTestConnection}
                disabled={connStatus === 'testing'}
              >
                {connStatus === 'testing' && <Loader2 size={12} className="spin" />}
                {connStatus === 'success' && <Check size={12} style={{ color: 'var(--green)' }} />}
                {connStatus === 'error' && <XCircle size={12} style={{ color: 'var(--red)' }} />}
                Test
              </button>
            </div>
            {connStatus === 'success' && (
              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>Connection successful</div>
            )}
            {connStatus === 'error' && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{connError}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Your key is stored locally and never shared.
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. Monitoring ──────────────────────── */}
      <Section
        icon={<Cpu size={14} style={{ color: 'var(--green)' }} />}
        title="Monitoring"
      >
        <div className="flex-col" style={{ gap: 14 }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Hardware Monitoring</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Enable continuous hardware data collection
              </div>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={monitoringEnabled}
                onChange={(e) => {
                  setMonitoringEnabled(e.target.checked);
                  save('monitoring_enabled', String(e.target.checked));
                }}
              />
              <span className="settings-toggle-slider" />
            </label>
          </div>
          {monitoringEnabled && (
            <div>
              <label className="settings-label">Refresh Interval (ms)</label>
              <input
                className="input"
                type="number"
                min="500"
                max="10000"
                step="100"
                value={refreshInterval}
                style={{ maxWidth: 200 }}
                onChange={(e) => setRefreshInterval(e.target.value)}
                onBlur={() => save('refresh_interval', refreshInterval)}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Lower values use more CPU. Recommended: 1000ms.
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── 3. Notifications ───────────────────── */}
      <Section
        icon={<Bell size={14} style={{ color: 'var(--yellow)' }} />}
        title="Notifications"
      >
        <div className="flex-col" style={{ gap: 14 }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Alert Notifications</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Show popup alerts for hardware issues
              </div>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => {
                  setNotificationsEnabled(e.target.checked);
                  save('notifications_enabled', String(e.target.checked));
                }}
              />
              <span className="settings-toggle-slider" />
            </label>
          </div>
          {notificationsEnabled && (
            <div>
              <label className="settings-label">Auto-dismiss after (minutes)</label>
              <input
                className="input"
                type="number"
                min="1"
                max="120"
                value={autoDismiss}
                style={{ maxWidth: 120 }}
                onChange={(e) => setAutoDismiss(e.target.value)}
                onBlur={() => save('notifications_auto_dismiss', autoDismiss)}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Alerts will auto-dismiss after this many minutes. Set to 0 to disable auto-dismiss.
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── 4. Display ─────────────────────────── */}
      <Section
        icon={<Monitor size={14} style={{ color: 'var(--purple)' }} />}
        title="Display"
      >
        <div className="flex-col" style={{ gap: 14 }}>
          <div>
            <label className="settings-label">Theme</label>
            <select
              className="input"
              value={theme}
              style={{ maxWidth: 200, cursor: 'pointer' }}
              onChange={(e) => {
                setTheme(e.target.value);
                save('theme', e.target.value);
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="settings-label">Language / 语言</label>
            <select
              className="input"
              value={language}
              style={{ maxWidth: 200, cursor: 'pointer' }}
              onChange={(e) => {
                setLanguage(e.target.value);
                save('language', e.target.value);
              }}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── 5. Data Management ─────────────────── */}
      <Section
        icon={<Database size={14} style={{ color: 'var(--text-secondary)' }} />}
        title="Data Management"
      >
        <div className="flex-col" style={{ gap: 10 }}>
          <button className="btn" onClick={handleExportSettings}>
            <Download size={14} />
            Export Settings
          </button>
          <button className="btn" onClick={handleResetDefaults}>
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
          <button
            className="btn"
            onClick={handleClearLocalData}
            style={{ color: 'var(--red)' }}
          >
            <Trash2 size={14} />
            Clear Local Data
          </button>
        </div>
      </Section>

      {/* ── 6. About ───────────────────────────── */}
      <Section
        icon={<Info size={14} style={{ color: 'var(--text-secondary)' }} />}
        title="About"
      >
        <div className="settings-about">
          <img src={iconUrl} alt="PCHelper" className="settings-about-icon" />
          <div className="flex-col" style={{ gap: 8, flex: 1 }}>
            <div className="flex items-center justify-between">
              <span className="settings-label">Application</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>PCHelper</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="settings-label">Version</span>
              <span className="text-mono" style={{ fontSize: 13 }}>1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="settings-label">Platform</span>
              <span className="text-mono" style={{ fontSize: 13 }}>Windows</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="settings-label">Engine</span>
              <span style={{ fontSize: 13 }}>Electron + React + Vite</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="settings-label">Database</span>
              <span style={{ fontSize: 13 }}>SQLite (better-sqlite3)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="settings-label">Charts</span>
              <span style={{ fontSize: 13 }}>Recharts</span>
            </div>
          </div>
        </div>
        <div className="settings-about-footer">
          A system diagnostic, monitoring, and health assessment toolkit.
          Hardware detection via WMI and LibreHardwareMonitor.
          AI assistance powered by DeepSeek V4 Pro.
        </div>
      </Section>
    </div>
  );
}
