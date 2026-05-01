import { useEffect } from 'react';
import { Calendar, Search, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { useSchedulerStore } from '../../stores/schedulerStore';

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  ready: { color: 'var(--green)', bg: 'rgba(63,185,80,0.12)' },
  running: { color: 'var(--accent)', bg: 'rgba(88,166,255,0.12)' },
  disabled: { color: 'var(--text-muted)', bg: 'rgba(139,148,158,0.08)' },
};

const RESULT_ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  success: CheckCircle,
  failure: XCircle,
  no_info: Info,
};

const RESULT_COLOR: Record<string, string> = {
  success: 'var(--green)',
  failure: 'var(--red)',
  no_info: 'var(--text-muted)',
};

export default function SchedulerView() {
  const {
    tasks, loading, searchQuery, statusFilter, sortField, sortAsc,
    expandedTask, detailLoading,
    fetchTasks, setSearchQuery, setStatusFilter, setSortField,
    expandTask, collapseTask, getFilteredTasks, getStats,
  } = useSchedulerStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = getFilteredTasks();
  const stats = getStats();

  const sortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortAsc ? ' ▲' : ' ▼';
  };

  if (loading && filtered.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading scheduled tasks...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Scheduled Tasks</h2>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">Task Scheduler</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Disabled</div>
          <div className="stat-value" style={{ fontSize: 22, color: stats.disabled > 0 ? 'var(--text-muted)' : undefined }}>{stats.disabled}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Due Today</div>
          <div className="stat-value" style={{ fontSize: 22, color: stats.dueToday > 0 ? 'var(--accent)' : undefined }}>{stats.dueToday}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Failed</div>
          <div className="stat-value" style={{ fontSize: 22, color: stats.failed > 0 ? 'var(--red)' : undefined }}>{stats.failed}</div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            placeholder="Search by name or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ width: 130 }}
        >
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="running">Running</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 260 }} onClick={() => setSortField('name')}>Task Name{sortArrow('name')}</th>
              <th style={{ width: 80 }} onClick={() => setSortField('status')}>Status{sortArrow('status')}</th>
              <th style={{ width: 200 }}>Triggers</th>
              <th style={{ width: 160 }} onClick={() => setSortField('nextRun')}>Next Run{sortArrow('nextRun')}</th>
              <th style={{ width: 160 }} onClick={() => setSortField('lastRun')}>Last Run{sortArrow('lastRun')}</th>
              <th style={{ width: 100 }} onClick={() => setSortField('lastResult')}>Result{sortArrow('lastResult')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => {
              const isExpanded = expandedTask?.name === task.name;
              const badge = STATUS_BADGE[task.status] || STATUS_BADGE.ready;
              const ResultIcon = RESULT_ICON[task.lastResult] || Info;

              return (
                <tr key={task.name} className="table-row">
                  <td onClick={() => isExpanded ? collapseTask() : expandTask(task.name)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />}
                      <Calendar size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{task.name}</div>
                        <div className="text-sm text-muted truncate">{task.path}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      color: badge.color, background: badge.bg,
                      textTransform: 'capitalize',
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm" style={{ fontSize: 11, lineHeight: 1.4 }}>
                      {task.triggers.slice(0, 2).map((t, i) => (
                        <div key={i} className="truncate" style={{ maxWidth: 180 }}>{t}</div>
                      ))}
                      {task.triggers.length > 2 && <div className="text-muted" style={{ fontSize: 10 }}>+{task.triggers.length - 2} more</div>}
                    </div>
                  </td>
                  <td className="text-mono" style={{ fontSize: 11 }}>
                    {task.nextRun ? <><Clock size={10} style={{ marginRight: 4, verticalAlign: -1 }} />{task.nextRun}</> : <span className="text-muted">-</span>}
                  </td>
                  <td className="text-mono" style={{ fontSize: 11 }}>
                    {task.lastRun || <span className="text-muted">Never</span>}
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <ResultIcon size={12} color={RESULT_COLOR[task.lastResult]} />
                      <span style={{ color: RESULT_COLOR[task.lastResult], textTransform: 'capitalize' }}>
                        {task.lastResult.replace('_', ' ')}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {expandedTask && (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          {detailLoading ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Loading details...</div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{expandedTask.name}</span>
                  <span style={{
                    display: 'inline-block', marginLeft: 8, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    color: STATUS_BADGE[expandedTask.status].color, background: STATUS_BADGE[expandedTask.status].bg,
                    textTransform: 'capitalize',
                  }}>
                    {expandedTask.status}
                  </span>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={collapseTask}>Close</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="stat-label">Path</div>
                  <div className="text-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{expandedTask.path}</div>
                </div>
                <div>
                  <div className="stat-label">Author</div>
                  <div style={{ fontSize: 13 }}>{expandedTask.author}</div>
                </div>
                <div>
                  <div className="stat-label">Created</div>
                  <div className="text-mono" style={{ fontSize: 12 }}>{expandedTask.created}</div>
                </div>
                <div>
                  <div className="stat-label">Description</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{expandedTask.description}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <div className="stat-label" style={{ marginBottom: 8 }}>Triggers</div>
                  {expandedTask.triggers.map((t, i) => (
                    <div key={i} className="text-mono" style={{ fontSize: 11, padding: '2px 0' }}>{t}</div>
                  ))}
                </div>
                <div>
                  <div className="stat-label" style={{ marginBottom: 8 }}>Actions</div>
                  {expandedTask.actions.map((a, i) => (
                    <div key={i} className="text-mono" style={{ fontSize: 10, padding: '2px 0', wordBreak: 'break-all' }}>{a}</div>
                  ))}
                </div>
                <div>
                  <div className="stat-label" style={{ marginBottom: 8 }}>Conditions</div>
                  {expandedTask.conditions?.map((c, i) => (
                    <div key={i} className="text-sm" style={{ fontSize: 11, padding: '2px 0', color: 'var(--text-secondary)' }}>{c}</div>
                  ))}
                </div>
                <div>
                  <div className="stat-label" style={{ marginBottom: 8 }}>Settings</div>
                  {expandedTask.settings?.map((s, i) => (
                    <div key={i} className="text-sm" style={{ fontSize: 11, padding: '2px 0', color: 'var(--text-secondary)' }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
