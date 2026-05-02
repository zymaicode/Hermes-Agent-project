import { useState } from 'react';
import { useAiDiagnosticStore } from '../../stores/aiDiagnosticStore';
import { Heart, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { AiDiagnosticSection, AiDiagnosticItem } from '../../../electron/ai/types';
import './AIDiagnostic.css';

export default function AIDiagnosticView() {
  const { report, loading, error, runDiagnostic } = useAiDiagnosticStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--green)';
    if (score >= 70) return 'var(--accent)';
    if (score >= 50) return 'var(--yellow)';
    if (score >= 30) return 'var(--orange)';
    return 'var(--red)';
  };

  const getGradeLabel = (grade: string) => {
    const labels: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
      critical: '危急',
    };
    return labels[grade] || grade;
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const icons: Record<string, React.ReactNode> = {
      ok: <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />,
      warning: <AlertTriangle size={16} style={{ color: 'var(--yellow)', flexShrink: 0 }} />,
      error: <XCircle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />,
    };
    return icons[status] || null;
  };

  if (loading) {
    return (
      <div className="ai-diagnostic">
        <div className="ai-diagnostic-loading">
          <RefreshCw size={32} className="spin-icon" />
          <p>正在体检系统...</p>
          <p className="loading-sub">正在采集硬件数据并进行分析</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-diagnostic">
        <div className="ai-diagnostic-error">
          <XCircle size={32} style={{ color: 'var(--red)' }} />
          <p>诊断失败</p>
          <p className="error-detail">{error}</p>
          <button className="btn btn-primary" onClick={runDiagnostic}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-diagnostic">
      <div className="ai-diagnostic-header">
        <h2>AI 系统体检</h2>
        <p className="subtitle">一键检测系统健康状况，获取优化建议</p>
      </div>

      {!report ? (
        <div className="ai-diagnostic-start">
          <Heart size={64} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <p>点击下方按钮开始系统全面体检</p>
          <p className="hint">将采集硬件数据并使用 AI 进行分析</p>
          <button className="btn btn-primary btn-lg" onClick={runDiagnostic}>
            开始体检
          </button>
        </div>
      ) : (
        <div className="ai-diagnostic-result">
          {/* Score */}
          <div className="score-section">
            <div className="score-circle" style={{ borderColor: getScoreColor(report.score) }}>
              <span className="score-value" style={{ color: getScoreColor(report.score) }}>
                {report.score}
              </span>
              <span className="score-label">分</span>
            </div>
            <div className="score-info">
              <span className="grade-badge" style={{ background: getScoreColor(report.score) }}>
                {getGradeLabel(report.grade)}
              </span>
              <p className="summary">{report.summary}</p>
              <p className="timestamp">
                {new Date(report.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="sections-list">
            {report.sections.map((section: AiDiagnosticSection) => {
              const isExpanded = expandedSections.has(section.title);
              const sectionColor = section.severity === 'critical' ? 'var(--red)' :
                section.severity === 'warning' ? 'var(--yellow)' : 'var(--green)';

              return (
                <div
                  key={section.title}
                  className={`section-card ${isExpanded ? 'expanded' : ''}`}
                >
                  <button
                    className="section-header"
                    onClick={() => toggleSection(section.title)}
                  >
                    <span className="section-indicator" style={{ background: sectionColor }} />
                    <span className="section-title">{section.title}</span>
                    <span className="section-count">
                      {section.items.filter((i: AiDiagnosticItem) => i.status !== 'ok').length} 个问题
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isExpanded && (
                    <div className="section-body">
                      {section.items.map((item: AiDiagnosticItem, idx: number) => (
                        <div key={idx} className="item-row">
                          <StatusIcon status={item.status} />
                          <div className="item-content">
                            <span className="item-label">{item.label}</span>
                            <span className="item-detail">{item.detail}</span>
                            {item.suggestion && (
                              <span className="item-suggestion">💡 {item.suggestion}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Re-run */}
          <div className="rerun-section">
            <button className="btn btn-secondary" onClick={runDiagnostic}>
              <RefreshCw size={14} /> 重新体检
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
