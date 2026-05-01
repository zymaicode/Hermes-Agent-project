import React, { useEffect, useState, useMemo } from 'react';
import {
  Volume2, VolumeX, RefreshCw, Play, ChevronDown, ChevronRight,
  Star, Speaker, Headphones, Monitor, Usb, Bluetooth, CheckCircle,
  XCircle, ArrowDown,
} from 'lucide-react';
import { useSoundStore } from '../../stores/soundStore';
import { Badge } from '../common/Badge';
import type { SystemSound } from '../../../electron/sounds/manager';

const categoryLabels: Record<string, string> = {
  windows: 'Windows',
  notifications: 'Notifications',
  device: 'Device',
  alerts: 'Alerts',
  hardware: 'Hardware',
};

const categoryBadge: Record<string, 'blue' | 'purple' | 'green' | 'red' | 'orange'> = {
  windows: 'blue',
  notifications: 'purple',
  device: 'green',
  alerts: 'red',
  hardware: 'orange',
};

const deviceIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  speakers: Speaker,
  headphones: Headphones,
  headset: Headphones,
  monitor: Monitor,
  usb: Usb,
  bluetooth: Bluetooth,
  hdmi: Monitor,
};

function SoundRow({
  sound,
  onPlay,
  onFileChange,
  onVolumeChange,
}: {
  sound: SystemSound;
  onPlay: () => void;
  onFileChange: (file: string | null) => void;
  onVolumeChange: (vol: number) => void;
}) {
  const [fileMenu, setFileMenu] = useState(false);

  const fileOptions = [
    { label: 'Default', value: sound.isDefault ? sound.file : null },
    { label: 'None', value: null },
    { label: 'Windows Sound.wav', value: 'C:\\Windows\\Media\\Windows Notify.wav' },
    { label: 'Windows Ding.wav', value: 'C:\\Windows\\Media\\Windows Ding.wav' },
  ];

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: 4, minWidth: 28 }}
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            title="Test sound"
          >
            <Play size={12} />
          </button>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{sound.event}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{sound.description}</div>
          </div>
        </div>
      </td>
      <td>
        <Badge variant={categoryBadge[sound.category] || 'gray'}>{categoryLabels[sound.category]}</Badge>
      </td>
      <td>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-sm"
            style={{ fontSize: 11, fontFamily: 'var(--font-mono)', maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}
            onClick={(e) => { e.stopPropagation(); setFileMenu(!fileMenu); }}
          >
            {sound.file ? sound.file.split('\\').pop() : 'None'}
          </button>
          {fileMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 20,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: 6, minWidth: 200, padding: 4, boxShadow: 'var(--shadow-lg)',
            }}>
              {fileOptions.map((opt) => (
                <button
                  key={opt.label}
                  className="btn btn-ghost"
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 12 }}
                  onClick={(e) => { e.stopPropagation(); onFileChange(opt.value); setFileMenu(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td>
        <input
          type="range"
          min={0}
          max={100}
          value={sound.volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          style={{ width: 80, accentColor: 'var(--accent)' }}
          onClick={(e) => e.stopPropagation()}
        />
        <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--text-secondary)' }}>{sound.volume}%</span>
      </td>
      <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sound.duration}</td>
    </tr>
  );
}

export default function SoundView() {
  const currentScheme = useSoundStore((s) => s.currentScheme);
  const schemes = useSoundStore((s) => s.schemes);
  const devices = useSoundStore((s) => s.devices);
  const loading = useSoundStore((s) => s.loading);
  const fetchAll = useSoundStore((s) => s.fetchAll);
  const setScheme = useSoundStore((s) => s.setScheme);
  const setSoundEvent = useSoundStore((s) => s.setSoundEvent);
  const resetToDefaults = useSoundStore((s) => s.resetToDefaults);
  const testSound = useSoundStore((s) => s.testSound);

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showDevices, setShowDevices] = useState(true);
  const [masterVolume, setMasterVolume] = useState(80);
  const [selectedScheme, setSelectedScheme] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filteredSounds = useMemo(() => {
    if (!currentScheme) return [];
    let list = currentScheme.sounds;
    if (activeCategory !== 'All') list = list.filter((s) => s.category === activeCategory);
    if (search) list = list.filter((s) => s.event.toLowerCase().includes(search.toLowerCase()) || (s.file && s.file.toLowerCase().includes(search.toLowerCase())));
    return list;
  }, [currentScheme, activeCategory, search]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, SystemSound[]> = {};
    for (const s of filteredSounds) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filteredSounds]);

  const categories = useMemo(() => {
    if (!currentScheme) return [];
    const cats = new Set(currentScheme.sounds.map((s) => s.category));
    return Array.from(cats);
  }, [currentScheme]);

  const handlePlay = (sound: SystemSound) => {
    testSound(sound.event);
  };

  const handleApplyScheme = async (name: string) => {
    await setScheme(name);
  };

  const handleReset = async () => {
    await resetToDefaults();
  };

  if (loading && !currentScheme) {
    return (
      <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>System Sounds</h2>
        </div>
        <div className="empty-state"><div className="empty-state-title">Loading sound data...</div></div>
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>System Sounds</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchAll}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
        </div>
      </div>

      {/* Scheme Selector + Master Volume */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-3">
            <Volume2 size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sound Scheme</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {currentScheme?.name || 'Unknown'}
                {currentScheme?.isDefault && <Badge variant="blue">Default</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="input"
              style={{ width: 180 }}
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
            >
              <option value="">Select scheme...</option>
              {schemes.map((s) => (
                <option key={s.name} value={s.name}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>
              ))}
            </select>
            <button className="btn btn-sm" onClick={() => selectedScheme && handleApplyScheme(selectedScheme)}>Apply</button>
            <button className="btn btn-sm" onClick={handleReset}>Reset to Defaults</button>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 size={14} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              style={{ width: 100, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 35 }}>{masterVolume}%</span>
          </div>
        </div>
      </div>

      {/* Audio Devices (collapsible) */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDevices(!showDevices)}>
          <div className="flex items-center gap-2">
            {showDevices ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span style={{ fontSize: 14, fontWeight: 600 }}>Audio Devices</span>
            <Badge variant="gray">{devices.length}</Badge>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {devices.filter(d => d.status === 'active').length} active
          </div>
        </div>
        {showDevices && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 12 }}>
            {devices.map((dev) => {
              const Icon = deviceIcons[dev.type] || Speaker;
              return (
                <div key={dev.name} className="card" style={{
                  padding: 14,
                  opacity: dev.status === 'unplugged' ? 0.5 : 1,
                  borderLeft: dev.isDefault ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: dev.status === 'active' ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-flex' }}><Icon size={18} /></span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{dev.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{dev.manufacturer}</div>
                      </div>
                    </div>
                    {dev.isDefault && <Star size={14} style={{ color: 'var(--yellow)' }} fill="var(--yellow)" />}
                  </div>
                  <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                    <Badge variant={dev.status === 'active' ? 'green' : dev.status === 'disabled' ? 'red' : 'gray'}>
                      {dev.status}
                    </Badge>
                    <Badge variant="purple">{dev.type}</Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Volume</span>
                      <span style={{ fontWeight: 600 }}>{dev.volume}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Sample Rate</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{dev.sampleRate/1000} kHz / {dev.bitDepth}-bit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Channels</span>
                      <span>{dev.channels === 2 ? 'Stereo' : dev.channels === 1 ? 'Mono' : `${dev.channels}ch`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Driver</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>{dev.driver}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sound Events Table */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Sound Events</div>
          <div className="flex items-center gap-2">
            <input
              className="input"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200, fontSize: 12 }}
            />
          </div>
        </div>
        <div className="tabs mb-3">
          <button className={`tab ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')} style={{ fontSize: 11 }}>
            All ({currentScheme?.sounds.length || 0})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ fontSize: 11 }}
            >
              {categoryLabels[cat] || cat} ({currentScheme?.sounds.filter((s) => s.category === cat).length || 0})
            </button>
          ))}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Sound File</th>
                <th>Vol</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByCategory).map(([category, sounds]) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan={5} style={{
                      background: 'var(--bg-tertiary)',
                      padding: '6px 16px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {categoryLabels[category] || category}
                    </td>
                  </tr>
                  {sounds.map((sound) => (
                    <SoundRow
                      key={sound.event}
                      sound={sound}
                      onPlay={() => handlePlay(sound)}
                      onFileChange={(file) => setSoundEvent(sound.event, file)}
                      onVolumeChange={(vol) => {}}
                    />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

