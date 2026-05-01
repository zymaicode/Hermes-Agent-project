import { useEffect, useState } from 'react';
import {
  Zap, Battery, Leaf, Sun, ChevronDown, ChevronRight,
  Check, AlertTriangle, RefreshCw, Settings, TrendingUp,
} from 'lucide-react';
import { usePowerStore } from '../../stores/powerStore';

function planColor(plan: { isHighPerformance: boolean; isBalanced: boolean; isPowerSaver: boolean }): string {
  if (plan.isHighPerformance) return 'var(--orange)';
  if (plan.isPowerSaver) return 'var(--blue)';
  return 'var(--green)';
}

function planIcon(plan: { isHighPerformance: boolean; isBalanced: boolean; isPowerSaver: boolean }) {
  if (plan.isHighPerformance) return <Zap size={20} />;
  if (plan.isPowerSaver) return <Leaf size={20} />;
  return <Sun size={20} />;
}

function planBg(plan: { isHighPerformance: boolean; isBalanced: boolean; isPowerSaver: boolean }): string {
  if (plan.isHighPerformance) return 'linear-gradient(135deg, #ff6b3515, #ff6b3505)';
  if (plan.isPowerSaver) return 'linear-gradient(135deg, #4da6ff15, #4da6ff05)';
  return 'linear-gradient(135deg, #3fb95015, #3fb95005)';
}

export default function PowerView() {
  const plans = usePowerStore((s) => s.plans);
  const report = usePowerStore((s) => s.report);
  const loading = usePowerStore((s) => s.loading);
  const fetchPlans = usePowerStore((s) => s.fetchPlans);
  const fetchReport = usePowerStore((s) => s.fetchReport);
  const setActivePlan = usePowerStore((s) => s.setActivePlan);

  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [confirmSwitch, setConfirmSwitch] = useState<string | null>(null);

  useEffect(() => { fetchPlans(); fetchReport(); }, [fetchPlans, fetchReport]);

  const activePlan = plans.find((p) => p.isActive);
  const selectedPlan = expandedPlan ? plans.find((p) => p.guid === expandedPlan) : null;

  const handleSwitchPlan = async (guid: string) => {
    const result = await setActivePlan(guid);
    if (result.success) {
      fetchPlans();
      fetchReport();
      setConfirmSwitch(null);
    }
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((p) => ({ ...p, [name]: !p[name] }));
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Power Plan Manager</h2>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { fetchPlans(); fetchReport(); }}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />Refresh
          </button>
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }}>
            <Settings size={14} style={{ marginRight: 4 }} /> Restore Defaults
          </button>
        </div>
      </div>

      {/* Active plan banner */}
      {activePlan && (
        <div className="card" style={{
          padding: 20, marginBottom: 16,
          background: planBg(activePlan),
          borderColor: planColor(activePlan) + '44',
        }}>
          <div className="flex items-center gap-4">
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: planColor(activePlan) + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: planColor(activePlan),
            }}>
              {planIcon(activePlan)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 mb-1">
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{activePlan.name}</h3>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 10,
                  background: planColor(activePlan) + '22', color: planColor(activePlan), fontWeight: 600,
                }}>
                  ACTIVE
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activePlan.description}</div>
            </div>
          </div>

          {report && (
            <div className="flex items-center gap-3 mt-3" style={{ flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Battery size={16} style={{ color: 'var(--green)' }} />
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Remaining</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{report.batteryLifeRemaining}</div>
                </div>
              </div>
              <div className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>With Current Plan</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{report.estimatedBatteryLife}</div>
                </div>
              </div>
              <div className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Leaf size={16} style={{ color: 'var(--blue)' }} />
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Optimized (Power Saver)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{report.estimatedBatteryLifeOptimized}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan selector cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {plans.map((plan) => (
          <div
            key={plan.guid}
            className="card"
            style={{
              padding: 16, cursor: 'pointer',
              borderColor: plan.isActive ? planColor(plan) : undefined,
              borderWidth: plan.isActive ? 2 : 1,
              background: planBg(plan),
            }}
            onClick={() => setExpandedPlan(expandedPlan === plan.guid ? null : plan.guid)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: planColor(plan) }}>{planIcon(plan)}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{plan.name}</span>
              {plan.isActive && <Check size={14} style={{ color: planColor(plan), marginLeft: 'auto' }} />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {plan.description.slice(0, 80)}...
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              {plan.settings.length} setting groups
            </div>
            {!plan.isActive && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10, padding: '6px 12px', fontSize: 11 }}
                onClick={(e) => { e.stopPropagation(); setConfirmSwitch(plan.guid); }}
              >
                Apply This Plan
              </button>
            )}
            {confirmSwitch === plan.guid && (
              <div style={{ marginTop: 8, fontSize: 11 }}>
                <p style={{ marginBottom: 6, color: 'var(--yellow)' }}>Switch to "{plan.name}" power plan?</p>
                <div className="flex items-center gap-2">
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 10 }} onClick={() => handleSwitchPlan(plan.guid)}>Confirm</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setConfirmSwitch(null); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings detail (when a plan is selected) */}
      {selectedPlan && (
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {selectedPlan.name} — Power Settings
          </h3>
          {selectedPlan.settings.map((group) => {
            const isExpanded = expandedGroups[group.category] !== false; // default expanded
            return (
              <div key={group.category} style={{ marginBottom: 8 }}>
                <button
                  className="btn"
                  style={{
                    width: '100%', padding: '8px 12px', justifyContent: 'flex-start', gap: 8,
                    fontWeight: 600, fontSize: 12, background: 'var(--bg-hover)',
                  }}
                  onClick={() => toggleGroup(group.category)}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {group.category}
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                    {group.settings.length} settings
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ padding: '4px 0' }}>
                    {group.settings.map((s) => (
                      <div key={s.name} style={{
                        display: 'grid', gridTemplateColumns: '1fr 200px 80px',
                        padding: '8px 12px 8px 32px', borderBottom: '1px solid var(--border-color)',
                        fontSize: 11, alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 500 }}>{s.name}</span>
                            {s.isCritical && <AlertTriangle size={12} style={{ color: 'var(--yellow)' }} />}
                            {s.isBatterySetting && <Battery size={10} style={{ color: 'var(--accent)' }} />}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>{s.description}</div>
                        </div>
                        <select
                          className="input"
                          style={{ fontSize: 10, padding: '3px 8px' }}
                          value={s.currentValue}
                          onChange={() => {}}
                        >
                          {s.possibleValues.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'right' }}>
                          {s.isBatterySetting ? 'On Battery' : 'Plugged In'}
                        </div>
                      </div>
                    ))}
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
