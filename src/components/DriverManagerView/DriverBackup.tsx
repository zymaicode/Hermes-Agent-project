import { useState, useEffect } from 'react';
import { Archive, Trash2, RotateCcw, HardDrive, Calendar, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useDriverManagerStore } from '../../stores/driverManagerStore';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function DriverBackup() {
  const backups = useDriverManagerStore((s) => s.backups);
  const backupLoading = useDriverManagerStore((s) => s.backupLoading);
  const fetchBackups = useDriverManagerStore((s) => s.fetchBackups);
  const createBackup = useDriverManagerStore((s) => s.createBackup);
  const restoreBackup = useDriverManagerStore((s) => s.restoreBackup);
  const deleteBackup = useDriverManagerStore((s) => s.deleteBackup);
  const drivers = useDriverManagerStore((s) => s.drivers);
  const selectedDriverIds = useDriverManagerStore((s) => s.selectedDriverIds);

  const [backupName, setBackupName] = useState('');
  const [backupDesc, setBackupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedBackup, setExpandedBackup] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreate = async () => {
    if (!backupName.trim()) return;
    setCreating(true);
    const ids = selectedDriverIds.length > 0 ? selectedDriverIds : undefined;
    await createBackup(backupName.trim(), ids);
    setBackupName('');
    setBackupDesc('');
    setCreating(false);
  };

  const handleRestore = async (backupId: string) => {
    setRestoring(backupId);
    const result = await restoreBackup(backupId);
    setRestoreResult(result);
    setRestoring(null);
    setTimeout(() => setRestoreResult(null), 4000);
  };

  const handleDelete = async (backupId: string) => {
    await deleteBackup(backupId);
    setConfirmDelete(null);
    setExpandedBackup(null);
  };

  const getDriversForBackup = (backupId: string) => {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return [];
    return backup.driverIds.map((name) => drivers.find((d) => d.name === name)).filter(Boolean);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* Existing backups */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Archive size={16} />
          现有备份 ({backups.length})
        </h3>

        {restoreResult && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            marginBottom: 12,
            background: restoreResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${restoreResult.success ? 'var(--green)' : 'var(--red)'}`,
            color: restoreResult.success ? 'var(--green)' : 'var(--red)',
            fontSize: 12,
          }}>
            {restoreResult.message}
          </div>
        )}

        {backupLoading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 20, textAlign: 'center' }}>加载中...</div>
        ) : backups.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 20, textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
            暂无备份记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {backups.map((backup) => (
              <div key={backup.id} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{backup.name}</div>
                      {backup.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{backup.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setExpandedBackup(expandedBackup === backup.id ? null : backup.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                      >
                        {expandedBackup === backup.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} /> {new Date(backup.date).toLocaleDateString('zh-CN')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Package size={11} /> {backup.driverCount} 个驱动
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HardDrive size={11} /> {formatSize(backup.totalSize)}
                    </span>
                  </div>

                  {confirmDelete === backup.id ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
                      <span style={{ color: 'var(--red)' }}>确认删除？</span>
                      <button
                        onClick={() => handleDelete(backup.id)}
                        style={{
                          padding: '2px 10px',
                          background: 'var(--red)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontFamily: 'inherit',
                        }}
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          padding: '2px 10px',
                          background: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontFamily: 'inherit',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleRestore(backup.id)}
                        disabled={restoring === backup.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          background: 'rgba(59,130,246,0.12)',
                          border: '1px solid var(--accent)',
                          borderRadius: 4,
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontFamily: 'inherit',
                          opacity: restoring === backup.id ? 0.5 : 1,
                        }}
                      >
                        <RotateCcw size={12} /> {restoring === backup.id ? '还原中...' : '还原'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(backup.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid var(--red)',
                          borderRadius: 4,
                          color: 'var(--red)',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontFamily: 'inherit',
                        }}
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  )}
                </div>

                {expandedBackup === backup.id && (
                  <div style={{ borderTop: '1px solid var(--border-muted)', padding: '10px 14px', maxHeight: 200, overflow: 'auto' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>包含的驱动 ({backup.driverIds.length}):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {backup.driverIds.map((name) => (
                        <span key={name} style={{
                          padding: '2px 8px',
                          background: 'rgba(59,130,246,0.08)',
                          borderRadius: 4,
                          fontSize: 10,
                          color: 'var(--accent)',
                          fontFamily: 'monospace',
                        }}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create new backup */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>创建新备份</h3>
        <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>备份名称 *</label>
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="例如: 显示驱动备份"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>描述（可选）</label>
            <input
              type="text"
              value={backupDesc}
              onChange={(e) => setBackupDesc(e.target.value)}
              placeholder="简短描述此备份"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            {selectedDriverIds.length > 0
              ? `已选择 ${selectedDriverIds.length} 个驱动进行备份`
              : '未选择驱动 — 将备份所有驱动'}
          </div>

          <button
            onClick={handleCreate}
            disabled={!backupName.trim() || creating}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '10px 16px',
              background: backupName.trim() ? 'var(--accent)' : 'var(--bg-hover)',
              border: `1px solid ${backupName.trim() ? 'var(--accent)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius)',
              color: backupName.trim() ? '#fff' : 'var(--text-muted)',
              cursor: backupName.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: 500,
              opacity: creating ? 0.6 : 1,
            }}
          >
            <Archive size={14} />
            {creating ? '创建中...' : '创建备份'}
          </button>
        </div>
      </div>
    </div>
  );
}
