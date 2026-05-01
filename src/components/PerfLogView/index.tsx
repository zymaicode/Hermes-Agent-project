import { useEffect, useRef, useCallback } from 'react';
import {
  LineChart, Circle, Trash2, Download, Play, Square,
  TrendingUp, Clock, Activity, HardDrive, Cpu, Wifi,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart as ReLineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { usePerfLogStore } from '../../stores/perfLogStore';
import type { PerfLogSession, PerfLogEntry } from '../../../electron/perflog/recorder';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function formatMB(val: number): string {
  return val.toFixed(1);
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function PerfLogView() {
  const sessions = usePerfLogStore((s) => s.sessions);
  const activeSession = usePerfLogStore((s) => s.activeSession);
  const sessionData = usePerfLogStore((s) => s.sessionData);
  const loading = usePerfLogStore((s) => s.loading);
  const isRecording = usePerfLogStore((s) => s.isRecording);
  const sessionName = usePerfLogStore((s) => s.sessionName);
  const expandedSessionId = usePerfLogStore((s) => s.expandedSessionId);
  const result = usePerfLogStore((s) => s.result);
  const fetchSessions = usePerfLogStore((s) => s.fetchSessions);
  const startRecording = usePerfLogStore((s) => s.startRecording);
  const stopRecording = usePerfLogStore((s) => s.stopRecording);
  const setSessionName = usePerfLogStore((s) => s.setSessionName);
  const expandSession = usePerfLogStore((s) => s.expandSession);
  const deleteSession = usePerfLogStore((s) => s.deleteSession);
  const clearResult = usePerfLogStore((s) => s.clearResult);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Auto-refresh when recording
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isRecording) {
      refreshRef.current = setInterval(() => fetchSessions(), 5000);
    }
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [isRecording, fetchSessions]);

  // Auto-clear result
  useEffect(() => {
    if (result) {
      const t = setTimeout(() => clearResult(), 3000);
      return () => clearTimeout(t);
    }
  }, [result, clearResult]);

  const handleStart = () => {
    if (sessionName.trim()) {
      startRecording(sessionName.trim());
    }
  };

  const chartData = sessionData.map((e: PerfLogEntry) => ({
    time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cpuUsage: e.cpu.usage,
    cpuTemp: e.cpu.temp,
    memPercent: e.memory.percent,
    memUsed: e.memory.used,
    diskRead: e.disk.readMbps,
    diskWrite: e.disk.writeMbps,
    gpuUsage: e.gpu.usage,
    gpuTemp: e.gpu.temp,
    netDown: e.network.download,
    netUp: e.network.upload,
  }));

  const expandedSession = sessions.find((s) => s.id === expandedSessionId);

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Performance Log</h2>
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm text-muted text-mono">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Recording controls */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <>
              <input
                placeholder="Session name..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              />
              <button
                className="btn"
                disabled={!sessionName.trim()}
                onClick={handleStart}
                style={{
                  background: 'var(--green)', color: '#fff',
                  opacity: sessionName.trim() ? 1 : 0.5,
                }}
              >
                <Play size={14} /> Start Recording
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2" style={{ color: 'var(--red)' }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', background: 'var(--red)',
                  animation: 'pulse 1.5s infinite',
                }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Recording...</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {activeSession?.duration || '0s'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                {activeSession?.name}
              </span>
              <button
                className="btn"
                onClick={stopRecording}
                style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff' }}
              >
                <Square size={14} /> Stop Recording
              </button>
            </>
          )}
        </div>
        {result && (
          <div style={{
            marginTop: 8, padding: '6px 12px', borderRadius: 6, fontSize: 12,
            background: result.success ? 'var(--green-muted)' : 'var(--red-muted)',
            color: result.success ? 'var(--green)' : 'var(--red)',
          }}>
            {result.message}
          </div>
        )}
      </div>

      {/* Active session live mini view */}
      {isRecording && activeSession && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Live Data: {activeSession.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, fontSize: 12 }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>CPU</span>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{activeSession.summary.avgCpu.toFixed(1)}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Memory</span>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{activeSession.summary.avgMem.toFixed(1)}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Disk Read</span>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(activeSession.summary.avgDiskRead)} MB/s</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>GPU</span>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{activeSession.summary.avgGpu.toFixed(1)}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Net DL</span>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(activeSession.summary.avgNetDownload)} Mbps</div>
            </div>
          </div>
        </div>
      )}

      {/* Result toast */}
      {result && (
        <div style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 12,
          background: result.success ? 'var(--green-muted)' : 'var(--red-muted)',
          color: result.success ? 'var(--green)' : 'var(--red)',
        }}>
          {result.message}
        </div>
      )}

      {/* Past sessions list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recording Sessions</h3>
        {sessions.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 24, textAlign: 'center' }}>
            No recording sessions yet. Start a new recording above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const isRunning = session.status === 'recording';
              return (
                <div
                  key={session.id}
                  className="card"
                  style={{
                    padding: 16,
                    borderLeft: `3px solid ${isRunning ? 'var(--red)' : session.status === 'completed' ? 'var(--green)' : 'var(--yellow)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div onClick={() => expandSession(session.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{session.name}</span>
                        <span style={{
                          marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 10,
                          background: isRunning ? 'var(--red-muted)' : session.status === 'completed' ? 'var(--green-muted)' : 'var(--yellow-muted)',
                          color: isRunning ? 'var(--red)' : session.status === 'completed' ? 'var(--green)' : 'var(--yellow)',
                          textTransform: 'capitalize',
                        }}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {formatDate(session.startTime)} &middot; {session.duration}
                        </span>
                        {!isRunning && (
                          <button
                            className="btn-icon"
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Summary stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, fontSize: 11 }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>CPU</span>
                        <div>Avg: {fmt(session.summary.avgCpu)}% / Max: {fmt(session.summary.maxCpu)}%</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Memory</span>
                        <div>Avg: {fmt(session.summary.avgMem)}% / Max: {fmt(session.summary.maxMem)}%</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Disk</span>
                        <div>R: {fmt(session.summary.avgDiskRead)} / W: {fmt(session.summary.avgDiskWrite)} MB/s</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>GPU</span>
                        <div>Avg: {fmt(session.summary.avgGpu)}% / Max: {fmt(session.summary.maxGpu)}%</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Network</span>
                        <div>DL: {fmt(session.summary.avgNetDownload)} / UL: {fmt(session.summary.avgNetUpload)} Mbps</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>
                      {session.entries} entries &middot; Max Temp: {fmt(session.summary.maxTemp)}°C
                    </div>
                  </div>

                  {/* Expanded charts */}
                  {isExpanded && chartData.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>CPU Usage + Temperature</h4>
                        <ResponsiveContainer width="100%" height={160}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Area type="monotone" dataKey="cpuUsage" name="CPU %" stroke="var(--blue)" fill="url(#cpuFill)" strokeWidth={1.5} />
                            <Area type="monotone" dataKey="cpuTemp" name="CPU Temp" stroke="var(--orange)" fill="none" strokeWidth={1.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Memory Usage</h4>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="memFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11 }} />
                            <Area type="monotone" dataKey="memPercent" name="Memory %" stroke="var(--purple)" fill="url(#memFill)" strokeWidth={1.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Disk Activity (Read/Write)</h4>
                        <ResponsiveContainer width="100%" height={140}>
                          <ReLineChart data={chartData}>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Line type="monotone" dataKey="diskRead" name="Read MB/s" stroke="var(--green)" strokeWidth={1.5} dot={false} />
                            <Line type="monotone" dataKey="diskWrite" name="Write MB/s" stroke="var(--red)" strokeWidth={1.5} dot={false} />
                          </ReLineChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>GPU Usage + Temperature</h4>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={chartData}>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Area type="monotone" dataKey="gpuUsage" name="GPU %" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.1} strokeWidth={1.5} />
                            <Area type="monotone" dataKey="gpuTemp" name="GPU Temp" stroke="var(--pink)" fill="none" strokeWidth={1.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Network (Download/Upload)</h4>
                        <ResponsiveContainer width="100%" height={140}>
                          <ReLineChart data={chartData}>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Line type="monotone" dataKey="netDown" name="DL Mbps" stroke="var(--cyan)" strokeWidth={1.5} dot={false} />
                            <Line type="monotone" dataKey="netUp" name="UL Mbps" stroke="var(--orange)" strokeWidth={1.5} dot={false} />
                          </ReLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
