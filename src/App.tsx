import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HardwareView from './components/HardwareView';
import SoftwareView from './components/SoftwareView';
import ConflictView from './components/ConflictView';
import AppManagerView from './components/AppManagerView';
import UpdateView from './components/UpdateView';
import AlertHistoryView from './components/AlertHistoryView';
import HealthView from './components/HealthView';
import AlertModal from './components/AlertModal';
import AIChatPanel from './components/AIChatPanel';
import SettingsView from './components/SettingsView';
import StartupView from './components/StartupView';
import NetworkView from './components/NetworkView';
import TemperatureView from './components/TemperatureView';
import ProcessView from './components/ProcessView';
import SystemInfoView from './components/SystemInfoView';
import BenchmarkView from './components/BenchmarkView';
import SchedulerView from './components/SchedulerView';
import FirewallView from './components/FirewallView';
import UsbView from './components/UsbView';
import DiskCleanupView from './components/DiskCleanupView';
import SecurityView from './components/SecurityView';
import ClipboardView from './components/ClipboardView';
import DriversView from './components/DriversView';
import ServicesView from './components/ServicesView';
import EventLogView from './components/EventLogView';
import BatteryView from './components/BatteryView';
import PerfLogView from './components/PerfLogView';
import RegistryView from './components/RegistryView';
import NetConnView from './components/NetConnView';
import FileTypeView from './components/FileTypeView';
import DisplayView from './components/DisplayView';
import PowerView from './components/PowerView';
import RestoreView from './components/RestoreView';
import FileScannerView from './components/FileScannerView';
import RemoteView from './components/RemoteView';
import ReportView from './components/ReportView';
import MemoryView from './components/MemoryView';
import FeaturesView from './components/FeaturesView';
import SoundView from './components/SoundView';
import FontView from './components/FontView';
import AccountsView from './components/AccountsView';
import RepairCenter from './components/RepairCenter';
import PerfOverlay from './components/PerfOverlay';
import TitleBar from './components/TitleBar';
import { useAppStore } from './stores/appStore';
import { useHardwareStore } from './stores/hardwareStore';

function MainContent() {
  const { currentPage } = useAppStore();

  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;
    case 'repair':
      return <RepairCenter />;
    case 'overlay':
      return <PerfOverlay />;
    case 'hardware':
      return <HardwareView />;
    case 'software':
      return <SoftwareView />;
    case 'apps':
      return <AppManagerView />;
    case 'conflicts':
      return <ConflictView />;
    case 'updates':
      return <UpdateView />;
    case 'alerts':
      return <AlertHistoryView />;
    case 'health':
      return <HealthView />;
    case 'ai':
      return <AIChatPanel standalone />;
    case 'settings':
      return <SettingsView />;
    case 'startup':
      return <StartupView />;
    case 'network':
      return <NetworkView />;
    case 'temperatures':
      return <TemperatureView />;
    case 'process':
      return <ProcessView />;
    case 'system':
      return <SystemInfoView />;
    case 'benchmark':
      return <BenchmarkView />;
    case 'scheduler':
      return <SchedulerView />;
    case 'firewall':
      return <FirewallView />;
    case 'usb':
      return <UsbView />;
    case 'diskcleanup':
      return <DiskCleanupView />;
    case 'security':
      return <SecurityView />;
    case 'clipboard':
      return <ClipboardView />;
    case 'drivers':
      return <DriversView />;
    case 'services':
      return <ServicesView />;
    case 'eventlog':
      return <EventLogView />;
    case 'battery':
      return <BatteryView />;
    case 'perflog':
      return <PerfLogView />;
    case 'registry':
      return <RegistryView />;
    case 'netconn':
      return <NetConnView />;
    case 'filetypes':
      return <FileTypeView />;
    case 'display':
      return <DisplayView />;
    case 'power':
      return <PowerView />;
    case 'restore':
      return <RestoreView />;
    case 'filescanner':
      return <FileScannerView />;
    case 'remote':
      return <RemoteView />;
    case 'report':
      return <ReportView />;
    case 'memory':
      return <MemoryView />;
    case 'features':
      return <FeaturesView />;
    case 'sounds':
      return <SoundView />;
    case 'fonts':
      return <FontView />;
    case 'accounts':
      return <AccountsView />;
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
      <AlertModal />
    </div>
  );
}
