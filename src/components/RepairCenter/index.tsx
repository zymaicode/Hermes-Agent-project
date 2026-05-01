import { Wrench, Play, MessageSquare, History, Shield, ArrowLeft } from 'lucide-react';
import { useRepairStore } from '../../stores/repairStore';
import RepairScanView from '../RepairScanView';
import RepairDetailView from '../RepairDetailView';
import RepairAIChat from '../RepairAIChat';
import RepairHistoryView from '../RepairHistoryView';

const CATEGORY_LABELS: Record<string, string> = {
  display: '显示',
  performance: '性能',
  network: '网络',
  audio: '音频',
  peripherals: '外设',
  software: '软件',
  system: '系统',
};

const SEVERITY_CONFIG = {
  critical: { bg: 'var(--red)', color: '#fff', label: '严重' },
  warning: { bg: 'var(--yellow)', color: '#000', label: '警告' },
  info: { bg: 'var(--accent)', color: '#fff', label: '信息' },
};

export default function RepairCenter() {
  const state = useRepairStore((s) => s.state);
  const scanResult = useRepairStore((s) => s.scanResult);
  const startScan = useRepairStore((s) => s.startScan);
  const selectIssue = useRepairStore((s) => s.selectIssue);
  const aiDiagnose = useRepairStore((s) => s.aiDiagnose);
  const aiDiagnosis = useRepairStore((s) => s.aiDiagnosis);
  const fetchHistory = useRepairStore((s) => s.fetchHistory);
  const analyzeBluescreen = useRepairStore((s) => s.analyzeBluescreen);
  const setState = useRepairStore((s) => s.setState);
  const resetToIdle = useRepairStore((s) => s.resetToIdle);

  if (state === 'scanning') return <RepairScanView />;
  if (state === 'detail' || state === 'approving' || state === 'fixing' || state === 'done') {
    return <RepairDetailView />;
  }
  if (state === 'ai_chat') return <RepairAIChat />;
  if (state === 'history') return <RepairHistoryView />;

  const issues = scanResult?.issues || [];

  if (state === 'results' && issues.length > 0) {
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const infoCount = issues.filter((i) => i.severity === 'info').length;

    const sorted = [...issues].sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    return (
      <div className="flex-col" style={{ height: '100%', padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={resetToIdle}
            className="btn"
            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={16} /> 返回
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, flex: 1 }}>扫描结果</h2>
          <button onClick={startScan} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={14} /> 重新扫描
          </button>
        </div>

        {/* Summary header */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            发现 {issues.length} 个问题
          </div>
          {criticalCount > 0 && (
            <span
              style={{
                background: SEVERITY_CONFIG.critical.bg,
                color: SEVERITY_CONFIG.critical.color,
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {criticalCount} 严重
            </span>
          )}
          {warningCount > 0 && (
            <span
              style={{
                background: SEVERITY_CONFIG.warning.bg,
                color: SEVERITY_CONFIG.warning.color,
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {warningCount} 警告
            </span>
          )}
          {infoCount > 0 && (
            <span
              style={{
                background: SEVERITY_CONFIG.info.bg,
                color: SEVERITY_CONFIG.info.color,
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {infoCount} 信息
            </span>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={async () => {
              await aiDiagnose();
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageSquare size={14} /> AI诊断
          </button>
          <button
            onClick={analyzeBluescreen}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Shield size={14} /> 蓝屏分析
          </button>
        </div>

        {/* AI Diagnosis summary */}
        {aiDiagnosis && (
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>
              AI诊断分析
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
              {aiDiagnosis.analysis}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              最可能的根本原因: {aiDiagnosis.likelyRootCause}
            </div>
          </div>
        )}

        {/* Issues list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((issue) => {
            const sev = SEVERITY_CONFIG[issue.severity];
            return (
              <div
                key={issue.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${sev.bg}`,
                }}
                onClick={() => selectIssue(issue)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = sev.bg;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      background: sev.bg,
                      color: sev.color,
                      borderRadius: 4,
                      padding: '1px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {sev.label}
                  </span>
                  <span
                    style={{
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                      borderRadius: 4,
                      padding: '1px 8px',
                      fontSize: 11,
                    }}
                  >
                    {CATEGORY_LABELS[issue.category] || issue.category}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{issue.title}</span>
                  {issue.canAutoFix && (
                    <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500 }}>
                      可自动修复
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 4 }}>
                  {issue.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // IDLE state — main landing
  return (
    <div className="flex-col" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--accent-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Wrench size={40} style={{ color: 'var(--accent)' }} />
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>一键修复中心</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
        全面扫描您的电脑，自动检测并修复常见问题。
        包括显示、性能、网络、音频、外设、软件和系统七大类别。
        所有修复操作都需要您确认后才能执行。
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <button
          onClick={startScan}
          className="btn btn-primary"
          style={{
            padding: '14px 32px',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderRadius: 'var(--radius)',
          }}
        >
          <Play size={20} /> 开始全面扫描
        </button>
        <button
          onClick={() => setState('ai_chat')}
          className="btn"
          style={{
            padding: '14px 24px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MessageSquare size={18} /> 询问AI助手
        </button>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 700 }}>
        {[
          { icon: <Shield size={18} />, title: '蓝屏分析', desc: '分析Minidump文件，诊断蓝屏原因' },
          { icon: <History size={18} />, title: '修复历史', desc: '查看过去的修复记录和日志' },
          { icon: <Wrench size={18} />, title: '安全可靠', desc: '所有修复需要确认，支持回滚' },
        ].map((card) => (
          <div
            key={card.title}
            className="card"
            style={{
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (card.title === '修复历史') fetchHistory();
              if (card.title === '蓝屏分析') analyzeBluescreen();
            }}
          >
            <div style={{ color: 'var(--accent)', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
