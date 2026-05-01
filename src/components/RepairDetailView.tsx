import { useState } from 'react';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Info,
  Shield, RotateCcw, Terminal, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useRepairStore } from '../stores/repairStore';

const SEVERITY_CONFIG = {
  critical: { bg: 'var(--red)', color: '#fff', label: '严重', icon: XCircle },
  warning: { bg: 'var(--yellow)', color: '#000', label: '警告', icon: AlertTriangle },
  info: { bg: 'var(--accent)', color: '#fff', label: '信息', icon: Info },
};

const CATEGORY_LABELS: Record<string, string> = {
  display: '显示/显卡',
  performance: '性能',
  network: '网络',
  audio: '音频',
  peripherals: '外设',
  software: '软件',
  system: '系统',
};

export default function RepairDetailView() {
  const state = useRepairStore((s) => s.state);
  const selectedIssue = useRepairStore((s) => s.selectedIssue);
  const fixResult = useRepairStore((s) => s.fixResult);
  const createRestorePoint = useRepairStore((s) => s.createRestorePoint);
  const understandRisks = useRepairStore((s) => s.understandRisks);
  const setCreateRestorePoint = useRepairStore((s) => s.setCreateRestorePoint);
  const setUnderstandRisks = useRepairStore((s) => s.setUnderstandRisks);
  const executeFix = useRepairStore((s) => s.executeFix);
  const undoFix = useRepairStore((s) => s.undoFix);
  const setState = useRepairStore((s) => s.setState);
  const selectIssue = useRepairStore((s) => s.selectIssue);
  const resetToIdle = useRepairStore((s) => s.resetToIdle);
  const approveFix = useRepairStore((s) => s.approveFix);
  const cancelFix = useRepairStore((s) => s.cancelFix);
  const restartSystem = useRepairStore((s) => s.restartSystem);

  const [showCommands, setShowCommands] = useState(false);

  // FIXING state
  if (state === 'fixing') {
    return (
      <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '4px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 24,
          }}
        />
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>正在修复...</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          正在执行: {selectedIssue?.autoFixDescription}
        </p>
        <div style={{ width: 300 }}>
          <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: '60%',
                height: '100%',
                background: 'var(--accent)',
                borderRadius: 3,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        <button
          onClick={cancelFix}
          className="btn"
          style={{
            marginTop: 24,
            padding: '8px 20px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--red)',
            borderColor: 'var(--red)',
          }}
        >
          <XCircle size={14} /> 取消修复
        </button>
      </div>
    );
  }

  // DONE state
  if (state === 'done' && fixResult) {
    return (
      <div className="flex-col" style={{ height: '100%', padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => {
              if (selectedIssue) selectIssue(selectedIssue);
              else setState('results');
            }}
            className="btn"
            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={16} /> 返回
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1 }}>修复结果</h2>
        </div>

        <div
          className="card"
          style={{
            padding: 32,
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          {fixResult.success ? (
            <CheckCircle2 size={56} style={{ color: 'var(--green)', marginBottom: 16 }} />
          ) : (
            <XCircle size={56} style={{ color: 'var(--red)', marginBottom: 16 }} />
          )}

          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>
            {fixResult.success ? '修复成功' : '修复失败'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            {fixResult.message}
          </p>

          {/* Performed actions */}
          {fixResult.performedActions.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                执行的操作:
              </div>
              <div
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: 'var(--text-secondary)',
                }}
              >
                {fixResult.performedActions.map((action, i) => (
                  <div key={i}>
                    <span style={{ color: 'var(--green)', marginRight: 8 }}>{fixResult.success ? '✓' : '✗'}</span>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
            耗时: {fixResult.duration.toFixed(1)}秒
            {fixResult.requiresRestart && ' | 需要重启电脑'}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {fixResult.requiresRestart && (
              <button onClick={restartSystem} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                立即重启
              </button>
            )}
            {!fixResult.success && (
              <button onClick={undoFix} className="btn" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} /> 回滚更改
              </button>
            )}
            <button onClick={resetToIdle} className="btn" style={{ padding: '10px 20px' }}>
              完成
            </button>
          </div>
        </div>
      </div>
    );
  }

  // APPROVING state
  if (state === 'approving' && selectedIssue) {
    return (
      <div className="flex-col" style={{ height: '100%', padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => selectIssue(selectedIssue)}
            className="btn"
            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={16} /> 返回
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1 }}>确认修复操作</h2>
        </div>

        <div className="card" style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Shield size={20} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PCHelper 将执行以下操作:</span>
          </div>

          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius)',
              padding: '14px 18px',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{selectedIssue.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              {selectedIssue.autoFixDescription}
            </div>
            {selectedIssue.rollbackPlan && (
              <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                回滚计划: {selectedIssue.rollbackPlan}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={createRestorePoint}
                onChange={(e) => setCreateRestorePoint(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              修复前创建系统还原点 (推荐)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={understandRisks}
                onChange={(e) => setUnderstandRisks(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              我了解修复操作的性质并同意执行
            </label>
          </div>

          <button
            onClick={() => executeFix(selectedIssue.id)}
            className="btn btn-primary"
            disabled={!understandRisks}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              opacity: understandRisks ? 1 : 0.5,
            }}
          >
            执行修复
          </button>
        </div>
      </div>
    );
  }

  // DETAIL state (default)
  if (!selectedIssue) {
    return (
      <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: 'var(--text-secondary)' }}>未选择问题</p>
        <button onClick={() => setState('results')} className="btn" style={{ marginTop: 12 }}>
          返回结果列表
        </button>
      </div>
    );
  }

  const sev = SEVERITY_CONFIG[selectedIssue.severity];
  const SevIcon = sev.icon;

  return (
    <div className="flex-col" style={{ height: '100%', padding: 24, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setState('results')}
          className="btn"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1 }}>问题详情</h2>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
        {/* Header card */}
        <div
          className="card"
          style={{
            padding: 20,
            marginBottom: 16,
            borderLeft: `4px solid ${sev.bg}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                background: sev.bg,
                color: sev.color,
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {sev.label}
            </span>
            <span
              style={{
                background: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 12,
              }}
            >
              {CATEGORY_LABELS[selectedIssue.category] || selectedIssue.category}
            </span>
            {selectedIssue.requiresAdmin && (
              <span
                style={{
                  background: 'var(--yellow)',
                  color: '#000',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Shield size={10} /> 需管理员权限
              </span>
            )}
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{selectedIssue.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
            {selectedIssue.description}
          </p>
        </div>

        {/* Technical details */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              cursor: 'pointer',
            }}
            onClick={() => setShowCommands(!showCommands)}
          >
            <Terminal size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>技术详情</span>
            {showCommands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {showCommands && (
            <>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {selectedIssue.details}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                检测依据:
              </div>
              <div
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 14px',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  lineHeight: 1.8,
                }}
              >
                {selectedIssue.evidence.map((e, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary)' }}>
                    • {e}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fix options */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>修复选项</div>

          {selectedIssue.canAutoFix && (
            <div style={{ marginBottom: 14 }}>
              <button
                onClick={approveFix}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                自动修复
                <Info
                  size={16}
                  style={{ opacity: 0.6 }}
                />
              </button>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 4 }}>
                {selectedIssue.autoFixDescription}
              </div>
            </div>
          )}

          {selectedIssue.canGuideFix && (
            <div>
              <button
                className="btn"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                手动引导修复
              </button>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, paddingLeft: 4 }}>
                逐步引导您手动完成修复操作
              </div>
            </div>
          )}

          {!selectedIssue.canAutoFix && !selectedIssue.canGuideFix && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              此问题暂不支持自动修复，请参考技术详情中的信息手动处理。
            </div>
          )}
        </div>

        {/* Rollback info */}
        {selectedIssue.rollbackPlan && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              background: 'var(--accent-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={14} style={{ color: 'var(--accent)' }} />
            {selectedIssue.rollbackPlan}
          </div>
        )}
      </div>
    </div>
  );
}
