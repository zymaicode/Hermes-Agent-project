interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 animate-fadeIn">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
