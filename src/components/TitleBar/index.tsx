import { useState, useEffect, useCallback } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import iconUrl from '../../../assets/icon_16x16.png';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  hardware: 'Hardware',
  software: 'Software',
  apps: 'App Manager',
  health: 'Health Score',
  ai: 'AI Chat',
  settings: 'Settings',
  registry: 'Registry Viewer',
  netconn: 'Network Connections',
  filetypes: 'File Type Manager',
  display: 'Display Information',
  power: 'Power Plan Manager',
};

export default function TitleBar() {
  const currentPage = useAppStore((s) => s.currentPage);
  const pageLabel = PAGE_LABELS[currentPage] || 'Dashboard';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.pchelper.isMaximized().then(setIsMaximized);
    const unsub = window.pchelper.onWindowStateChange(setIsMaximized);
    return unsub;
  }, []);

  const handleToggleMaximize = useCallback(() => {
    window.pchelper.maximizeWindow();
  }, []);

  return (
    <div className="titlebar" onDoubleClick={handleToggleMaximize}>
      <div className="titlebar-left">
        <img src={iconUrl} alt="" className="titlebar-icon" />
        <span className="titlebar-brand">PCHelper</span>
      </div>
      <span className="titlebar-page">{pageLabel}</span>
      <div className="titlebar-controls">
        <button
          className="titlebar-btn"
          onClick={() => window.pchelper.minimizeWindow()}
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="titlebar-btn"
          onClick={handleToggleMaximize}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy size={13} /> : <Square size={13} />}
        </button>
        <button
          className="titlebar-btn titlebar-btn-close"
          onClick={() => window.pchelper.closeWindow()}
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
