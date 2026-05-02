import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Clock, Trash2, Activity, Thermometer, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface FpsSession {
  id: number;
  gameName: string;
  startTime: number;
  endTime: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgCpuTemp: number;
  avgGpuTemp: number;
}

interface FpsRecord {
  timestamp: number;
  fps: number;
  cpuUsage: number;
  cpuTemp: number;
  gpuUsage: number;
  gpuTemp: number;
  ramUsage: number;
}

export default function FPSHistoryView() {
  const [sessions, setSessions] = useState<FpsSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<FpsRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await (window as any).pchelper.fpsGetHistory(30);
      setSessions(data || []);
    } catch (e) {
      console.error('Failed to fetch FPS history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSelectSession = async (session: FpsSession) => {
    if (selectedId === session.id) {
      setSelectedId(null);
      setDetailData([]);
      return;
    }
    setSelectedId(session.id);
    setDetailLoading(true);
    try {
      const data = await (window as any).pchelper.fpsGetSession(session.id);
      setDetailData(data || []);
    } catch (e) {
      console.error('Failed to fetch session detail', e);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClear = async () => {
    await (window as any).pchelper.fpsClearHistory();
    setSelectedId(null);
    setDetailData([]);
    fetchHistory();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const chartData = detailData.map((r, i) => ({
    index: i,
    fps: r.fps,
    cpuTemp: r.cpuTemp,
    gpuTemp: r.gpuTemp,
    cpuUsage: r.cpuUsage,
    gpuUsage: r.gpuUsage,
    ramUsage: r.ramUsage,
  }));

  if (loading) {
    return (
      <div className="go-section">
        <h3><Clock size={16} /> FPS 历史记录</h3>
        <p className="go-empty">加载中...</p>
      </div>
    );
  }

  return (
    <div className="go-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} /> FPS 历史记录
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" onClick={fetchHistory} style={{ padding: '4px 10px', fontSize: 12 }}>
            <RefreshCw size={12} /> 刷新
          </button>
          <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '4px 10px', fontSize: 12, color: 'var(--red)' }}>
            <Trash2 size={12} /> 清空
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="go-empty">暂无记录，开启性能浮窗后将自动记录</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sessions.map((s) => (
            <div key={s.id}>
              <div
                className="go-game-item"
                style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => handleSelectSession(s)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>{s.gameName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatTime(s.startTime)}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={12} style={{ color: 'var(--accent)' }} /> {s.avgFps} FPS
                    <Thermometer size={12} style={{ marginLeft: 8, color: 'var(--orange)' }} /> CPU {s.avgCpuTemp}°C
                    {selectedId === s.id ? <ChevronUp size={14} style={{ marginLeft: 4 }} /> : <ChevronDown size={14} style={{ marginLeft: 4 }} />}
                  </span>
                </div>
              </div>
              {selectedId === s.id && (
                <div style={{ padding: '12px 12px 8px', background: 'var(--bg-card)', borderRadius: '0 0 var(--radius) var(--radius)', marginTop: -6 }}>
                  {detailLoading ? (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 16 }}>加载中...</p>
                  ) : chartData.length > 0 ? (
                    <>
                      <div style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="index" tick={false} />
                            <YAxis yAxisId="fps" domain={['auto', 'auto']} width={40} tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="temp" orientation="right" domain={['auto', 'auto']} width={40} tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12 }}
                              formatter={(value: number, name: string) => {
                                const labels: Record<string, string> = { fps: 'FPS', cpuTemp: 'CPU温度', gpuTemp: 'GPU温度', cpuUsage: 'CPU使用率', gpuUsage: 'GPU使用率', ramUsage: '内存' };
                                const units: Record<string, string> = { fps: '', cpuTemp: '°C', gpuTemp: '°C', cpuUsage: '%', gpuUsage: '%', ramUsage: '%' };
                                return [`${value}${units[name] || ''}`, labels[name] || name];
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line yAxisId="fps" type="monotone" dataKey="fps" stroke="var(--accent)" dot={false} strokeWidth={2} name="fps" />
                            <Line yAxisId="temp" type="monotone" dataKey="cpuTemp" stroke="var(--orange)" dot={false} strokeWidth={1.5} name="cpuTemp" />
                            <Line yAxisId="temp" type="monotone" dataKey="gpuTemp" stroke="var(--red)" dot={false} strokeWidth={1.5} name="gpuTemp" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, flexWrap: 'wrap' }}>
                        <span>最高: <b style={{ color: 'var(--green)' }}>{s.maxFps}</b> FPS</span>
                        <span>最低: <b style={{ color: 'var(--red)' }}>{s.minFps}</b> FPS</span>
                        <span>平均: <b style={{ color: 'var(--accent)' }}>{s.avgFps}</b> FPS</span>
                        <span>GPU温度: <b>{s.avgGpuTemp}</b>°C</span>
                        <span>时长: <b>{Math.round((s.endTime - s.startTime) / 60000)}</b> 分钟</span>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 16 }}>无详细数据</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
