type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

export function Badge({ variant = 'gray', children, pulse }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span className={`badge badge-${variant}${pulse ? ' animate-pulse-glow' : ''}`}>
      {children}
    </span>
  );
}
