import { useState, useEffect } from 'react';
import { Save, Check, Info, Server, Cpu, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const [endpoint, setEndpoint] = useState('https://api.deepseek.com');
  const [model, setModel] = useState('deepseek-v4-pro');
  const [apiKey, setApiKey] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('1000');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.pchelper.getAllSettings().then((settings) => {
      for (const s of settings) {
        if (s.key === 'ai_endpoint') setEndpoint(s.value);
        if (s.key === 'ai_model') setModel(s.value);
        if (s.key === 'ai_api_key') setApiKey(s.value);
        if (s.key === 'refresh_interval') setRefreshInterval(s.value);
      }
    });
  }, []);

  async function handleSave(key: string, value: string) {
    await window.pchelper.setSetting(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-col" style={{ gap: 24, maxWidth: 640 }}>
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Settings</h2>
        {saved && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={14} />
            Saved
          </span>
        )}
      </div>

      {/* AI Configuration */}
      <div className="card">
        <div className="card-header">
          <span className="flex items-center" style={{ gap: 8 }}>
            <Server size={14} style={{ color: 'var(--accent)' }} />
            <span className="card-title">AI Configuration</span>
          </span>
        </div>
        <div className="flex-col gap-3">
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              API Endpoint
            </label>
            <input
              className="input"
              value={endpoint}
              placeholder="https://api.deepseek.com"
              onChange={(e) => setEndpoint(e.target.value)}
              onBlur={() => handleSave('ai_endpoint', endpoint)}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Model
            </label>
            <select
              className="input"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                handleSave('ai_model', e.target.value);
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
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              API Key
            </label>
            <input
              className="input"
              type="password"
              value={apiKey}
              placeholder="sk-..."
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={() => handleSave('ai_api_key', apiKey)}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Your key is stored locally and never shared.
            </div>
          </div>
        </div>
      </div>

      {/* Data Refresh */}
      <div className="card">
        <div className="card-header">
          <span className="flex items-center" style={{ gap: 8 }}>
            <RefreshCw size={14} style={{ color: 'var(--green)' }} />
            <span className="card-title">Hardware Monitoring</span>
          </span>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            Refresh Interval (ms)
          </label>
          <input
            className="input"
            type="number"
            min="500"
            max="10000"
            step="100"
            value={refreshInterval}
            style={{ maxWidth: 200 }}
            onChange={(e) => setRefreshInterval(e.target.value)}
            onBlur={() => handleSave('refresh_interval', refreshInterval)}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Lower values use more CPU. Recommended: 1000ms.
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-header">
          <span className="flex items-center" style={{ gap: 8 }}>
            <Info size={14} style={{ color: 'var(--text-secondary)' }} />
            <span className="card-title">About</span>
          </span>
        </div>
        <div className="flex-col gap-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Application</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>PCHelper</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Version</span>
            <span className="text-mono" style={{ fontSize: 13 }}>1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Platform</span>
            <span className="text-mono" style={{ fontSize: 13 }}>
              Windows
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Engine</span>
            <span style={{ fontSize: 13 }}>Electron + React</span>
          </div>
          <div
            style={{
              marginTop: 8,
              paddingTop: 12,
              borderTop: '1px solid var(--border-color)',
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            A system diagnostic and monitoring toolkit. <br />
            Hardware detection via WMI and LibreHardwareMonitor. <br />
            AI assistance powered by DeepSeek V4 Pro.
          </div>
        </div>
      </div>

      {/* Save button for manual triggers */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary"
          onClick={async () => {
            await window.pchelper.setSetting('ai_endpoint', endpoint);
            await window.pchelper.setSetting('ai_model', model);
            await window.pchelper.setSetting('ai_api_key', apiKey);
            await window.pchelper.setSetting('refresh_interval', refreshInterval);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          <Save size={14} />
          Save All Settings
        </button>
      </div>
    </div>
  );
}
