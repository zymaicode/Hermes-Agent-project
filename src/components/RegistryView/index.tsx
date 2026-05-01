import { useEffect, useState } from 'react';
import {
  Search, Star, ChevronRight, ChevronDown, Folder, FolderOpen,
  FileText, ArrowLeft, ArrowUp, RefreshCw, Database,
} from 'lucide-react';
import { useRegistryStore } from '../../stores/registryStore';

const HIVE_COLORS: Record<string, string> = {
  HKEY_CLASSES_ROOT: 'var(--purple)',
  HKEY_CURRENT_USER: 'var(--blue)',
  HKEY_LOCAL_MACHINE: 'var(--red)',
  HKEY_USERS: 'var(--orange)',
  HKEY_CURRENT_CONFIG: 'var(--teal)',
};

function valueTypeBadge(type: string) {
  const colors: Record<string, string> = {
    REG_SZ: 'var(--blue)',
    REG_DWORD: 'var(--green)',
    REG_QWORD: 'var(--purple)',
    REG_BINARY: 'var(--orange)',
    REG_MULTI_SZ: 'var(--teal)',
    REG_EXPAND_SZ: 'var(--yellow)',
  };
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
      background: (colors[type] || 'var(--text-secondary)') + '22',
      color: colors[type] || 'var(--text-secondary)',
      fontFamily: 'monospace',
    }}>
      {type}
    </span>
  );
}

function formatValueData(type: string, data: string): string {
  switch (type) {
    case 'REG_DWORD':
      return `${data} (0x${Number(data).toString(16).padStart(8, '0').toUpperCase()})`;
    case 'REG_BINARY':
      return data.length > 40 ? data.slice(0, 40) + ' ...' : data;
    case 'REG_MULTI_SZ':
      return data;
    case 'REG_EXPAND_SZ':
      return data;
    default:
      return data || '(empty)';
  }
}

