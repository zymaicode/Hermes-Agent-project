import { useEffect } from 'react';
import { Gauge, Cpu, HardDrive, MemoryStick, Trophy, Play } from 'lucide-react';
import { useBenchmarkStore } from '../../stores/benchmarkStore';

const GRADE_COLORS: Record<string, string> = {
  Excellent: 'var(--green)',
  Good: 'var(--accent)',
  Fair: 'var(--yellow)',
  Poor: 'var(--red)',
};

export default function BenchmarkView() {
  const { lastResult, running, progress, phase, history, startBenchmark, fetchHistory } = useBenchmarkStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Idle state
  if (!running && !lastResult) {
    return (
      <div className="flex-col items-center" style={{ height: '100%', justifyContent: 'center', textAlign: 'center' }}>
        <Gauge size={64} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Performance Benchmark</h2>
        <p className="text-sm text-muted" style={{ maxWidth: 400, marginBottom: 24 }}>
          Test your system&apos;s CPU, memory, and disk performance. Takes approximately 15 seconds and will not affect system stability.
        </p>
        <button className="btn btn-primary" style={{ padding: '10px 32px', fontSize: 15 }} onClick={startBenchmark}>
          <Play size={18} /> Run Benchmark
        </button>
      </div>
    );
  }

  // Running state
  if (running) {
    return (
      <div className="flex-col items-center" style={{ height: '100%', justifyContent: 'center', textAlign: 'center' }}>
        <div
          className="spin"
          style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '3px solid var(--bg-tertiary)',
            borderTopColor: 'var(--accent)',
            marginBottom: 24,
          }}
        />
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Running Benchmark</h2>
        <div className="progress-bar" style={{ width: 360, height: 8, marginBottom: 12 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              background: progress < 30 ? 'var(--accent)' : progress < 70 ? 'var(--yellow)' : 'var(--green)',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div className="text-mono" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{progress}%</div>
        <p className="text-sm text-muted">{phase}</p>
      </div>
    );
  }

  // Done state — show results
  const result = lastResult!;

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Performance Benchmark</h2>
        <button className="btn btn-primary" onClick={startBenchmark}>
          <Play size={14} /> Run Again
        </button>
      </div>

      {/* Overall Score */}
      <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
        <Trophy size={32} style={{ color: 'var(--accent)', marginBottom: 8 }} />
        <div className="stat-label">Overall Score</div>
        <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'var(--font-mono)', color: GRADE_COLORS[result.overall.grade] || 'var(--accent)', lineHeight: 1.1 }}>
          {result.overall.score.toLocaleString()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <span style={{
            padding: '4px 14px', borderRadius: 20, fontSize: 14, fontWeight: 600,
            background: `${GRADE_COLORS[result.overall.grade]}20`,
            color: GRADE_COLORS[result.overall.grade],
          }}>
            {result.overall.grade}
          </span>
          <span className="text-sm text-muted">
            Faster than {result.overall.percentile}% of similar systems
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* CPU */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Cpu size={16} style={{ verticalAlign: -3, marginRight: 6 }} />CPU</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <ScoreBlock label="Single Core" score={result.cpu.singleCore.score} detail={`${(result.cpu.singleCore.operations / 1_000_000).toFixed(1)}M ops/s`} />
            <ScoreBlock label="Multi Core" score={result.cpu.multiCore.score} detail={`${(result.cpu.multiCore.operations / 1_000_000).toFixed(1)}M ops/s`} />
          </div>
          <div className="text-sm text-muted">{result.cpu.description}</div>
        </div>

        {/* Memory */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><MemoryStick size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Memory</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <ScoreBlock label="Read" score={result.memory.readSpeed.score} detail={`${(result.memory.readSpeed.mbps / 1000).toFixed(1)} GB/s`} />
            <ScoreBlock label="Write" score={result.memory.writeSpeed.score} detail={`${(result.memory.writeSpeed.mbps / 1000).toFixed(1)} GB/s`} />
            <ScoreBlock label="Latency" score={result.memory.latency.score} detail={`${result.memory.latency.ns} ns`} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Disk */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><HardDrive size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Disk Sequential</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ScoreBlock label="Read" score={result.disk.sequentialRead.score} detail={`${result.disk.sequentialRead.mbps.toLocaleString()} MB/s`} />
            <ScoreBlock label="Write" score={result.disk.sequentialWrite.score} detail={`${result.disk.sequentialWrite.mbps.toLocaleString()} MB/s`} />
          </div>
        </div>

        {/* Disk Random */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><HardDrive size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Disk Random</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ScoreBlock label="Read" score={result.disk.randomRead.score} detail={`${(result.disk.randomRead.iops / 1000).toFixed(0)}K IOPS`} />
            <ScoreBlock label="Write" score={result.disk.randomWrite.score} detail={`${(result.disk.randomWrite.iops / 1000).toFixed(0)}K IOPS`} />
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 1 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Benchmark History</span></div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((h, i) => (
                <tr key={i}>
                  <td className="text-mono" style={{ fontSize: 12 }}>{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="text-mono" style={{ fontSize: 13 }}>{h.overall.score.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      color: GRADE_COLORS[h.overall.grade],
                      background: `${GRADE_COLORS[h.overall.grade]}15`,
                    }}>
                      {h.overall.grade}
                    </span>
                  </td>
                  <td className="text-mono" style={{ fontSize: 12 }}>{h.overall.percentile}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScoreBlock({ label, score, detail }: { label: string; score: number; detail: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="stat-label">{label}</div>
      <div className="text-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
        {score.toLocaleString()}
      </div>
      <div className="text-sm text-muted">{detail}</div>
    </div>
  );
}
