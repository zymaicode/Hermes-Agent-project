import { useState, useEffect } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import { useGameConfigStore } from '../../stores/gameConfigStore';
import type { GameOverlayConfig } from '../../../electron/game/gameConfig';

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export default function GameConfigEditor() {
  const { configs, editingConfig, loadConfigs, saveConfig, deleteConfig, setEditingConfig } = useGameConfigStore();
  const [newGameName, setNewGameName] = useState('');

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const handleSave = async () => {
    if (!editingConfig) return;
    await saveConfig(editingConfig);
    setEditingConfig(null);
  };

  const handleDelete = async (name: string) => {
    await deleteConfig(name);
    if (editingConfig?.gameName === name) setEditingConfig(null);
  };

  const createNew = () => {
    if (!newGameName.trim()) return;
    setEditingConfig({
      gameName: newGameName.trim(),
      showFps: true, showCpu: true, showGpu: true, showRam: true,
      opacity: 0.8, position: 'top-left', color: '#4fc3f7', fontSize: 14,
    });
    setNewGameName('');
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Overlay 配置库</h3>

      {/* Add new */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
          placeholder="输入游戏名称添加配置..."
          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit' }}
          onKeyDown={(e) => e.key === 'Enter' && createNew()}
        />
        <button className="btn btn-secondary" onClick={createNew} style={{ padding: '4px 10px', fontSize: 12 }}>
          <Plus size={12} /> 添加
        </button>
      </div>

      {/* Config list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {configs.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 16 }}>暂无自定义配置</p>}
        {configs.map((cfg) => (
          <div key={cfg.gameName} className="go-game-item" style={{ padding: '8px 12px' }}>
            <span style={{ flex: 1, fontSize: 13 }}>{cfg.gameName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 8 }}>
              {cfg.showFps ? 'FPS ' : ''}{cfg.showCpu ? 'CPU ' : ''}{cfg.showGpu ? 'GPU ' : ''}{cfg.showRam ? 'RAM' : ''}
            </span>
            <button onClick={() => setEditingConfig(cfg)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: '2px 6px' }}>编辑</button>
            <button onClick={() => handleDelete(cfg.gameName)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, padding: '2px 6px' }}><Trash2 size={12} /></button>
          </div>
        ))}
      </div>

      {/* Editor */}
      {editingConfig && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>{editingConfig.gameName} 配置</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['showFps', 'showCpu', 'showGpu', 'showRam'] as const).map((key) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={editingConfig[key]} onChange={() => setEditingConfig({ ...editingConfig, [key]: !editingConfig[key] })} />
                {{ showFps: '显示 FPS', showCpu: '显示 CPU', showGpu: '显示 GPU', showRam: '显示 内存' }[key]}
              </label>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>不透明度: {Math.round(editingConfig.opacity * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.1" value={editingConfig.opacity} onChange={(e) => setEditingConfig({ ...editingConfig, opacity: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>位置</label>
              <select value={editingConfig.position} onChange={(e) => setEditingConfig({ ...editingConfig, position: e.target.value as any })} style={{ width: '100%', padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 12 }}>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>颜色</label>
              <input type="color" value={editingConfig.color} onChange={(e) => setEditingConfig({ ...editingConfig, color: e.target.value })} style={{ width: '100%', height: 28 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>字号: {editingConfig.fontSize}px</label>
              <input type="range" min="10" max="24" value={editingConfig.fontSize} onChange={(e) => setEditingConfig({ ...editingConfig, fontSize: parseInt(e.target.value) })} style={{ width: '100%' }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 12, padding: '6px 16px', fontSize: 13 }}>
            <Save size={14} /> 保存配置
          </button>
        </div>
      )}
    </div>
  );
}
