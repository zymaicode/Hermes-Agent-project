import { Loader2 } from 'lucide-react';

export function SkeletonCard() {
  return <div className="card skeleton skeleton-card" />;
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex-col gap-1 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={size} className="spin" style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}

export function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {desc && <div className="empty-state-desc">{desc}</div>}
    </div>
  );
}
