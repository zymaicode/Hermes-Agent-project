import { useEffect } from 'react';
import { useGameOptimizerStore } from '../../stores/gameOptimizerStore';
import type { OptimizationStatus } from '../../../electron/game/types';
import { Zap, RotateCcw, CheckCircle, List, Loader2, Gamepad2 } from 'lucide-react';
import './GameOptimizer.css';

const STATUS_LABELS: Record<OptimizationStatus, string> = {
  idle: '待机',
  optimizing: '正在优化...',
  optimized: '已优化',
  restoring: '正在恢复...',
  restored: '已恢复',
};

const STATUS_COLORS: Record<OptimizationStatus, string> = {
  idle: 'var(--text-secondary)',
  optimizing: 'var(--accent)',
  optimized: 'var(--green)',
  restoring: 'var(--yellow)',
  restored: 'var(--accent)',
};

export default function GameOptimizerView() {
  const { status, detectedGames, optimizationSnapshot, detectGames, optimize, restore } = useGameOptimizerStore();

  useEffect(() => {
    detectGames();
  }, [detectGames]);

  const statusLabel = STATUS_LABELS[status];
  const statusColor = STATUS_COLORS[status];

  return (
    <div className="game-optimizer">
      <div className="go-header">
        <h2><Gamepad2 size={20} /> 游戏优化模式</h2>
        <p className="go-subtitle">一键优化系统资源，提升游戏性能</p>
      </div>

      <div className="go-status-card">
        <div className="go-status-icon" style={{ borderColor: statusColor }}>
          {status === 'optimizing' || status === 'restoring'
            ? <Loader2 size={24} className="spin-icon" />
            : status === 'optimized'
              ? <CheckCircle size={24} style={{ color: 'var(--green)' }} />
              : <Zap size={24} style={{ color: 'var(--accent)' }} />
          }
        </div>
        <div>
          <div className="go-status-label" style={{ color: statusColor }}>{statusLabel}</div>
          {status === 'optimized' && optimizationSnapshot && (
            <div className="go-status-detail">
              暂停 {optimizationSnapshot.suspendedServices?.length || 0} 个服务 · 关闭 {optimizationSnapshot.terminatedProcesses?.length || 0} 个进程
            </div>
          )}
        </div>
      </div>

      <div className="go-section">
        <h3><List size={16} /> 检测到的游戏</h3>
        {detectedGames.length === 0 ? (
          <p className="go-empty">未检测到正在运行的游戏</p>
        ) : (
          <div className="go-game-list">
            {detectedGames.map((g) => (
              <div key={g.pid} className="go-game-item">
                <Gamepad2 size={16} style={{ color: 'var(--accent)' }} />
                <span>{g.name}</span>
                <span className="go-pid">PID: {g.pid}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="go-actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={optimize}
          disabled={status === 'optimizing' || status === 'optimized'}
          style={{ opacity: (status === 'optimizing' || status === 'optimized') ? 0.5 : 1 }}
        >
          {status === 'optimized' ? '已优化' : status === 'optimizing' ? '优化中...' : '一键优化'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={restore}
          disabled={status !== 'optimized'}
          style={{ opacity: status !== 'optimized' ? 0.5 : 1 }}
        >
          <RotateCcw size={14} /> 恢复
        </button>
      </div>

      <div className="go-section">
        <h3>优化内容</h3>
        <ul className="go-optimize-list">
          <li>暂停非关键系统服务（Windows更新、搜索、同步等）</li>
          <li>关闭后台浏览器和通讯软件</li>
          <li>切换电源计划为高性能模式</li>
          <li>游戏退出后自动恢复所有设置</li>
        </ul>
      </div>
    </div>
  );
}
