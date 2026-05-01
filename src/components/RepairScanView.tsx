import { Loader2, CheckCircle2, XCircle, Circle, AlertTriangle } from 'lucide-react';
import { useRepairStore } from '../stores/repairStore';

const DETECTOR_LABELS: Record<string, string> = {
  display: '显示/显卡',
  performance: '性能',
  network: '网络',
  audio: '音频',
  peripherals: '外设',
  software: '软件',
  system: '系统',
};

export default function RepairScanView() {
  const scanProgress = useRepairStore((s) => s.scanProgress);

  const pct = scanProgress?.pct ?? 0;
  const phase = scanProgress?.phase ?? '正在初始化...';
  const issuesFound = scanProgress?.issuesFound ?? 0;
  const currentCategory = scanProgress?.category;

  const checkedCategories = new Set<string>();
  if (currentCategory) {
    const order = ['display', 'performance', 'network', 'audio', 'peripherals', 'software', 'system'];
    const idx = order.indexOf(currentCategory);
    for (let i = 0; i < idx; i++) {
      checkedCategories.add(order[i]);
    }
  }

  return (
    <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ marginBottom: 32, position: 'relative' }}>
        <Loader2
          size={64}
          style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--accent)',
          }}
        >
          {pct}%
        </div>
      </div>

      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>正在扫描您的电脑...</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
        {phase}
      </p>

      {/* Progress bar */}
      <div style={{ width: 400, marginBottom: 32 }}>
        <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${pct}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 3,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Detector status */}
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(DETECTOR_LABELS).map(([key, label]) => {
          const isChecked = checkedCategories.has(key);
          const isCurrent = currentCategory === key;
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                background: isCurrent ? 'var(--accent-muted)' : 'transparent',
              }}
            >
              {isChecked ? (
                <CheckCircle2 size={18} style={{ color: 'var(--green)' }} />
              ) : isCurrent ? (
                <Loader2 size={18} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Circle size={18} style={{ color: 'var(--border-color)' }} />
              )}
              <span
                style={{
                  fontSize: 13,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  flex: 1,
                }}
              >
                {label}
              </span>
              {isChecked && (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>完成</span>
              )}
              {isCurrent && (
                <span style={{ fontSize: 11, color: 'var(--accent)' }}>检测中...</span>
              )}
            </div>
          );
        })}
      </div>

      {issuesFound > 0 && (
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--yellow)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={16} />
          已发现 {issuesFound} 个问题
        </div>
      )}
    </div>
  );
}
