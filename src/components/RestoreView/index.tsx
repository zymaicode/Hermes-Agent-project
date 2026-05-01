import { useEffect, useState } from 'react';
import {
  RotateCcw, Shield, ShieldOff, Trash2, Plus, Search,
  RefreshCw, Calendar, HardDrive, AlertTriangle, Check, X,
  Activity, Clock,
} from 'lucide-react';
import { useRestoreStore } from '../../stores/restoreStore';
import type { RestorePoint } from '../../../electron/restore/manager';

const TYPE_BADGE: Record<RestorePoint['type'], { label: string; bg: string; color: string }> = {
  system: { label: 'System', bg: 'var(--accent-muted)', color: 'var(--accent)' },
  manual: { label: 'Manual', bg: '#3fb95022', color: 'var(--green)' },
  install: { label: 'Install', bg: '#a371f722', color: 'var(--purple)' },
  update: { label: 'Update', bg: 'var(--yellow)22', color: 'var(--yellow)' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSize(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${mb} MB`;
}

export default function RestoreView() {
  const points = useRestoreStore((s) => s.points);
  const settings = useRestoreStore((s) => s.settings);
  const loading = useRestoreStore((s) => s.loading);
  const fetchPoints = useRestoreStore((s) => s.fetchPoints);
  const fetchSettings = useRestoreStore((s) => s.fetchSettings);
  const createRestorePoint = useRestoreStore((s) => s.createRestorePoint);
  const restoreToPoint = useRestoreStore((s) => s.restoreToPoint);
  const deleteRestorePoint = useRestoreStore((s) => s.deleteRestorePoint);
  const toggleProtection = useRestoreStore((s) => s.toggleProtection);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created' | 'sizeMB'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [restoreConfirm, setRestoreConfirm] = useState<number | null>(null);
  const [restoreInput, setRestoreInput] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchPoints(); fetchSettings(); }, [fetchPoints, fetchSettings]);

  const filtered = points
    .filter((p) => !search || p.description.toLowerCase().includes(search.toLowerCase())
      || p.eventType.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'created') return (new Date(a.created).getTime() - new Date(b.created).getTime()) * dir;
    return (a.sizeMB - b.sizeMB) * dir;
  });

  const totalUsed = points.filter((p) => p.status === 'available').reduce((s, p) => s + p.sizeMB, 0);
  const availableCount = points.filter((p) => p.status === 'available').length;

  const handleCreatePoint = async () => {
    if (!createDesc.trim()) return;
    setCreating(true);
    const result = await createRestorePoint(createDesc.trim());
    if (result.success) {
      fetchPoints();
      fetchSettings();
      setCreateModal(false);
      setCreateDesc('');
    }
    setCreating(false);
  };

  const handleRestore = async (id: number) => {
    const result = await restoreToPoint(id);
    if (result.success) {
      fetchPoints();
      fetchSettings();
      setRestoreConfirm(null);
      setRestoreInput('');
    }
  };

  const handleDelete = async (id: number) => {
    await deleteRestorePoint(id);
    fetchPoints();
    fetchSettings();
  };

  const handleToggle = async () => {
    const result = await toggleProtection(!settings?.enabled);
    if (result.success) fetchSettings();
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>System Restore</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { fetchPoints(); fetchSettings(); }}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }} onClick={() => setCreateModal(true)}>
            <Plus size={14} style={{ marginRight: 4 }} />Create Restore Point
          </button>
        </div>
      </div>

      {/* Protection Status Card */}
      {settings && (
        <div className="card" style={{
          padding: 20, marginBottom: 16,
          borderColor: settings.enabled ? 'var(--green)44' : 'var(--red)44',
          background: settings.enabled ? 'linear-gradient(135deg, #3fb95010, #3fb95005)' : 'linear-gradient(135deg, #f8514910, #f8514905)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {settings.enabled ? <Shield size={28} style={{ color: 'var(--green)' }} /> : <ShieldOff size={28} style={{ color: 'var(--red)' }} />}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                  Protection is <span style={{ color: settings.enabled ? 'var(--green)' : 'var(--red)' }}>{settings.enabled ? 'ON' : 'OFF'}</span>
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  System restore is {settings.enabled ? 'actively monitoring' : 'not protecting'} your system
                </div>
              </div>
            </div>
            <button
              className="btn"
              style={{
                padding: '8px 20px', fontSize: 13, fontWeight: 600,
                background: settings.enabled ? 'var(--red)' : 'var(--green)',
                color: '#fff', border: 'none',
              }}
              onClick={handleToggle}
            >
              {settings.enabled ? 'Turn Off' : 'Turn On'}
            </button>
          </div>

          <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HardDrive size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Disk Usage</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{formatSize(settings.diskSpaceUsed)} used</div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-hover)', marginTop: 4, width: 120 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (settings.diskSpaceUsed / 10000) * 100)}%`, background: 'var(--accent)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>{settings.maxUsage}% of disk allocated</div>
              </div>
            </div>

            <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} style={{ color: 'var(--green)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Last Restore</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{settings.lastRestore ? formatDate(settings.lastRestore) : 'Never'}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={18} style={{ color: 'var(--yellow)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Next Scheduled</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{settings.nextScheduled ? formatDate(settings.nextScheduled) : 'Not scheduled'}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={18} style={{ color: 'var(--purple)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Restore Points</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{availableCount} available</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & sort */}
      <div className="flex items-center gap-2 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 28, fontSize: 12, width: '100%' }}
            placeholder="Search restore points..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input" style={{ fontSize: 11, padding: '4px 8px', width: 100 }} value={sortField} onChange={(e) => setSortField(e.target.value as 'created' | 'sizeMB')}>
          <option value="created">Date</option>
          <option value="sizeMB">Size</option>
        </select>
        <button className="btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Restore points table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '180px 1fr 120px 100px 110px 120px',
          padding: '8px 14px', borderBottom: '1px solid var(--border-color)',
          fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
        }}>
          <span style={{ cursor: 'pointer' }} onClick={() => { setSortField('created'); setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }}>
            Date/Time {sortField === 'created' && (sortDir === 'asc' ? '▲' : '▼')}
          </span>
          <span>Description</span>
          <span>Type</span>
          <span style={{ cursor: 'pointer' }} onClick={() => { setSortField('sizeMB'); setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }}>
            Size {sortField === 'sizeMB' && (sortDir === 'asc' ? '▲' : '▼')}
          </span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            {search ? 'No restore points match your search.' : 'No restore points created yet.'}
          </div>
        ) : (
          sorted.map((p) => {
            const tBadge = TYPE_BADGE[p.type];
            const isDeleted = p.status === 'deleted';
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '180px 1fr 120px 100px 110px 120px',
                padding: '7px 14px', borderBottom: '1px solid var(--border-color)',
                fontSize: 11, alignItems: 'center',
                opacity: isDeleted ? 0.4 : 1,
              }}>
                <span className="text-mono" style={{ fontSize: 10 }}>
                  {formatDate(p.created)}
                  {p.isAutomatic && <span style={{ fontSize: 9, color: 'var(--text-secondary)', marginLeft: 4 }}>(auto)</span>}
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</span>
                <span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: tBadge.bg, color: tBadge.color,
                  }}>
                    {tBadge.label}
                  </span>
                </span>
                <span className="text-mono" style={{ fontSize: 10 }}>{formatSize(p.sizeMB)}</span>
                <span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: isDeleted ? 'var(--red)22' : 'var(--green)22',
                    color: isDeleted ? 'var(--red)' : 'var(--green)',
                  }}>
                    {isDeleted ? 'Deleted' : 'Available'}
                  </span>
                </span>
                <span>
                  {!isDeleted && (
                    <div className="flex items-center gap-1">
                      <button className="btn" style={{ padding: '3px 8px', fontSize: 10 }} onClick={() => setRestoreConfirm(p.id)}>
                        <RotateCcw size={12} style={{ marginRight: 2 }} />Restore
                      </button>
                      <button className="btn" style={{ padding: '3px 8px', fontSize: 10, color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {restoreConfirm !== null && (() => {
        const point = points.find((p) => p.id === restoreConfirm);
        if (!point) return null;
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }} onClick={() => { setRestoreConfirm(null); setRestoreInput(''); }}>
            <div className="card" style={{ padding: 24, width: 480, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={24} style={{ color: 'var(--yellow)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Confirm System Restore</h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Are you sure you want to restore your system to this point?
              </p>
              <div className="card" style={{ padding: 12, marginBottom: 12, background: 'var(--bg-hover)' }}>
                <div><strong>{point.description}</strong></div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Created: {formatDate(point.created)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Type: {point.eventType} · Size: {formatSize(point.sizeMB)}</div>
              </div>
              <div style={{
                padding: 12, marginBottom: 12, borderRadius: 6,
                background: 'var(--red)15', border: '1px solid var(--red)33',
                fontSize: 11, color: 'var(--red)',
              }}>
                <strong>Warning:</strong> Your system will restart. This action cannot be undone. Make sure all work is saved.
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, marginBottom: 4 }}>Type <strong>RESTORE</strong> to confirm:</div>
                <input
                  className="input"
                  style={{ width: '100%', fontSize: 12 }}
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  placeholder="RESTORE"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button className="btn" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => { setRestoreConfirm(null); setRestoreInput(''); }}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: 12, background: 'var(--red)', borderColor: 'var(--red)' }}
                  disabled={restoreInput !== 'RESTORE'}
                  onClick={() => handleRestore(point.id)}
                >
                  <RotateCcw size={14} style={{ marginRight: 4 }} />Restore Now
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Restore Point Modal */}
      {createModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setCreateModal(false)}>
          <div className="card" style={{ padding: 24, width: 420, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create Restore Point</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Description</div>
              <input
                className="input"
                style={{ width: '100%', fontSize: 12 }}
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="e.g., Before installing new drivers"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button className="btn" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => setCreateModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: 12 }}
                disabled={!createDesc.trim() || creating}
                onClick={handleCreatePoint}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
