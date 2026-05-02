import { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ProcessAnalysisResult } from '../../../electron/ai/behaviorAnalyzer';

interface Props {
  proc: { name: string; pid: number; cpuPercent: number; memoryMB: number; status?: string; path?: string; user?: string; startTime?: string };
  onClose: () => void;
}

export default function AIAnalysisModal({ proc, onClose }: Props) {
  const [result, setResult] = useState<ProcessAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await window.pchelper.analyzeProcess({
          name: proc.name,
          pid: proc.pid,
          cpu: proc.cpuPercent,
          memory: proc.memoryMB,
          status: proc.status || 'running',
          path: proc.path,
          user: proc.user,
          startTime: proc.startTime,
        });
        setResult(res);
      } catch (err: any) {
        setError(err.message || '分析失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [proc]);

  const getVerdictIcon = () => {
    if (!result) return null;
    switch (result.verdict) {
      case 'normal': return <CheckCircle size={24} style={{ color: 'var(--green)' }} />;
      case 'suspicious': return <AlertTriangle size={24} style={{ color: 'var(--yellow)' }} />;
      case 'warning': return <Info size={24} style={{ color: 'var(--orange)' }} />;
      case 'critical': return <AlertTriangle size={24} style={{ color: 'var(--red)' }} />;
    }
  };

  const getVerdictLabel = () => {
    if (!result) return '';
    const labels: Record<string, string> = { normal: '正常', suspicious: '可疑', warning: '警告', critical: '危险' };
    return labels[result.verdict] || result.verdict;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <span className="modal-title">AI 进程分析 — {proc.name}</span>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
              <div style={{ margin: '0 auto 12px', fontSize: 24 }}>⏳</div>
              <p>AI 正在分析进程行为...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--red)' }}>
              <p>分析失败：{error}</p>
            </div>
          ) : result ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                {getVerdictIcon()}
                <div>
                  <strong style={{ fontSize: 16 }}>{getVerdictLabel()}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{result.summary}</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>详细分析</h4>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{result.analysis}</p>
              </div>

              {result.suggestions.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>建议</h4>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
