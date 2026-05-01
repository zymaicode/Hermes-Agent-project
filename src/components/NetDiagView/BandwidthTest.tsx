import { useState, useEffect, useRef } from 'react';
import { useNetDiagStore } from '../../stores/netdiagStore';

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'done';

export default function BandwidthTest() {
  const { bandwidthResult, bandwidthRunning, runBandwidthTest } = useNetDiagStore();
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (bandwidthRunning) {
      setPhase('latency');
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1;
          if (next > 1.0 && phase === 'latency') setPhase('download');
          if (next > 2.5 && phase === 'download') setPhase('upload');
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bandwidthResult) setPhase('done');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bandwidthRunning, bandwidthResult]);

  const handleStart = () => {
    setPhase('latency');
    setElapsed(0);
    runBandwidthTest();
  };

  const phaseLabel: Record<TestPhase, string> = {
    idle: '',
    latency: '测试延迟...',
    download: '测试下载速度...',
    upload: '测试上传速度...',
    done: '测试完成',
  };

  const downloadPercent = bandwidthResult ? Math.min(100, (bandwidthResult.downloadSpeed / 500) * 100) : 0;
  const uploadPercent = bandwidthResult ? Math.min(100, (bandwidthResult.uploadSpeed / 100) * 100) : 0;

  const speedColor = (speed: number, maxHigh: number) => {
    if (speed >= maxHigh * 0.7) return 'var(--green)';
    if (speed >= maxHigh * 0.3) return 'var(--yellow)';
    return 'var(--orange)';
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '24px 16px' }}>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={bandwidthRunning}
          style={{ padding: '12px 32px', fontSize: 15, fontWeight: 600 }}
        >
          {bandwidthRunning ? '测试中...' : '开始带宽测试'}
        </button>
        {bandwidthRunning && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)' }}>
            {phaseLabel[phase]}
          </div>
        )}

        {bandwidthRunning && (
          <div style={{ marginTop: 16 }}>
            <div className="progress-bar" style={{ height: 4, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                className="progress-bar-fill"
                style={{
                  height: '100%',
                  width: `${phase === 'latency' ? 33 : phase === 'download' ? 66 : phase === 'upload' ? 90 : 100}%`,
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {bandwidthResult && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                下载速度
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: speedColor(bandwidthResult.downloadSpeed, 500), fontFamily: 'var(--font-mono, monospace)' }}>
                {bandwidthResult.downloadSpeed}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Mbps</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${downloadPercent}%`,
                      background: speedColor(bandwidthResult.downloadSpeed, 500),
                      borderRadius: 4,
                      transition: 'width 0.8s',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                上传速度
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: speedColor(bandwidthResult.uploadSpeed, 100), fontFamily: 'var(--font-mono, monospace)' }}>
                {bandwidthResult.uploadSpeed}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Mbps</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadPercent}%`,
                      background: speedColor(bandwidthResult.uploadSpeed, 100),
                      borderRadius: 4,
                      transition: 'width 0.8s',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                延迟
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)' }}>
                {bandwidthResult.latency}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>ms</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">测试详情</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>测试服务器: </span>
                <span style={{ fontSize: 13 }}>{bandwidthResult.server}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>测试耗时: </span>
                <span style={{ fontSize: 13 }}>{bandwidthResult.duration}s</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>下载数据量: </span>
                <span style={{ fontSize: 13 }}>{bandwidthResult.dataDownloaded} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
