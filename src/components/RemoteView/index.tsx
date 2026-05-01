import { useEffect, useState } from 'react';
import {
  Monitor, Terminal, Globe, Star, Wifi, Plus, X, Search,
  RefreshCw, MoreVertical, Settings, Link, Activity, Clock,
  HardDrive, Clipboard, Volume2, Shield, Tag, FileDown, FileUp,
  ChevronRight, Play, Pencil, Trash2,
} from 'lucide-react';
import { useRemoteStore } from '../../stores/remoteStore';
import type { RemoteConnection } from '../../../electron/remote/manager';

const PROTOCOL_INFO: Record<string, { icon: typeof Monitor; color: string; label: string; port: number }> = {
  RDP: { icon: Monitor, color: 'var(--accent)', label: 'RDP', port: 3389 },
  SSH: { icon: Terminal, color: 'var(--green)', label: 'SSH', port: 22 },
  VNC: { icon: Globe, color: 'var(--purple)', label: 'VNC', port: 5900 },
  TeamViewer: { icon: Wifi, color: 'var(--orange)', label: 'TeamViewer', port: 0 },
  AnyDesk: { icon: Wifi, color: 'var(--blue)', label: 'AnyDesk', port: 0 },
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const GROUPS = ['All', 'Work', 'Home', 'Servers', 'Clients', 'Cloud'];

export default function RemoteView() {
  const connections = useRemoteStore((s) => s.connections);
  const loading = useRemoteStore((s) => s.loading);
  const searchQuery = useRemoteStore((s) => s.searchQuery);
  const fetchConnections = useRemoteStore((s) => s.fetchConnections);
  const setSearchQuery = useRemoteStore((s) => s.setSearchQuery);
  const connect = useRemoteStore((s) => s.connect);
  const testConnection = useRemoteStore((s) => s.testConnection);
  const addConnection = useRemoteStore((s) => s.addConnection);
  const updateConnection = useRemoteStore((s) => s.updateConnection);
  const deleteConnection = useRemoteStore((s) => s.deleteConnection);
  const toggleFavorite = useRemoteStore((s) => s.toggleFavorite);

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [latencyResults, setLatencyResults] = useState<Record<string, number | null>>({});
  const [form, setForm] = useState<Omit<RemoteConnection, 'id' | 'lastConnected' | 'connectionCount'>>({
    name: '', host: '', port: 3389, protocol: 'RDP', username: '',
    authenticationType: 'password', resolution: '1920x1080', colorDepth: 32,
    useGateway: false, gatewayHost: '', favorite: false, group: 'Work',
    notes: '', tags: [], status: 'unknown',
    localDrives: false, clipboardSharing: false, audioRedirection: 'none',
  });

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const filtered = connections
    .filter((c) => selectedGroup === 'All' || c.group === selectedGroup)
    .filter((c) => !searchQuery
      || c.name.toLowerCase().includes(searchQuery.toLowerCase())
      || c.host.toLowerCase().includes(searchQuery.toLowerCase())
      || c.username.toLowerCase().includes(searchQuery.toLowerCase())
      || c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

  const groupCounts: Record<string, number> = {};
  for (const g of GROUPS) {
    groupCounts[g] = g === 'All' ? connections.length : connections.filter((c) => c.group === g).length;
  }

  const handleConnect = async (id: string) => {
    const result = await connect(id);
    if (result.success) fetchConnections();
  };

  const handleTest = async (id: string) => {
    const result = await testConnection(id);
    setLatencyResults((p) => ({ ...p, [id]: result.success ? result.latency : null }));
    if (result.success) fetchConnections();
  };

  const handleSave = async () => {
    if (!form.name || !form.host) return;
    if (editingId) {
      await updateConnection(editingId, form);
    } else {
      await addConnection(form);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({
      name: '', host: '', port: 3389, protocol: 'RDP', username: '',
      authenticationType: 'password', resolution: '1920x1080', colorDepth: 32,
      useGateway: false, gatewayHost: '', favorite: false, group: 'Work',
      notes: '', tags: [], status: 'unknown',
      localDrives: false, clipboardSharing: false, audioRedirection: 'none',
    });
  };

  const handleEdit = (conn: RemoteConnection) => {
    setEditingId(conn.id);
    setForm({
      name: conn.name, host: conn.host, port: conn.port, protocol: conn.protocol,
      username: conn.username, authenticationType: conn.authenticationType,
      resolution: conn.resolution, colorDepth: conn.colorDepth,
      useGateway: conn.useGateway, gatewayHost: conn.gatewayHost || '',
      favorite: conn.favorite, group: conn.group, notes: conn.notes,
      tags: conn.tags, status: conn.status,
      localDrives: conn.localDrives, clipboardSharing: conn.clipboardSharing,
      audioRedirection: conn.audioRedirection,
    });
    setShowModal(true);
  };

  const expanded = connections.find((c) => c.id === expandedId);

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Remote Desktop Manager</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchConnections}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }}>
            <FileDown size={14} style={{ marginRight: 4 }} />Export
          </button>
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }}>
            <FileUp size={14} style={{ marginRight: 4 }} />Import
          </button>
          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }} onClick={() => { setEditingId(null); setShowModal(true); }}>
            <Plus size={14} style={{ marginRight: 4 }} />New Connection
          </button>
        </div>
      </div>

      {/* Search + group tabs */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--text-secondary)' }} />
          <input className="input" style={{ paddingLeft: 28, fontSize: 12, width: '100%' }} placeholder="Search connections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
        {GROUPS.map((g) => (
          <button
            key={g}
            className="btn"
            style={{
              padding: '4px 12px', fontSize: 11, fontWeight: selectedGroup === g ? 600 : 400,
              background: selectedGroup === g ? 'var(--accent)' : 'var(--bg-hover)',
              color: selectedGroup === g ? '#fff' : 'var(--text-secondary)',
              border: selectedGroup === g ? 'none' : '1px solid var(--border-color)',
            }}
            onClick={() => setSelectedGroup(g)}
          >
            {g}
            {groupCounts[g] > 0 && (
              <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, opacity: 0.8 }}>{groupCounts[g]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Connection cards grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            {loading ? 'Loading...' : 'No remote connections yet. Create your first connection.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
            {filtered.map((conn) => {
              const proto = PROTOCOL_INFO[conn.protocol] || PROTOCOL_INFO.RDP;
              const ProtoIcon = proto.icon;
              const isExpanded = expandedId === conn.id;
              return (
                <div
                  key={conn.id}
                  className="card"
                  style={{
                    padding: 16, cursor: 'pointer',
                    borderColor: isExpanded ? proto.color + '66' : undefined,
                    borderWidth: isExpanded ? 2 : 1,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : conn.id)}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: proto.color + '22', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: proto.color, flexShrink: 0,
                    }}>
                      <ProtoIcon size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conn.name}</span>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: conn.status === 'online' ? 'var(--green)' : conn.status === 'offline' ? 'var(--red)' : 'var(--yellow)',
                          flexShrink: 0,
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {conn.host}{conn.port ? `:${conn.port}` : ''} · {conn.username}
                      </div>
                    </div>
                    <button
                      className="btn"
                      style={{ padding: '2px', background: 'transparent', border: 'none' }}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(conn.id); }}
                    >
                      <Star size={16} style={{ color: conn.favorite ? 'var(--yellow)' : 'var(--text-secondary)', fill: conn.favorite ? 'var(--yellow)' : 'none' }} />
                    </button>
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                      background: proto.color + '22', color: proto.color,
                    }}>
                      {proto.label}
                    </span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                      {conn.group}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                      <Clock size={10} style={{ marginRight: 2 }} />{timeAgo(conn.lastConnected)}
                    </span>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); handleConnect(conn.id); }}
                    >
                      <Link size={12} style={{ marginRight: 4 }} />Connect
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={(e) => { e.stopPropagation(); handleTest(conn.id); }}
                    >
                      <Activity size={12} style={{ marginRight: 4 }} />Test
                    </button>
                    {latencyResults[conn.id] !== undefined && (
                      <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>
                        {latencyResults[conn.id]}ms
                      </span>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                      <button className="btn" style={{ padding: '4px 6px' }} onClick={(e) => { e.stopPropagation(); handleEdit(conn); }}>
                        <Pencil size={12} />
                      </button>
                      <button className="btn" style={{ padding: '4px 6px', color: 'var(--red)' }} onClick={(e) => { e.stopPropagation(); deleteConnection(conn.id); }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-hover)', borderRadius: 6, fontSize: 11 }}>
                      <div className="flex items-center gap-3 mb-2" style={{ flexWrap: 'wrap' }}>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Res:</span> {conn.resolution || 'N/A'}</span>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Color:</span> {conn.colorDepth}-bit</span>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Auth:</span> {conn.authenticationType}</span>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Connected:</span> {conn.connectionCount}x</span>
                      </div>
                      {conn.useGateway && (
                        <div style={{ marginBottom: 4 }}>
                          <Shield size={12} style={{ marginRight: 4 }} />
                          Gateway: {conn.gatewayHost}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                        {conn.localDrives && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-muted)', color: 'var(--accent)' }}><HardDrive size={10} style={{ marginRight: 2 }} />Drives</span>}
                        {conn.clipboardSharing && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-muted)', color: 'var(--accent)' }}><Clipboard size={10} style={{ marginRight: 2 }} />Clipboard</span>}
                        {conn.audioRedirection !== 'none' && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-muted)', color: 'var(--accent)' }}><Volume2 size={10} style={{ marginRight: 2 }} />Audio: {conn.audioRedirection}</span>}
                      </div>
                      {conn.notes && (
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>{conn.notes}</div>
                      )}
                      {conn.tags.length > 0 && (
                        <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                          {conn.tags.map((t) => (
                            <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                              <Tag size={9} style={{ marginRight: 2 }} />{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ padding: 24, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {editingId ? 'Edit Connection' : 'New Remote Connection'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Name *</div>
                <input className="input" style={{ width: '100%', fontSize: 11 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Work PC" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Group</div>
                <select className="input" style={{ width: '100%', fontSize: 11 }} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                  {['Work', 'Home', 'Servers', 'Clients', 'Cloud'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Host / IP *</div>
                <input className="input" style={{ width: '100%', fontSize: 11, fontFamily: 'monospace' }} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="192.168.1.100" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Port</div>
                <input className="input" type="number" style={{ width: '100%', fontSize: 11 }} value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Protocol</div>
                <select className="input" style={{ width: '100%', fontSize: 11 }} value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value as RemoteConnection['protocol'], port: PROTOCOL_INFO[e.target.value]?.port ?? form.port })}>
                  {Object.keys(PROTOCOL_INFO).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Username</div>
                <input className="input" style={{ width: '100%', fontSize: 11 }} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="admin" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Authentication</div>
                <select className="input" style={{ width: '100%', fontSize: 11 }} value={form.authenticationType} onChange={(e) => setForm({ ...form, authenticationType: e.target.value as RemoteConnection['authenticationType'] })}>
                  <option value="password">Password</option>
                  <option value="key">SSH Key</option>
                  <option value="smartcard">Smart Card</option>
                  <option value="network_level">Network Level Auth</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Resolution</div>
                <select className="input" style={{ width: '100%', fontSize: 11 }} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                  <option value="">N/A</option>
                  <option value="1280x720">1280x720</option>
                  <option value="1920x1080">1920x1080</option>
                  <option value="2560x1440">2560x1440</option>
                  <option value="3840x2160">3840x2160</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Features</div>
              <div className="flex items-center gap-3">
                <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.localDrives} onChange={(e) => setForm({ ...form, localDrives: e.target.checked })} />Local Drives
                </label>
                <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.clipboardSharing} onChange={(e) => setForm({ ...form, clipboardSharing: e.target.checked })} />Clipboard
                </label>
                <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.favorite} onChange={(e) => setForm({ ...form, favorite: e.target.checked })} />Favorite
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Audio Redirection</div>
              <select className="input" style={{ width: '100%', fontSize: 11 }} value={form.audioRedirection} onChange={(e) => setForm({ ...form, audioRedirection: e.target.value as RemoteConnection['audioRedirection'] })}>
                <option value="none">None</option>
                <option value="local">Play on this computer</option>
                <option value="remote">Play on remote computer</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Tags (comma-separated)</div>
              <input className="input" style={{ width: '100%', fontSize: 11 }} value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="office, primary" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Notes</div>
              <textarea className="input" style={{ width: '100%', fontSize: 11, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Connection notes..." />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button className="btn" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 12 }} disabled={!form.name || !form.host} onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Add Connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
