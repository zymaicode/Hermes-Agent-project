import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SoftwareEntry } from '../../utils/types';

type SortKey = keyof Pick<SoftwareEntry, 'name' | 'version' | 'publisher' | 'installDate'>;
type SortDir = 'asc' | 'desc';

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

export default function SoftwareView() {
  const [apps, setApps] = useState<SoftwareEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      let data: SoftwareEntry[];
      if (search.trim()) {
        data = await window.pchelper.searchApps(search.trim());
      } else {
        data = await window.pchelper.getInstalledApps();
      }
      setApps(data);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setLoading(true);
    if (value.trim()) {
      window.pchelper.searchApps(value.trim()).then(setApps).finally(() => setLoading(false));
    } else {
      window.pchelper.getInstalledApps().then(setApps).finally(() => setLoading(false));
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

  const sortedApps = useMemo(() => {
    const sorted = [...apps];
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
  }, [apps, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  }

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Software</h2>
        <span className="text-sm text-muted">{apps.length} applications</span>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
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
          placeholder="Search by name or publisher..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
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
              <th onClick={() => handleSort('installDate')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Install Date <SortIcon col="installDate" />
                </span>
              </th>
              <th style={{ textAlign: 'right', cursor: 'default' }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  Loading...
                </td>
              </tr>
            ) : sortedApps.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  {search ? 'No applications match your search.' : 'No applications found.'}
                </td>
              </tr>
            ) : (
              sortedApps.map((app) => (
                <tr key={app.id}>
                  <td className="text-mono" style={{ fontWeight: 500 }}>
                    {app.name}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.version}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.publisher}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.installDate}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {formatSize(app.sizeMB)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
