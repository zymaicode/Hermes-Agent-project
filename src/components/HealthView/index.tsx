import { useEffect, useState } from 'react';
import {
  Heart,
  Cpu,
  Monitor,
  AlertTriangle,
  RefreshCw,
  Bell,
  ChevronRight,
  RefreshCcw,
  CheckCircle,
  TrendingUp,
  HardDrive,
  CircuitBoard,
} from 'lucide-react';
import { useHealthStore } from '../../stores/healthStore';
import type { HealthCategory } from '../../utils/types';

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'Excellent': return 'var(--green)';
    case 'Good': return 'var(--accent)';
    case 'Fair': return 'var(--yellow)';
    case 'Poor': return 'var(--orange)';
    case 'Critical': return 'var(--red)';
    default: return 'var(--text-secondary)';
  }
}

function getScoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.85) return 'var(--green)';
  if (pct >= 0.7) return 'var(--accent)';
  if (pct >= 0.5) return 'var(--yellow)';
  if (pct >= 0.3) return 'var(--orange)';
  return 'var(--red)';
}

function CategoryBar({
  label,
  icon: Icon,
  category,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  category: HealthCategory;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="card"
        style={{
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          border: 'none',
          background: 'var(--bg-secondary)',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ color: getScoreColor(category.score, category.maxScore) }}><Icon size={18} /></span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</span>
          <span
            className="text-mono"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: getScoreColor(category.score, category.maxScore),
            }}
          >
            {category.score}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {category.maxScore}</span>
          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', transform: expanded ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }}><ChevronRight size={14} /></span>
        </div>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.max(2, pct)}%`,
              background: getScoreColor(category.score, category.maxScore),
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </button>
      {expanded && (
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-muted)',
            borderRadius: 'var(--radius)',
            padding: 12,
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          {category.details.map((d, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                padding: '3px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              {d}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const radius = 90;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getGradeColor(grade);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="110"
          y="105"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="42"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {score}
        </text>
        <text
          x="110"
          y="135"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize="13"
          fontWeight="500"
        >
          / 100
        </text>
      </svg>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color,
          marginTop: -20,
          letterSpacing: '0.02em',
        }}
      >
        {grade}
      </div>
    </div>
  );
}

function MiniHistoryChart() {
  const { history } = useHealthStore();

  if (history.length < 2) return null;

  const points = [...history].reverse();
  const w = 300;
  const h = 60;
  const pad = 4;

  const pathD = points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1 || 1)) * (w - pad * 2);
      const y = pad + (1 - p.score / 100) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const lastScore = points[points.length - 1]?.score ?? 0;
  const color = getGradeColor(
    lastScore >= 90 ? 'Excellent' : lastScore >= 75 ? 'Good' : lastScore >= 55 ? 'Fair' : lastScore >= 35 ? 'Poor' : 'Critical'
  );

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: 'var(--text-secondary)' }}><TrendingUp size={14} /></span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Health Trend (24h)
        </span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function HealthView() {
  const { score, loading, fetchScore, fetchHistory } = useHealthStore();

  useEffect(() => {
    fetchScore();
    fetchHistory();
  }, [fetchScore, fetchHistory]);

  const lastUpdated = score?.timestamp
    ? new Date(score.timestamp).toLocaleString()
    : '—';

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--accent)' }}><Heart size={22} /></span>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Health Score</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Last updated: {lastUpdated}
          </span>
          <button
            className="btn btn-primary"
            onClick={() => {
              fetchScore();
              fetchHistory();
            }}
            style={{ gap: 6 }}
          >
            <span style={{ display: 'inline-flex' }}><RefreshCcw size={14} /></span>
            Refresh Score
          </button>
        </div>
      </div>

      {loading && !score ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <span style={{ marginBottom: 12, opacity: 0.5, display: 'inline-block' }}><RefreshCw size={32} /></span>
          <div>Calculating health score...</div>
        </div>
      ) : score ? (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ScoreGauge score={score.total} grade={score.grade} />
            <MiniHistoryChart />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CategoryBar label="CPU" icon={Cpu} category={score.categories.cpu} />
            <CategoryBar label="Memory" icon={CircuitBoard} category={score.categories.memory} />
            <CategoryBar label="Disk" icon={HardDrive} category={score.categories.disk} />
            <CategoryBar label="GPU" icon={Monitor} category={score.categories.gpu} />
            <CategoryBar label="Software" icon={AlertTriangle} category={score.categories.software} />
            <CategoryBar label="Updates" icon={RefreshCw} category={score.categories.updates} />
            <CategoryBar label="Alerts" icon={Bell} category={score.categories.alerts} />

            <div className="card" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: 'var(--accent)' }}><CheckCircle size={16} /></span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Recommendations</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {score.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      padding: '4px 0',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        background: 'var(--accent-muted)',
                        color: 'var(--accent)',
                        fontSize: 10,
                        fontWeight: 600,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          Unable to calculate health score. Check data sources.
        </div>
      )}
    </div>
  );
}
