import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  ChevronRight,
  HardDrive,
  Calendar,
  User,
  FolderOpen,
  Box,
} from 'lucide-react';
import { useAppManagerStore } from '../../stores/appManagerStore';
import type { AppEntry } from '../../utils/types';

type SortKey = keyof Pick<AppEntry, 'name' | 'version' | 'publisher' | 'size'>;
type SortDir = 'asc' | 'desc';

const CATEGORIES = ['All', 'System', 'Development', 'Media', 'Browsers', 'Games', 'Other'];

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

export default function AppManagerView() {
  const {
    apps,
    loading,
    selectedApps,
    expandedApp,
    uninstalling,
    batchUninstalling,
    fetchApps,
    toggleSelect,
    selectAll,
    deselectAll,
    toggleExpand,
    uninstallSingle,
    uninstallSelected: batchUninstall,
  } = useAppManagerStore();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  function showNotification(type: 'success' | 'error', text: string) {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleUninstallSingle(name: string) {
    setConfirmTarget(null);
    const result = await uninstallSingle(name);
    if (result.success > 0) {
      showNotification('success', `"${name}" uninstalled successfully.`);
    } else {
      showNotification('error', result.errors[0] || `Failed to uninstall "${name}".`);
    }
  }

  async function handleBatchUninstall() {
    setConfirmBatch(false);
    const result = await batchUninstall();
    if (result.failed === 0) {
      showNotification('success', `${result.success} app(s) uninstalled successfully.`);
    } else {
      showNotification(
        'error',
        `${result.success} uninstalled, ${result.failed} failed.`
      );
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filteredApps = useMemo(() => {
    let list = apps;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.publisher.toLowerCase().includes(q) ||
          (a.category && a.category.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== 'All') {
      list = list.filter((a) => (a.category || 'Other') === categoryFilter);
    }
    return list;
  }, [apps, search, categoryFilter]);

  const sortedApps = useMemo(() => {
    const sorted = [...filteredApps];
    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [filteredApps, sortKey, sortDir]);

  const allSelected =
    filteredApps.length > 0 && filteredApps.every((a) => selectedApps.has(a.name));
  const selectedCount = selectedApps.size;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  }

  const [detailCache, setDetailCache] = useState<Record<string, { description: string; dependencies: string[] }>>({});

  async function handleExpand(name: string) {
    toggleExpand(name);
    if (!detailCache[name]) {
      try {
        const details = await window.pchelper.getAppDetails(name);
        setDetailCache((prev) => ({ ...prev, [name]: { description: details.description || '', dependencies: details.dependencies || [] } }));
      } catch {
        setDetailCache((prev) => ({ ...prev, [name]: { description: 'Details unavailable.', dependencies: [] } }));
      }
    }
  }

  return (
    <div className="flex-col" style={{ height: '100%', position: 'relative' }}>
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 50,
            padding: '10px 18px',
            borderRadius: 'var(--radius)',
            background: notification.type === 'success' ? 'var(--green)' : 'var(--red)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {notification.text}
        </div>
      )}

      {/* Title Bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>App Manager</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{apps.length} applications</span>
          {selectedCount > 0 && (
            <span style={{ fontSize: 12, color: 'var(--accent)' }}>
              {selectedCount} selected
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input"
            placeholder="Search apps or publishers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Select all / deselect */}
        <button className="btn btn-sm" onClick={allSelected ? deselectAll : selectAll}>
          {allSelected ? (
            <Square size={14} />
          ) : (
            <CheckSquare size={14} />
          )}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>

        {/* Batch uninstall */}
        {selectedCount > 0 && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setConfirmBatch(true)}
            disabled={batchUninstalling}
            style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
          >
            {batchUninstalling ? (
              'Uninstalling...'
            ) : (
              <>
                <Trash2 size={14} />
                Uninstall Selected ({selectedCount})
              </>
            )}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40, cursor: 'default' }}></th>
              <th onClick={() => handleSort('name')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Name <SortIcon col="name" />
                </span>
              </th>
              <th onClick={() => handleSort('version')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Version <SortIcon col="version" />
                </span>
              </th>
              <th onClick={() => handleSort('publisher')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Publisher <SortIcon col="publisher" />
                </span>
              </th>
              <th onClick={() => handleSort('size')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  Size <SortIcon col="size" />
                </span>
              </th>
              <th style={{ width: 120, textAlign: 'right', cursor: 'default' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  Loading applications...
                </td>
              </tr>
            ) : sortedApps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  {search || categoryFilter !== 'All'
                    ? 'No applications match your filters.'
                    : 'No applications found.'}
                </td>
              </tr>
            ) : (
              sortedApps.map((app) => {
                const isSelected = selectedApps.has(app.name);
                const isExpanded = expandedApp === app.name;
                const isUninstalling = uninstalling === app.name;
                const details = detailCache[app.name];

                return (
                  <>
                    <tr
                      key={app.name}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSelect(app.name)}
                    >
                      <td style={{ width: 40 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {isSelected ? (
                            <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                          ) : (
                            <Square size={16} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpand(app.name);
                          }}
                          className="btn-ghost"
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <ChevronRight
                            size={14}
                            style={{
                              transition: 'transform 0.15s',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              color: 'var(--text-secondary)',
                            }}
                          />
                          <span className="text-mono">{app.name}</span>
                          {app.category && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                borderRadius: 3,
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-muted)',
                                marginLeft: 6,
                              }}
                            >
                              {app.category}
                            </span>
                          )}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {app.version}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {app.publisher}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>
                        {formatSize(app.size)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmTarget(app.name);
                          }}
                          disabled={isUninstalling}
                          style={{
                            color: isUninstalling ? 'var(--text-muted)' : 'var(--red)',
                            borderColor: isUninstalling ? 'var(--border-color)' : 'var(--red)',
                            opacity: isUninstalling ? 0.5 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                          {isUninstalling ? 'Removing...' : 'Uninstall'}
                        </button>
                      </td>
                    </tr>
                    {/* Expand detail row */}
                    {isExpanded && (
                      <tr key={`${app.name}-detail`}>
                        <td colSpan={6} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {details ? (
                              <>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                  {details.description}
                                </div>
                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 12 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                    <FolderOpen size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Path:</span>
                                    <span className="text-mono" style={{ color: 'var(--text-secondary)' }}>{app.installPath}</span>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                    <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Installed:</span>
                                    {app.installDate}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                    <HardDrive size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                                    {formatSize(app.size)}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                    <User size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Publisher:</span>
                                    {app.publisher}
                                  </span>
                                </div>
                                {details.dependencies && details.dependencies.length > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                    <Box size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Dependencies:</span>
                                    {details.dependencies.map((dep, i) => (
                                      <span
                                        key={dep}
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: 3,
                                          background: 'var(--bg-tertiary)',
                                          color: 'var(--text-secondary)',
                                          fontSize: 11,
                                        }}
                                      >
                                        {dep}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading details...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog — Single */}
      {confirmTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setConfirmTarget(null)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: 24,
              maxWidth: 420,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertTriangle size={22} style={{ color: 'var(--yellow)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Confirm Uninstall</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Are you sure you want to uninstall <strong style={{ color: 'var(--text-primary)' }}>{confirmTarget}</strong>?
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              This will remove the application and its associated files. Some residual files may remain.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setConfirmTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => handleUninstallSingle(confirmTarget)}
              >
                <Trash2 size={14} />
                Uninstall
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog — Batch */}
      {confirmBatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setConfirmBatch(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: 24,
              maxWidth: 420,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertTriangle size={22} style={{ color: 'var(--yellow)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Batch Uninstall</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              You are about to uninstall <strong style={{ color: 'var(--text-primary)' }}>{selectedCount} application(s)</strong>.
            </p>
            <div style={{ maxHeight: 120, overflow: 'auto', marginBottom: 12 }}>
              {Array.from(selectedApps).map((name) => (
                <div
                  key={name}
                  style={{
                    fontSize: 12,
                    padding: '3px 0',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--yellow)', marginBottom: 20 }}>
              This action cannot be undone. Some applications may require additional confirmation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setConfirmBatch(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={handleBatchUninstall}
              >
                <Trash2 size={14} />
                Uninstall {selectedCount} Apps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
