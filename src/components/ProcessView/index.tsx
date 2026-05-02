import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Skull, ChevronDown, ChevronUp, Activity, Brain } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useProcessStore } from '../../stores/processStore';
import AIAnalysisModal from './AIAnalysisModal';

const STATUS_COLORS: Record<string, string> = {
  running: 'var(--green)',
  suspended: 'var(--yellow)',
  stopped: 'var(--red)',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'var(--red)',
  'Above Normal': 'var(--orange)',
  Normal: 'var(--text-secondary)',
  'Below Normal': 'var(--text-muted)',
  Low: 'var(--text-muted)',
};

export default function ProcessView() {
  const {
    loading, searchQuery, statusFilter, sortField, sortAsc,
    expandedPid, expandedDetail, detailLoading,
    fetchProcesses, setSearchQuery, setStatusFilter, setSortField,
    expandProcess, collapseProcess, killProcess,
    getFilteredProcesses, getStats,
  } = useProcessStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [killConfirm, setKillConfirm] = useState<number | null>(null);
  const [killMsg, setKillMsg] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<{
    name: string; pid: number; cpuPercent: number; memoryMB: number;
    status?: string; path?: string; user?: string; startTime?: string;
  } | null>(null);

  useEffect(() => {
    fetchProcesses();
    intervalRef.current = setInterval(fetchProcesses, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchProcesses]);

  const handleKill = useCallback(async (pid: number, name: string) => {
    if (killConfirm !== pid) {
      setKillConfirm(pid);
      setKillMsg(`Kill ${name} (PID: ${pid})?`);
      setTimeout(() => { setKillConfirm(null); setKillMsg(null); }, 4000);
      return;
    }
    const result = await killProcess(pid);
    setKillMsg(result.message);
    setKillConfirm(null);
    setTimeout(() => setKillMsg(null), 3000);
  }, [killConfirm, killProcess]);

  const filtered = getFilteredProcesses();
  const stats = getStats();

  const sortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortAsc ? ' ▲' : ' ▼';
  };

  if (loading && filtered.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading processes...
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Process Monitor</h2>
        <div className="flex items-center gap-2">
          <span className="pulse-dot active" />
          <span className="text-sm text-muted text-mono">Refresh: 3s</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Total Processes</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Total Memory</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{(stats.totalMemMB / 1024).toFixed(1)}<span className="stat-unit">GB</span></div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Top CPU</div>
          <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{stats.topCpu}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="stat-label">Top Memory</div>
          <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{stats.topMem}</div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-secondary)' }} />
          <input
            className="input"
            placeholder="Search by name, PID, or user..."
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
          <option value="running">Running</option>
          <option value="suspended">Suspended</option>
          <option value="stopped">Stopped</option>
        </select>

        {killMsg && (
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--radius)', fontSize: 12,
            background: killMsg.includes('Access denied') || killMsg.includes('not found') ? 'rgba(248,81,73,0.15)' : 'rgba(63,185,80,0.15)',
            color: killMsg.includes('Access denied') || killMsg.includes('not found') ? 'var(--red)' : 'var(--green)',
            whiteSpace: 'nowrap',
          }}>
            {killMsg}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 240 }} onClick={() => setSortField('name')}>Process{sortArrow('name')}</th>
              <th style={{ width: 70 }} onClick={() => setSortField('pid')}>PID{sortArrow('pid')}</th>
              <th style={{ width: 140 }} onClick={() => setSortField('cpuPercent')}>CPU{sortArrow('cpuPercent')}</th>
              <th style={{ width: 140 }} onClick={() => setSortField('memoryMB')}>Memory{sortArrow('memoryMB')}</th>
              <th style={{ width: 90 }} onClick={() => setSortField('status')}>Status{sortArrow('status')}</th>
              <th style={{ width: 90 }} onClick={() => setSortField('threads')}>Threads{sortArrow('threads')}</th>
              <th style={{ width: 90 }} onClick={() => setSortField('priority')}>Priority{sortArrow('priority')}</th>
              <th style={{ width: 60 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((proc) => {
              const isExpanded = expandedPid === proc.pid;
              const cpuColor = proc.cpuPercent > 20 ? 'var(--red)' :
                proc.cpuPercent > 10 ? 'var(--yellow)' : 'var(--green)';
              const memColor = proc.memoryPercent > 50 ? 'var(--red)' :
                proc.memoryPercent > 25 ? 'var(--yellow)' : 'var(--accent)';

              return (
                <tr key={proc.pid} className="table-row">
                  <td onClick={() => isExpanded ? collapseProcess() : expandProcess(proc.pid)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />}
                      <Activity size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{proc.name}</div>
                        <div className="text-sm text-muted truncate">{proc.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-mono">{proc.pid}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar" style={{ width: 60, height: 6 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${Math.min(proc.cpuPercent, 100)}%`,
                          background: cpuColor,
                          borderRadius: 3,
                          height: '100%',
                          transition: 'width 0.5s',
                        }} />
                      </div>
                      <span className="text-mono" style={{ fontSize: 12, color: cpuColor }}>{proc.cpuPercent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar" style={{ width: 60, height: 6 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${Math.min(proc.memoryPercent * 2, 100)}%`,
                          background: memColor,
                          borderRadius: 3,
                          height: '100%',
                          transition: 'width 0.5s',
                        }} />
                      </div>
                      <span className="text-mono" style={{ fontSize: 12 }}>{proc.memoryMB.toFixed(0)} MB</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: STATUS_COLORS[proc.status] || 'var(--text-muted)',
                        display: 'inline-block',
                      }} />
                      <span style={{ fontSize: 12, textTransform: 'capitalize', color: STATUS_COLORS[proc.status] }}>{proc.status}</span>
                    </span>
                  </td>
                  <td className="text-mono" style={{ fontSize: 12 }}>{proc.threads}</td>
                  <td style={{ fontSize: 12, color: PRIORITY_COLORS[proc.priority] || 'var(--text-secondary)' }}>{proc.priority}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: 'var(--accent)',
                          borderColor: 'var(--accent)',
                          color: '#fff',
                        }}
                        onClick={() => setAnalysisTarget(proc)}
                        title="AI 分析"
                      >
                        <Brain size={12} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: killConfirm === proc.pid ? 'var(--red)' : 'transparent',
                          borderColor: killConfirm === proc.pid ? 'var(--red)' : 'var(--border-color)',
                          color: killConfirm === proc.pid ? '#fff' : 'var(--red)',
                        }}
                        onClick={() => handleKill(proc.pid, proc.name)}
                      >
                        <Skull size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {expandedDetail && (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          {detailLoading ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Loading details...</div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{expandedDetail.name}</span>
                  <span className="text-sm text-muted" style={{ marginLeft: 8 }}>PID: {expandedDetail.pid}</span>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={collapseProcess}>Close</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="stat-label">Command Line</div>
                  <div className="text-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{expandedDetail.commandLine || '(none)'}</div>
                </div>
                <div>
                  <div className="stat-label">Path</div>
                  <div className="text-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{expandedDetail.path}</div>
                </div>
                <div>
                  <div className="stat-label">User</div>
                  <div style={{ fontSize: 13 }}>{expandedDetail.user}</div>
                </div>
                <div>
                  <div className="stat-label">Started</div>
                  <div className="text-mono" style={{ fontSize: 12 }}>{expandedDetail.startTime}</div>
                </div>
                <div>
                  <div className="stat-label">Handles</div>
                  <div className="text-mono" style={{ fontSize: 13 }}>{expandedDetail.handles.toLocaleString()}</div>
                </div>
                <div>
                  <div className="stat-label">Priority</div>
                  <div style={{ fontSize: 13, color: PRIORITY_COLORS[expandedDetail.priority] || 'var(--text-secondary)' }}>{expandedDetail.priority}</div>
                </div>
              </div>

              {/* CPU and Memory History Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card" style={{ padding: 12 }}>
                  <div className="stat-label" style={{ marginBottom: 8 }}>CPU History</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={expandedDetail.cpuHistory.map((v) => ({ val: v }))}>
                      <defs>
                        <linearGradient id="cpu-hist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="var(--accent)" fill="url(#cpu-hist)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <div className="stat-label" style={{ marginBottom: 8 }}>Memory History (MB)</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={expandedDetail.memHistory.map((v) => ({ val: v }))}>
                      <defs>
                        <linearGradient id="mem-hist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="var(--green)" fill="url(#mem-hist)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {analysisTarget && <AIAnalysisModal proc={analysisTarget} onClose={() => setAnalysisTarget(null)} />}
    </div>
  );
}
