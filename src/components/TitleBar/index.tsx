import { useAppStore } from '../../stores/appStore';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  hardware: 'Hardware',
  software: 'Software',
  apps: 'App Manager',
  ai: 'AI Chat',
  settings: 'Settings',
};

export default function TitleBar() {
  const currentPage = useAppStore((s) => s.currentPage);
  const pageLabel = PAGE_LABELS[currentPage] || 'Dashboard';

  return (
    <div className="titlebar">
      <span className="titlebar-title">PCHelper</span>
      <span className="titlebar-page">{pageLabel}</span>
      <div className="titlebar-controls">
        <button
          className="titlebar-btn"
          onClick={() => window.pchelper.minimizeWindow()}
          aria-label="Minimize"
        >
          _
        </button>
        <button
          className="titlebar-btn"
          onClick={() => window.pchelper.maximizeWindow()}
          aria-label="Maximize"
        >
          □
        </button>
        <button
          className="titlebar-btn titlebar-btn-close"
          onClick={() => window.pchelper.closeWindow()}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
