import type { StartupEntry, StartupImpact } from '../../src/utils/types';

const SIMULATED_STARTUP_APPS: StartupEntry[] = [
  { name: 'Microsoft Defender Antivirus', path: 'C:\\Program Files\\Microsoft Defender\\MsMpEng.exe', enabled: true, type: 'service', publisher: 'Microsoft Corporation', description: 'Real-time protection against malware and viruses', startupImpact: 'medium' },
  { name: 'Realtek HD Audio Manager', path: 'C:\\Program Files\\Realtek\\Audio\\HDA\\RtkAudioService64.exe', enabled: true, type: 'service', publisher: 'Realtek Semiconductor', description: 'Audio driver and control panel service', startupImpact: 'low' },
  { name: 'NVIDIA Display Container LS', path: 'C:\\Program Files\\NVIDIA Corporation\\Display.NvContainer\\NVDisplay.Container.exe', enabled: true, type: 'service', publisher: 'NVIDIA Corporation', description: 'NVIDIA graphics driver service', startupImpact: 'low' },
  { name: 'Google Update Core', path: 'C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe', enabled: true, type: 'scheduled_task', publisher: 'Google LLC', description: 'Automatic update checker for Google products', startupImpact: 'medium' },
  { name: 'OneDrive', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe', enabled: true, type: 'startup_folder', publisher: 'Microsoft Corporation', description: 'Cloud storage sync and file backup', startupImpact: 'high' },
  { name: 'Steam Client Bootstrapper', path: 'C:\\Program Files (x86)\\Steam\\Steam.exe', enabled: true, type: 'registry', publisher: 'Valve Corporation', description: 'Gaming platform launcher', startupImpact: 'high' },
  { name: 'Adobe Creative Cloud', path: 'C:\\Program Files\\Adobe\\Adobe Creative Cloud\\ACC\\CreativeCloud.exe', enabled: true, type: 'registry', publisher: 'Adobe Inc.', description: 'Creative suite updater and cloud sync', startupImpact: 'high' },
  { name: 'Java Update Scheduler', path: 'C:\\Program Files (x86)\\Common Files\\Java\\Java Update\\jusched.exe', enabled: false, type: 'registry', publisher: 'Oracle Corporation', description: 'Checks for Java runtime updates', startupImpact: 'low' },
  { name: 'Spotify', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe', enabled: false, type: 'registry', publisher: 'Spotify AB', description: 'Music streaming application', startupImpact: 'medium' },
  { name: 'Samsung Magician', path: 'C:\\Program Files (x86)\\Samsung\\Samsung Magician\\SamsungMagician.exe', enabled: true, type: 'registry', publisher: 'Samsung Electronics', description: 'SSD management and firmware updates', startupImpact: 'low' },
  { name: 'Windows Security Health', path: 'C:\\Windows\\System32\\SecurityHealthSystray.exe', enabled: true, type: 'registry', publisher: 'Microsoft Corporation', description: 'Security and maintenance status in system tray', startupImpact: 'low' },
  { name: 'Discord', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.0\\Discord.exe', enabled: false, type: 'registry', publisher: 'Discord Inc.', description: 'Voice and text chat for communities', startupImpact: 'medium' },
  { name: 'Cortana', path: 'C:\\Windows\\SystemApps\\Microsoft.Windows.Cortana_cw5n1h2txyewy\\Cortana.exe', enabled: false, type: 'registry', publisher: 'Microsoft Corporation', description: 'Virtual assistant and search companion', startupImpact: 'medium' },
  { name: 'Microsoft Teams', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Teams\\Update.exe', enabled: true, type: 'registry', publisher: 'Microsoft Corporation', description: 'Collaboration and communication platform', startupImpact: 'high' },
  { name: 'Intel Driver & Support Assistant', path: 'C:\\Program Files\\Intel\\Driver and Support Assistant\\DSATray.exe', enabled: false, type: 'scheduled_task', publisher: 'Intel Corporation', description: 'Driver update notifications', startupImpact: 'low' },
  { name: 'Windows Error Reporting', path: 'C:\\Windows\\System32\\wermgr.exe', enabled: true, type: 'service', publisher: 'Microsoft Corporation', description: 'Collects and sends error reports', startupImpact: 'low' },
  { name: 'Logitech Options', path: 'C:\\Program Files\\Logitech\\LogiOptions\\LogiOptions.exe', enabled: true, type: 'registry', publisher: 'Logitech Inc.', description: 'Mouse and keyboard customization', startupImpact: 'low' },
  { name: 'Dell SupportAssist', path: 'C:\\Program Files\\Dell\\SupportAssistAgent\\SupportAssistAgent.exe', enabled: false, type: 'service', publisher: 'Dell Technologies', description: 'System health monitoring and updates', startupImpact: 'medium' },
  { name: 'Adobe Acrobat Update Service', path: 'C:\\Program Files (x86)\\Common Files\\Adobe\\ARM\\1.0\\AdobeARM.exe', enabled: true, type: 'service', publisher: 'Adobe Inc.', description: 'Automatic PDF reader updates', startupImpact: 'low' },
];

const IMPACT_SECONDS: Record<string, number> = {
  high: 2.5,
  medium: 1.2,
  low: 0.4,
};

export class StartupManager {
  getStartupApps(): StartupEntry[] {
    return SIMULATED_STARTUP_APPS.map((app) => ({ ...app }));
  }

  toggleStartupApp(name: string, enabled: boolean): { success: boolean; message: string } {
    const app = SIMULATED_STARTUP_APPS.find((a) => a.name === name);
    if (!app) {
      return { success: false, message: `App "${name}" not found` };
    }
    app.enabled = enabled;
    const status = enabled ? 'enabled' : 'disabled';
    return { success: true, message: `"${name}" has been ${status}` };
  }

  disableSelected(names: string[]): { success: number; failed: number; errors: string[] } {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const name of names) {
      const app = SIMULATED_STARTUP_APPS.find((a) => a.name === name);
      if (app) {
        app.enabled = false;
        success++;
      } else {
        failed++;
        errors.push(`"${name}" not found`);
      }
    }
    return { success, failed, errors };
  }

  getStartupImpact(): StartupImpact {
    const enabled = SIMULATED_STARTUP_APPS.filter((a) => a.enabled);
    const impactSources = enabled.map((a) => ({
      name: a.name,
      seconds: IMPACT_SECONDS[a.startupImpact] + (Math.random() - 0.5) * 0.3,
    }));
    impactSources.sort((a, b) => b.seconds - a.seconds);
    const bootTime = impactSources.reduce((sum, s) => sum + s.seconds, 0);
    return { bootTime: Math.round(bootTime * 10) / 10, impactSources };
  }
}
