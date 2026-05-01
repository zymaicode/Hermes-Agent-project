import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useRepairStore, type RepairLogEntry } from '../stores/repairStore';

const RESULT_CONFIG = {
  success: { icon: CheckCircle2, color: 'var(--green)', label: '成功' },
  failed: { icon: XCircle, color: 'var(--red)', label: '失败' },
  partial: { icon: AlertTriangle, color: 'var(--yellow)', label: '部分成功' },
};

export default function RepairHistoryView() {
  const repairHistory = useRepairStore((s) => s.repairHistory);
  const fetchHistory = useRepairStore((s) => s.fetchHistory);
  const setState = useRepairStore((s) => s.setState);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="flex-col" style={{ height: '100%', padding: 24, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setState('idle')}
          className="btn"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1 }}>修复历史</h2>
        <button onClick={fetchHistory} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RotateCcw size={14} /> 刷新
        </button>
      </div>

      {repairHistory.length === 0 ? (
        <div
          className="flex-col"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Clock size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>暂无修复记录</div>
          <div style={{ fontSize: 13 }}>执行修复操作后，记录会显示在这里</div>
        </div>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {repairHistory.map((entry) => {
            const config = RESULT_CONFIG[entry.fixResult];
            const Icon = config.icon;
            const isExpanded = expandedId === entry.id;
            const time = new Date(entry.timestamp).toLocaleString('zh-CN');

            return (
              <div key={entry.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <Icon size={18} style={{ color: config.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                      {entry.issueTitle}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {time} · {entry.duration.toFixed(1)}s
                    </div>
                  </div>
                  <span
                    style={{
                      background: config.color,
                      color: entry.fixResult === 'partial' ? '#000' : '#fff',
                      borderRadius: 4,
                      padding: '1px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {config.label}
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      <div><strong>修复操作:</strong> {entry.fixAction}</div>
                      <div><strong>类别:</strong> {entry.category} · <strong>严重度:</strong> {entry.severity}</div>
                      <div><strong>用户批准:</strong> {entry.userApproved ? '是' : '否'}</div>
                      <div><strong>需要重启:</strong> {entry.requiresRestart ? '是' : '否'}</div>
                      {entry.adminElevated && <div><strong>管理员权限:</strong> 已提升</div>}
                      <div style={{ marginTop: 8 }}>
                        <strong>详细信息:</strong>
                        <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 11 }}>
                          {entry.details}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