export default function RegistryView() {
  const roots = useRegistryStore((s) => s.roots);
  const currentKey = useRegistryStore((s) => s.currentKey);
  const subkeys = useRegistryStore((s) => s.subkeys);
  const parent = useRegistryStore((s) => s.parent);
  const currentPath = useRegistryStore((s) => s.currentPath);
  const searchQuery = useRegistryStore((s) => s.searchQuery);
  const searchResults = useRegistryStore((s) => s.searchResults);
  const favorites = useRegistryStore((s) => s.favorites);
  const loading = useRegistryStore((s) => s.loading);
  const fetchRoots = useRegistryStore((s) => s.fetchRoots);
  const navigateTo = useRegistryStore((s) => s.navigateTo);
  const search = useRegistryStore((s) => s.search);
  const fetchFavorites = useRegistryStore((s) => s.fetchFavorites);
  const setSearchQuery = useRegistryStore((s) => s.setSearchQuery);

  const [expandedHives, setExpandedHives] = useState<Record<string, boolean>>({});
  const [expandedSubkeys, setExpandedSubkeys] = useState<Record<string, boolean>>({});
  const [addressInput, setAddressInput] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [valueModal, setValueModal] = useState<{ name: string; type: string; data: string } | null>(null);

  useEffect(() => { fetchRoots(); fetchFavorites(); }, [fetchRoots, fetchFavorites]);

  const toggleHive = (hive: string) => {
    setExpandedHives((p) => ({ ...p, [hive]: !p[hive] }));
  };

  const toggleSubkey = (path: string) => {
    setExpandedSubkeys((p) => ({ ...p, [path]: !p[path] }));
  };

  const handleNavigate = (path: string) => {
    setAddressInput(path);
    navigateTo(path);
  };

  const handleGo = () => {
    if (addressInput.trim()) {
      navigateTo(addressInput.trim());
    }
  };

  const pathSegments = currentPath ? currentPath.replace(/^HKLM\\/i, 'HKEY_LOCAL_MACHINE\\').replace(/^HKCU\\/i, 'HKEY_CURRENT_USER\\').split('\\') : [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Registry Viewer</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted text-mono">Read-only — simulated data</span>
          <button
            className="btn"
            style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={() => { fetchRoots(); navigateTo(''); }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 mb-3">
        <input
          className="input"
          style={{ flex: 1, fontSize: 12, fontFamily: 'monospace' }}
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          placeholder="Type a registry path (e.g., HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion)"
        />
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleGo}>Go</button>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: 'flex', gap: 1, overflow: 'hidden' }}>
        {/* Left tree */}
        <div className="card" style={{ width: 280, minWidth: 240, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column' }}>
          {/* Tree search */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: 8, color: 'var(--text-secondary)' }} />
            <input
              className="input"
              style={{ paddingLeft: 28, fontSize: 11, fontFamily: 'monospace' }}
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); search(e.target.value); }}
            />
          </div>

          {/* Favorites button */}
          {favorites.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <button
                className="btn"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: 11, gap: 6 }}
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Star size={14} style={{ color: 'var(--yellow)' }} />
                Favorites ({favorites.length})
                <ChevronRight size={12} style={{ marginLeft: 'auto', transform: showFavorites ? 'rotate(90deg)' : undefined }} />
              </button>
              {showFavorites && (
                <div style={{ marginTop: 2 }}>
                  {favorites.map((fav) => (
                    <button
                      key={fav}
                      className="btn"
                      style={{
                        width: '100%', justifyContent: 'flex-start', padding: '4px 8px 4px 24px', fontSize: 10,
                        background: currentPath === fav ? 'var(--accent-muted)' : 'transparent',
                        color: currentPath === fav ? 'var(--accent)' : 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                      onClick={() => handleNavigate(fav)}
                    >
                      <Star size={10} style={{ marginRight: 4, flexShrink: 0 }} />
                      {fav}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && searchQuery.trim() ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, padding: '0 4px' }}>
                {searchResults.length} results
              </div>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  className="btn"
                  style={{
                    width: '100%', justifyContent: 'flex-start', padding: '3px 6px', fontSize: 10,
                    fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: 'var(--text-secondary)',
                  }}
                  onClick={() => handleNavigate(r.key)}
                >
                  <Search size={10} style={{ marginRight: 4 }} />
                  {r.key}
                  {r.value && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>({r.value})</span>}
                </button>
              ))}
            </div>
          ) : (
            /* Root hives tree */
            <div style={{ flex: 1, overflow: 'auto' }}>
              {roots.map((root) => {
                const isExpanded = expandedHives[root.hive];
                const isActive = currentPath === root.path;
                return (
                  <div key={root.path}>
                    <button
                      className="btn"
                      style={{
                        width: '100%', justifyContent: 'flex-start', padding: '5px 6px', fontSize: 11,
                        fontWeight: 600, gap: 4,
                        background: isActive ? 'var(--accent-muted)' : 'transparent',
                        color: HIVE_COLORS[root.hive] || 'var(--text-primary)',
                      }}
                      onClick={() => { toggleHive(root.hive); if (!isExpanded) handleNavigate(root.path); }}
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {isExpanded ? <FolderOpen size={13} /> : <Folder size={13} />}
                      {root.name}
                    </button>
                    {isExpanded && (
                      <div style={{ paddingLeft: 12 }}>
                        {root.subkeys > 0 && subkeys.length > 0 && currentPath?.startsWith(root.path) ? (
                          subkeys.map((sk) => {
                            const fullPath = `${root.path}\\${sk}`;
                            const isSubExpanded = expandedSubkeys[fullPath];
                            const isSubActive = currentPath === fullPath;
                            return (
                              <div key={fullPath}>
                                <button
                                  className="btn"
                                  style={{
                                    width: '100%', justifyContent: 'flex-start', padding: '3px 6px', fontSize: 11,
                                    fontFamily: 'monospace', gap: 4,
                                    background: isSubActive ? 'var(--accent-muted)' : 'transparent',
                                    color: isSubActive ? 'var(--accent)' : 'var(--text-secondary)',
                                  }}
                                  onClick={() => { toggleSubkey(fullPath); handleNavigate(fullPath); }}
                                >
                                  {isSubExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                  {isSubExpanded ? <FolderOpen size={12} /> : <Folder size={12} />}
                                  {sk}
                                </button>
                              </div>
                            );
                          })
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="card" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {!currentKey ? (
            <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-secondary)' }}>
              <Database size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Select a registry key from the tree</p>
              <p style={{ fontSize: 11 }}>Use the navigation tree, search, or type a path in the address bar</p>
            </div>
          ) : (
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 mb-3" style={{ flexWrap: 'wrap', fontSize: 11 }}>
                {pathSegments.map((seg, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span style={{ color: 'var(--text-secondary)' }}>&gt;</span>}
                    <button
                      className="btn"
                      style={{
                        padding: '2px 6px', fontSize: 11, fontFamily: 'monospace',
                        color: i === pathSegments.length - 1 ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                      onClick={() => {
                        const target = pathSegments.slice(0, i + 1).join('\\');
                        handleNavigate(target);
                      }}
                    >
                      {seg}
                    </button>
                  </span>
                ))}
              </div>

              {/* Key info */}
              <div className="flex items-center gap-4 mb-3" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Folder size={12} />
                  {currentKey.subkeys} subkeys
                </span>
                <span>Modified: {new Date(currentKey.lastModified).toLocaleString()}</span>
                <span style={{
                  color: HIVE_COLORS[currentKey.hive] || 'var(--text-primary)',
                  fontWeight: 600,
                }}>
                  {currentKey.hive}
                </span>
                {parent && (
                  <button className="btn" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => handleNavigate(parent)}>
                    <ArrowUp size={12} /> Up
                  </button>
                )}
              </div>

              {/* Values table */}
              <div style={{ fontSize: 12 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 1fr',
                  padding: '6px 8px', borderBottom: '1px solid var(--border-color)',
                  fontWeight: 600, fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
                }}>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Data</span>
                </div>
                {currentKey.values.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 1fr',
                      padding: '6px 8px', borderBottom: '1px solid var(--border-color)',
                      cursor: v.data.length > 60 ? 'pointer' : 'default',
                    }}
                    onDoubleClick={() => {
                      if (v.type === 'REG_BINARY' || v.data.length > 60) {
                        setValueModal(v);
                      }
                    }}
                  >
                    <span className="text-mono" style={{ color: v.name === '(Default)' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {v.name || '(Default)'}
                    </span>
                    <span>{valueTypeBadge(v.type)}</span>
                    <span className="text-mono" style={{ color: v.type === 'REG_DWORD' ? 'var(--green)' : 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {formatValueData(v.type, v.data)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Value detail modal */}
      {valueModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}
          onClick={() => setValueModal(null)}
        >
          <div
            className="card"
            style={{ padding: 20, minWidth: 400, maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Value Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
              <span className="text-mono">{valueModal.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
              <span>{valueTypeBadge(valueModal.type)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Data:</span>
              <span className="text-mono" style={{
                background: 'var(--bg-hover)', padding: '8px', borderRadius: 4,
                maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {valueModal.data}
              </span>
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn" style={{ padding: '6px 16px' }} onClick={() => setValueModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
