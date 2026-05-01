interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ icon, label, value, unit, color, trend }: StatCardProps) {
  return (
    <div className="card animate-slideUp" style={{ animationFillMode: 'both' }}>
      <div className="flex items-center gap-3">
        <div className="stat-icon" style={{ color: color || 'var(--accent)' }}>
          {icon}
        </div>
        <div>
          <div className="stat-value">
            {value}
            {unit && <span className="stat-unit">{unit}</span>}
          </div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}
