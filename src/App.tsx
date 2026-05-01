import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HardwareView from './components/HardwareView';
import SoftwareView from './components/SoftwareView';
import AIChatPanel from './components/AIChatPanel';
import SettingsView from './components/SettingsView';
import TitleBar from './components/TitleBar';
import { useAppStore } from './stores/appStore';
import { useHardwareStore } from './stores/hardwareStore';

function MainContent() {
  const { currentPage } = useAppStore();

  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;
    case 'hardware':
      return <HardwareView />;
    case 'software':
      return <SoftwareView />;
    case 'apps':
      return (
        <div className="flex items-center justify-center" style={{ height: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              App Manager — Coming in Phase 2
            </div>
          </div>
        </div>
      );
    case 'ai':
      return <AIChatPanel standalone />;
    case 'settings':
      return <SettingsView />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  const { chatPanelOpen } = useAppStore();
  const startPolling = useHardwareStore((s) => s.startPolling);
  const stopPolling = useHardwareStore((s) => s.stopPolling);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TitleBar />
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <MainContent />
        </div>
        {chatPanelOpen && <AIChatPanel />}
      </div>
    </div>
  );
}
