import {
  Search,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useDriverManagerStore } from '../../stores/driverManagerStore';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  running: { label: '运行中', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  stopped: { label: '已停止', color: 'var(--text-muted)', bg: 'rgba(136,136,136,0.12)' },
  error: { label: '错误', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

export default function DriverList() {
  const drivers = useDriverManagerStore((s) => s.getFilteredDrivers());
  const stats = useDriverManagerStore((s) => s.getStats());
  const classList = useDriverManagerStore((s) => s.getClassList());
  const searchQuery = useDriverManagerStore((s) => s.searchQuery);
  const classFilter = useDriverManagerStore((s) => s.classFilter);
  const statusFilter = useDriverManagerStore((s) => s.statusFilter);
  const thirdPartyOnly = useDriverManagerStore((s) => s.thirdPartyOnly);
  const sortField = useDriverManagerStore((s) => s.sortField);
  const sortAsc = useDriverManagerStore((s) => s.sortAsc);
  const expandedDriver = useDriverManagerStore((s) => s.expandedDriver);
  const selectedDriverIds = useDriverManagerStore((s) => s.selectedDriverIds);

  const setSearchQuery = useDriverManagerStore((s) => s.setSearchQuery);
  const setClassFilter = useDriverManagerStore((s) => s.setClassFilter);
  const setStatusFilter = useDriverManagerStore((s) => s.setStatusFilter);
  const setThirdPartyOnly = useDriverManagerStore((s) => s.setThirdPartyOnly);
  const setSortField = useDriverManagerStore((s) => s.setSortField);
  const expandDriver = useDriverManagerStore((s) => s.expandDriver);
  const collapseDriver = useDriverManagerStore((s) => s.collapseDriver);
  const toggleSelectDriver = useDriverManagerStore((s) => s.toggleSelectDriver);
  const selectAll = useDriverManagerStore((s) => s.selectAll);
  const deselectAll = useDriverManagerStore((s) => s.deselectAll);
  const setActiveTab = useDriverManagerStore((s) => s.setActiveTab);

  const allSelected = drivers.length > 0 && drivers.every((d) => selectedDriverIds.includes(d.name));

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '7px 12px',
    fontSize: 12,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-muted)',
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '总驱动', value: stats.total },
          { label: '运行中', value: stats.running, color: 'var(--green)' },
          { label: '已停止', value: stats.stopped, color: 'var(--text-muted)' },
          { label: '错误', value: stats.errors, color: 'var(--red)' },
          { label: '第三方', value: stats.thirdParty, color: 'var(--accent)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              border: '1px solid var(--border-muted)',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="搜索驱动名称、供应商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{
            padding: '7px 10px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">所有类别</option>
          {classList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '7px 10px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">所有状态</option>
          <option value="running">运行中</option>
          <option value="stopped">已停止</option>
          <option value="error">错误</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={thirdPartyOnly}
            onChange={(e) => setThirdPartyOnly(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          仅第三方
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={allSelected ? deselectAll : selectAll}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {allSelected ? '取消全选' : '全选'}
          </button>
          {selectedDriverIds.length > 0 && (
            <button
              onClick={() => setActiveTab('backup')}
              style={{
                padding: '6px 12px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: '#fff',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 500,
              }}
            >
              备份已选 ({selectedDriverIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 36, cursor: 'default' }}>
                <span
                  onClick={() => (allSelected ? deselectAll() : selectAll())}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {allSelected && drivers.length > 0 ? <CheckSquare size={14} color="var(--accent)" /> : <Square size={14} />}
                </span>
              </th>
              <th style={thStyle} onClick={() => setSortField('name')}>
                驱动名称 {sortField === 'name' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
              <th style={thStyle} onClick={() => setSortField('provider')}>
                供应商 {sortField === 'provider' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
              <th style={thStyle} onClick={() => setSortField('version')}>
                版本 {sortField === 'version' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
              <th style={thStyle} onClick={() => setSortField('date')}>
                日期 {sortField === 'date' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
              <th style={thStyle} onClick={() => setSortField('className')}>
                类别 {sortField === 'className' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
              <th style={thStyle} onClick={() => setSortField('status')}>
                状态 {sortField === 'status' && (sortAsc ? <ChevronUp size={12} style={{ verticalAlign: 'middle' }} /> : <ChevronDown size={12} style={{ verticalAlign: 'middle' }} />)}
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const st = STATUS_LABELS[d.status] || STATUS_LABELS.running;
              const isExpanded = expandedDriver?.hardwareId === d.hardwareId;
              const isSelected = selectedDriverIds.includes(d.name);
              return (
                <tr key={d.hardwareId} style={{ cursor: 'pointer', background: isExpanded ? 'var(--accent-muted)' : undefined }}>
                  <td style={tdStyle} onClick={(e) => { e.stopPropagation(); toggleSelectDriver(d.name); }}>
                    {isSelected ? <CheckSquare size={14} color="var(--accent)" /> : <Square size={14} />}
                  </td>
                  <td style={tdStyle} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{d.name}</span>
                  </td>
                  <td style={tdStyle} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>
                    {d.provider}
                    {d.isThirdParty ? '' : (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>(Microsoft)</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>
                    {d.version}
                  </td>
                  <td style={tdStyle} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>{d.date}</td>
                  <td style={tdStyle} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>{d.className}</td>
                  <td style={tdStyle} onClick={() => isExpanded ? collapseDriver() : expandDriver(d.hardwareId)}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 500,
                      color: st.color,
                      background: st.bg,
                    }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {drivers.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            没有找到匹配的驱动
          </div>
        )}
      </div>

      {/* Expanded driver detail */}
      {expandedDriver && (
        <div style={{
          marginTop: 12,
          padding: 16,
          background: 'var(--bg-hover)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{expandedDriver.name} — 详细信息</h4>
            <button
              onClick={collapseDriver}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px', fontSize: 12 }}>
            {[
              ['硬件 ID', expandedDriver.hardwareId],
              ['供应商', expandedDriver.provider],
              ['版本', expandedDriver.version],
              ['发布日期', expandedDriver.date],
              ['类别', expandedDriver.className],
              ['状态', STATUS_LABELS[expandedDriver.status]?.label || expandedDriver.status],
              ['驱动路径', expandedDriver.path],
              ['数字签名', expandedDriver.isSigned ? '已签名' : '未签名'],
              ['类型', expandedDriver.isThirdParty ? '第三方驱动' : 'Microsoft 驱动'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>{label}:</span>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
