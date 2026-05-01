import { useEffect, useState, useMemo } from 'react';
import {
  Package, RefreshCw, ToggleLeft, ToggleRight, X, AlertTriangle,
  Search, CheckCircle, XCircle, Info, Monitor, Zap,
} from 'lucide-react';
import { useFeaturesStore } from '../../stores/featuresStore';
import { Badge } from '../common/Badge';
import type { WindowsFeature } from '../../../electron/features/manager';

function FeatureCard({
  feature,
  onToggle,
  onDetail,
}: {
  feature: WindowsFeature;
  onToggle: () => void;
  onDetail: () => void;
}) {
  return (
    <div
      className="card animate-fadeIn"
      style={{
        padding: 16,
        cursor: 'pointer',
        borderLeft: feature.enabled ? '4px solid var(--green)' : '4px solid transparent',
      }}
      onClick={onDetail}
    >
      <div className="flex items-start justify-between mb-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }} className="truncate">
            {feature.displayName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }} className="truncate">
            {feature.description}
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={{ marginLeft: 8, flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {feature.enabled ? (
            <><ToggleRight size={14} style={{ color: 'var(--green)' }} /> Enabled</>
          ) : (
            <><ToggleLeft size={14} style={{ color: 'var(--text-secondary)' }} /> Disabled</>
          )}
        </button>
      </div>
      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
        <Badge variant={feature.enabled ? 'green' : 'gray'}>
          {feature.installState.replace(/_/g, ' ')}
        </Badge>
        <Badge variant="blue">{feature.category}</Badge>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{feature.sizeMB} MB</span>
        {feature.restartRequired && (
          <Badge variant="yellow">Restart required</Badge>
        )}
        {feature.isCritical && (
          <Badge variant="red">Critical</Badge>
        )}
      </div>
    </div>
  );
}

export default function FeaturesView() {
  const features = useFeaturesStore((s) => s.features);
  const categories = useFeaturesStore((s) => s.categories);
  const installSize = useFeaturesStore((s) => s.installSize);
  const loading = useFeaturesStore((s) => s.loading);
  const fetchAll = useFeaturesStore((s) => s.fetchAll);
  const toggleFeature = useFeaturesStore((s) => s.toggleFeature);
  const getFeatureDetails = useFeaturesStore((s) => s.getFeatureDetails);

  const [activeCategory, setActiveCategory] = useState('All');
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<WindowsFeature | null>(null);
  const [detailData, setDetailData] = useState<Awaited<ReturnType<typeof getFeatureDetails>>>(null);
  const [confirmModal, setConfirmModal] = useState<{ feature: WindowsFeature; enable: boolean } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const filteredFeatures = useMemo(() => {
    let list = features;
    if (activeCategory !== 'All') list = list.filter((f) => f.category === activeCategory);
    if (showEnabledOnly) list = list.filter((f) => f.enabled);
    if (search) list = list.filter((f) => f.displayName.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [features, activeCategory, showEnabledOnly, search]);

  const enabledCount = useMemo(() => features.filter((f) => f.enabled).length, [features]);
  const disabledCount = useMemo(() => features.filter((f) => !f.enabled).length, [features]);

  const handleDetail = async (feature: WindowsFeature) => {
    setSelectedFeature(feature);
    const details = await getFeatureDetails(feature.name);
    setDetailData(details);
  };

  const handleToggle = (feature: WindowsFeature, enable: boolean) => {
    setConfirmModal({ feature, enable });
  };

  const confirmToggle = async () => {
    if (!confirmModal) return;
    const result = await toggleFeature(confirmModal.feature.name, confirmModal.enable);
    setConfirmModal(null);
    setToastMsg(result.message);
    setTimeout(() => setToastMsg(null), 3000);
    if (result.success) await fetchAll();
  };

  if (loading && features.length === 0) {
    return (
      <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Windows Features</h2>
        </div>
        <div className="empty-state"><div className="empty-state-title">Loading features...</div></div>
      </div>
    );
  }

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Windows Features</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={fetchAll}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-3" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total Features</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{features.length}</div>
        </div>
        <div className="card" style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Enabled</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{enabledCount}</div>
        </div>
        <div className="card" style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Disabled</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>{disabledCount}</div>
        </div>
        {installSize && (
          <div className="card" style={{ padding: '10px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Install Size (Enabled)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{installSize.totalEnabledMB} MB</div>
          </div>
        )}
      </div>

      {/* Search + Toggle */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <button
          className={`btn btn-sm ${showEnabledOnly ? 'btn-primary' : ''}`}
          onClick={() => setShowEnabledOnly(!showEnabledOnly)}
        >
          {showEnabledOnly ? 'Showing Enabled' : 'Show Enabled Only'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="tabs mb-3" style={{ flexWrap: 'wrap' }}>
        <button
          key="All"
          className={`tab ${activeCategory === 'All' ? 'active' : ''}`}
          onClick={() => setActiveCategory('All')}
          style={{ fontSize: 12 }}
        >
          All ({features.length})
        </button>
        {categories.map((cat) => {
          const count = features.filter((f) => f.category === cat).length;
          return (
            <button
              key={cat}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ fontSize: 12 }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Main content: feature grid + detail panel */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ flex: selectedFeature ? 1 : 1, overflow: 'auto' }}>
          {filteredFeatures.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-title">No features found</div>
              <div className="empty-state-desc">Try changing your filter or search criteria</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filteredFeatures.map((f) => (
                <FeatureCard
                  key={f.name}
                  feature={f}
                  onToggle={() => handleToggle(f, !f.enabled)}
                  onDetail={() => handleDetail(f)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedFeature && detailData && (
          <div className="card animate-slideLeft" style={{ width: 380, flexShrink: 0, padding: 20, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>{selectedFeature.displayName}</h3>
              <button className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }} onClick={() => setSelectedFeature(null)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              {selectedFeature.description}
            </p>

            <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <Badge variant={selectedFeature.enabled ? 'green' : 'gray'}>{selectedFeature.installState.replace(/_/g, ' ')}</Badge>
              <Badge variant="blue">{selectedFeature.featureType}</Badge>
              <Badge variant="purple">{selectedFeature.category}</Badge>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedFeature.sizeMB} MB</span>
            </div>

            {selectedFeature.restartRequired && (
              <div className="flex items-center gap-2 mb-3" style={{ padding: '8px 12px', background: 'rgba(210, 153, 34, 0.1)', borderRadius: 6, fontSize: 12, color: 'var(--yellow)' }}>
                <AlertTriangle size={14} /> A system restart is required after changing this feature
              </div>
            )}

            {selectedFeature.isCritical && (
              <div className="flex items-center gap-2 mb-3" style={{ padding: '8px 12px', background: 'rgba(248, 81, 73, 0.1)', borderRadius: 6, fontSize: 12, color: 'var(--red)' }}>
                <Info size={14} /> System-critical feature — cannot be disabled
              </div>
            )}

            {selectedFeature.dependsOn.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Dependencies</div>
                {selectedFeature.dependsOn.map((d) => (
                  <div key={d} style={{ fontSize: 11, padding: '2px 0', color: 'var(--accent)' }}>{d}</div>
                ))}
              </div>
            )}

            {selectedFeature.dependentFeatures.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Depends On This</div>
                {selectedFeature.dependentFeatures.map((d) => (
                  <div key={d} style={{ fontSize: 11, padding: '2px 0', color: 'var(--accent)' }}>{d}</div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Technical Details</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                <div>Registry: {detailData.registryPath}</div>
                <div>Image: {detailData.imagePath}</div>
                <div>Log: {detailData.logPath}</div>
                <div>Installed: {detailData.installDate || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={() => handleToggle(selectedFeature, !selectedFeature.enabled)}
              >
                {selectedFeature.enabled ? 'Disable' : 'Enable'}
              </button>
              <button className="btn" onClick={() => setSelectedFeature(null)}>Close</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {confirmModal.enable ? 'Enable' : 'Disable'} "{confirmModal.feature.displayName}"?
              </div>
              <button className="modal-close" onClick={() => setConfirmModal(null)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {confirmModal.feature.description}
            </p>
            {confirmModal.feature.dependsOn.length > 0 && confirmModal.enable && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: 'var(--yellow)' }}>The following dependencies will also be enabled:</span>
                <div style={{ marginTop: 4 }}>
                  {confirmModal.feature.dependsOn.map((d) => (
                    <div key={d} style={{ color: 'var(--accent)', fontSize: 11 }}>{d}</div>
                  ))}
                </div>
              </div>
            )}
            {confirmModal.feature.restartRequired && (
              <div style={{ padding: '8px 12px', background: 'rgba(210, 153, 34, 0.1)', borderRadius: 6, marginBottom: 12, fontSize: 12 }}>
                <AlertTriangle size={14} style={{ color: 'var(--yellow)', marginRight: 4, display: 'inline' }} />
                <span style={{ color: 'var(--yellow)' }}>A system restart may be required after this operation.</span>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className={`btn ${confirmModal.enable ? 'btn-success' : 'btn-danger'}`} onClick={confirmToggle}>
                {confirmModal.enable ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 'var(--z-toast)',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
          padding: '10px 20px', borderRadius: 8, fontSize: 13, boxShadow: 'var(--shadow-lg)',
          animation: 'slideInUp var(--transition-normal) both',
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
