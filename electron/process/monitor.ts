export interface ProcessEntry {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMB: number;
  memoryPercent: number;
  status: 'running' | 'suspended' | 'stopped';
  user: string;
  priority: string;
  startTime: string;
  threads: number;
  handles: number;
  commandLine: string;
  description: string;
  path: string;
}

const SYSTEM_PROCS: Omit<ProcessEntry, 'cpuPercent' | 'memoryMB' | 'memoryPercent'>[] = [
  { pid: 4, name: 'System', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:00', threads: 312, handles: 15840, commandLine: '', description: 'NT Kernel & System', path: 'System' },
  { pid: 108, name: 'Registry', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:01', threads: 4, handles: 204, commandLine: '', description: 'Windows Registry', path: 'System' },
  { pid: 580, name: 'svchost.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:03', threads: 48, handles: 3200, commandLine: 'C:\\Windows\\System32\\svchost.exe -k LocalSystemNetworkRestricted', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 684, name: 'svchost.exe', status: 'running', user: 'NETWORK SERVICE', priority: 'Normal', startTime: '2026-04-15 08:00:03', threads: 36, handles: 2100, commandLine: 'C:\\Windows\\System32\\svchost.exe -k NetworkService', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 752, name: 'svchost.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:04', threads: 52, handles: 4100, commandLine: 'C:\\Windows\\System32\\svchost.exe -k LocalService', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 820, name: 'svchost.exe', status: 'running', user: 'LOCAL SERVICE', priority: 'Normal', startTime: '2026-04-15 08:00:04', threads: 28, handles: 1850, commandLine: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 920, name: 'svchost.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:05', threads: 44, handles: 2900, commandLine: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 1012, name: 'svchost.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:06', threads: 30, handles: 1950, commandLine: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNoNetwork', description: 'Host Process for Windows Services', path: 'C:\\Windows\\System32\\svchost.exe' },
  { pid: 1140, name: 'explorer.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:22', threads: 88, handles: 6200, commandLine: 'C:\\Windows\\explorer.exe', description: 'Windows Explorer', path: 'C:\\Windows\\explorer.exe' },
  { pid: 1280, name: 'dwm.exe', status: 'running', user: 'Window Manager\\DWM-1', priority: 'High', startTime: '2026-05-01 08:15:22', threads: 24, handles: 950, commandLine: '"C:\\Windows\\System32\\dwm.exe"', description: 'Desktop Window Manager', path: 'C:\\Windows\\System32\\dwm.exe' },
  { pid: 1344, name: 'ctfmon.exe', status: 'running', user: 'User', priority: 'High', startTime: '2026-05-01 08:15:24', threads: 10, handles: 380, commandLine: '"C:\\Windows\\System32\\ctfmon.exe"', description: 'CTF Loader', path: 'C:\\Windows\\System32\\ctfmon.exe' },
  { pid: 1400, name: 'MsMpEng.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:05:00', threads: 72, handles: 5600, commandLine: '"C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.24090.11-0\\MsMpEng.exe"', description: 'Antimalware Service Executable', path: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.24090.11-0\\MsMpEng.exe' },
  { pid: 1512, name: 'SearchIndexer.exe', status: 'running', user: 'SYSTEM', priority: 'Low', startTime: '2026-04-15 08:06:00', threads: 22, handles: 1450, commandLine: 'C:\\Windows\\System32\\SearchIndexer.exe', description: 'Microsoft Windows Search Indexer', path: 'C:\\Windows\\System32\\SearchIndexer.exe' },
  { pid: 1580, name: 'spoolsv.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:05:30', threads: 16, handles: 820, commandLine: 'C:\\Windows\\System32\\spoolsv.exe', description: 'Spooler SubSystem App', path: 'C:\\Windows\\System32\\spoolsv.exe' },
  { pid: 1640, name: 'winlogon.exe', status: 'running', user: 'SYSTEM', priority: 'High', startTime: '2026-04-15 08:00:02', threads: 14, handles: 580, commandLine: 'winlogon.exe', description: 'Windows Logon Application', path: 'C:\\Windows\\System32\\winlogon.exe' },
  { pid: 1700, name: 'lsass.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:02', threads: 18, handles: 2100, commandLine: 'C:\\Windows\\System32\\lsass.exe', description: 'Local Security Authority Process', path: 'C:\\Windows\\System32\\lsass.exe' },
  { pid: 1760, name: 'csrss.exe', status: 'running', user: 'SYSTEM', priority: 'High', startTime: '2026-04-15 08:00:01', threads: 14, handles: 720, commandLine: '%SystemRoot%\\system32\\csrss.exe', description: 'Client Server Runtime Process', path: 'C:\\Windows\\System32\\csrss.exe' },
  { pid: 1820, name: 'services.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:00:01', threads: 12, handles: 650, commandLine: 'C:\\Windows\\System32\\services.exe', description: 'Services and Controller app', path: 'C:\\Windows\\System32\\services.exe' },
  { pid: 1900, name: 'SgrmBroker.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-04-15 08:05:00', threads: 6, handles: 210, commandLine: 'C:\\Windows\\System32\\SgrmBroker.exe', description: 'System Guard Runtime Monitor Broker', path: 'C:\\Windows\\System32\\SgrmBroker.exe' },
  { pid: 1960, name: 'RuntimeBroker.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:26', threads: 12, handles: 480, commandLine: 'C:\\Windows\\System32\\RuntimeBroker.exe -Embedding', description: 'Runtime Broker', path: 'C:\\Windows\\System32\\RuntimeBroker.exe' },
];

const USER_APPS: Omit<ProcessEntry, 'cpuPercent' | 'memoryMB' | 'memoryPercent'>[] = [
  { pid: 3200, name: 'chrome.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:30:15', threads: 124, handles: 4800, commandLine: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --type=renderer', description: 'Google Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { pid: 3250, name: 'chrome.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:30:18', threads: 16, handles: 420, commandLine: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --type=gpu-process', description: 'Google Chrome GPU Process', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { pid: 3300, name: 'chrome.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:30:20', threads: 28, handles: 680, commandLine: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --type=utility', description: 'Google Chrome Network Service', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { pid: 3400, name: 'Code.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:45:00', threads: 96, handles: 3200, commandLine: '"C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"', description: 'Visual Studio Code', path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe' },
  { pid: 3450, name: 'Code.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:45:02', threads: 14, handles: 340, commandLine: '"C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe" --type=renderer', description: 'VS Code Renderer', path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe' },
  { pid: 3550, name: 'Discord.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:00:00', threads: 68, handles: 2500, commandLine: '"C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9026\\Discord.exe"', description: 'Discord', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9026\\Discord.exe' },
  { pid: 3600, name: 'Spotify.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:15:00', threads: 56, handles: 1800, commandLine: '"C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe" --type=renderer', description: 'Spotify Music', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
  { pid: 3650, name: 'slack.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:00:00', threads: 82, handles: 2900, commandLine: '"C:\\Users\\User\\AppData\\Local\\slack\\slack.exe"', description: 'Slack', path: 'C:\\Users\\User\\AppData\\Local\\slack\\slack.exe' },
  { pid: 3700, name: 'WindowsTerminal.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:30:00', threads: 24, handles: 680, commandLine: '"C:\\Program Files\\WindowsApps\\Microsoft.WindowsTerminal_1.19.24090.0_x64__8wekyb3d8bbwe\\WindowsTerminal.exe"', description: 'Windows Terminal', path: 'C:\\Program Files\\WindowsApps\\Microsoft.WindowsTerminal_1.19.24090.0_x64__8wekyb3d8bbwe\\WindowsTerminal.exe' },
  { pid: 3750, name: 'powershell.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:30:02', threads: 12, handles: 380, commandLine: '"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"', description: 'Windows PowerShell', path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
  { pid: 3800, name: 'notepad++.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 11:00:00', threads: 8, handles: 220, commandLine: '"C:\\Program Files\\Notepad++\\notepad++.exe"', description: 'Notepad++', path: 'C:\\Program Files\\Notepad++\\notepad++.exe' },
  { pid: 3850, name: 'steam.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:30:00', threads: 72, handles: 2600, commandLine: '"C:\\Program Files (x86)\\Steam\\steam.exe"', description: 'Steam Client', path: 'C:\\Program Files (x86)\\Steam\\steam.exe' },
  { pid: 3900, name: 'thunderbird.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 09:00:00', threads: 42, handles: 1400, commandLine: '"C:\\Program Files\\Mozilla Thunderbird\\thunderbird.exe"', description: 'Mozilla Thunderbird', path: 'C:\\Program Files\\Mozilla Thunderbird\\thunderbird.exe' },
  { pid: 3950, name: 'obs64.exe', status: 'running', user: 'User', priority: 'High', startTime: '2026-05-01 12:00:00', threads: 58, handles: 1600, commandLine: '"C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe"', description: 'OBS Studio', path: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe' },
  { pid: 4000, name: 'node.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:45:00', threads: 18, handles: 560, commandLine: '"C:\\Program Files\\nodejs\\node.exe" server.js', description: 'Node.js JavaScript Runtime', path: 'C:\\Program Files\\nodejs\\node.exe' },
  { pid: 4050, name: 'firefox.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 11:15:00', threads: 98, handles: 3400, commandLine: '"C:\\Program Files\\Mozilla Firefox\\firefox.exe"', description: 'Mozilla Firefox', path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe' },
  { pid: 4100, name: 'OneDrive.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:30', threads: 22, handles: 720, commandLine: '"C:\\Users\\User\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe" /background', description: 'Microsoft OneDrive', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe' },
  { pid: 4150, name: 'TextInputHost.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:28', threads: 6, handles: 190, commandLine: '"C:\\Windows\\SystemApps\\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\\TextInputHost.exe"', description: 'Text Input Host', path: 'C:\\Windows\\SystemApps\\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\\TextInputHost.exe' },
  { pid: 4200, name: 'Widgets.exe', status: 'suspended', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:35', threads: 16, handles: 480, commandLine: '"C:\\Program Files\\WindowsApps\\MicrosoftWindows.Client.WebExperience_423.3000.10.0_x64__cw5n1h2txyewy\\Widgets.exe"', description: 'Windows Widgets', path: 'C:\\Program Files\\WindowsApps\\MicrosoftWindows.Client.WebExperience_423.3000.10.0_x64__cw5n1h2txyewy\\Widgets.exe' },
  { pid: 4250, name: 'wslservice.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-05-01 10:00:00', threads: 14, handles: 420, commandLine: '"C:\\Program Files\\WSL\\wslservice.exe"', description: 'WSL Service', path: 'C:\\Program Files\\WSL\\wslservice.exe' },
  { pid: 4300, name: 'AdobeUpdateService.exe', status: 'running', user: 'SYSTEM', priority: 'Normal', startTime: '2026-05-01 03:00:00', threads: 6, handles: 180, commandLine: '"C:\\Program Files (x86)\\Common Files\\Adobe\\Adobe Desktop Common\\ElevationManager\\AdobeUpdateService.exe"', description: 'Adobe Update Service', path: 'C:\\Program Files (x86)\\Common Files\\Adobe\\Adobe Desktop Common\\ElevationManager\\AdobeUpdateService.exe' },
  { pid: 4350, name: 'GoogleUpdate.exe', status: 'running', user: 'SYSTEM', priority: 'Low', startTime: '2026-05-01 03:15:00', threads: 4, handles: 140, commandLine: '"C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe" /medsvc', description: 'Google Update Service', path: 'C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe' },
  { pid: 4400, name: 'conhost.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 10:30:01', threads: 4, handles: 120, commandLine: '\\??\\C:\\Windows\\System32\\conhost.exe 0x4', description: 'Console Window Host', path: 'C:\\Windows\\System32\\conhost.exe' },
  { pid: 4450, name: 'taskhostw.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:25', threads: 8, handles: 260, commandLine: 'taskhostw.exe', description: 'Host Process for Windows Tasks', path: 'C:\\Windows\\System32\\taskhostw.exe' },
  { pid: 4500, name: 'sihost.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:23', threads: 10, handles: 340, commandLine: 'sihost.exe', description: 'Shell Infrastructure Host', path: 'C:\\Windows\\System32\\sihost.exe' },
  { pid: 4550, name: 'SecurityHealthSystray.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:25', threads: 6, handles: 200, commandLine: '"C:\\Windows\\System32\\SecurityHealthSystray.exe"', description: 'Windows Security notification icon', path: 'C:\\Windows\\System32\\SecurityHealthSystray.exe' },
  { pid: 4600, name: 'StartMenuExperienceHost.exe', status: 'suspended', user: 'User', priority: 'Normal', startTime: '2026-05-01 08:15:27', threads: 14, handles: 440, commandLine: '"C:\\Windows\\SystemApps\\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\\StartMenuExperienceHost.exe"', description: 'Start Menu Experience Host', path: 'C:\\Windows\\SystemApps\\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\\StartMenuExperienceHost.exe' },
  { pid: 4650, name: 'dllhost.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 11:30:00', threads: 6, handles: 190, commandLine: 'C:\\Windows\\System32\\dllhost.exe /Processid:{3AD05576-8857-4850-9277-11B85BDB8E09}', description: 'COM Surrogate', path: 'C:\\Windows\\System32\\dllhost.exe' },
  { pid: 4700, name: 'git.exe', status: 'running', user: 'User', priority: 'Normal', startTime: '2026-05-01 12:30:00', threads: 4, handles: 110, commandLine: '"C:\\Program Files\\Git\\mingw64\\bin\\git.exe" status', description: 'Git for Windows', path: 'C:\\Program Files\\Git\\mingw64\\bin\\git.exe' },
];

function vary(value: number, range: number): number {
  return +(value + (Math.random() - 0.5) * range * 2).toFixed(1);
}

export class ProcessMonitor {
  private baseProcesses: ProcessEntry[];

  constructor() {
    const totalMem = 32768; // 32 GB
    this.baseProcesses = [...SYSTEM_PROCS, ...USER_APPS].map((p, i) => ({
      ...p,
      cpuPercent: 0,
      memoryMB: 0,
      memoryPercent: 0,
    }));
    // Assign base memory values
    const memMap: Record<string, number> = {
      'System': 0.3, 'Registry': 4, 'winlogon.exe': 8, 'lsass.exe': 18, 'csrss.exe': 4,
      'services.exe': 10, 'SgrmBroker.exe': 5, 'RuntimeBroker.exe': 12, 'sihost.exe': 8,
      'taskhostw.exe': 10, 'TextInputHost.exe': 6, 'dllhost.exe': 5, 'conhost.exe': 3,
      'SecurityHealthSystray.exe': 5, 'ctfmon.exe': 4, 'Widgets.exe': 32,
      'StartMenuExperienceHost.exe': 28,
    };
    for (const p of this.baseProcesses) {
      if (p.name === 'svchost.exe') {
        p.memoryMB = +(100 + Math.random() * 200).toFixed(1);
      } else if (p.name === 'chrome.exe') {
        p.memoryMB = +(80 + Math.random() * 600).toFixed(1);
      } else if (p.name === 'Code.exe') {
        p.memoryMB = +(120 + Math.random() * 400).toFixed(1);
      } else {
        p.memoryMB = memMap[p.name] ?? +(5 + Math.random() * 80).toFixed(1);
      }
      p.memoryPercent = +((p.memoryMB / totalMem) * 100).toFixed(1);
    }
  }

  getProcesses(): ProcessEntry[] {
    return this.baseProcesses.map((p) => {
      let cpuPercent: number;
      if (p.status === 'suspended') {
        cpuPercent = 0;
      } else if (['System', 'Registry', 'csrss.exe', 'services.exe', 'SgrmBroker.exe', 'conhost.exe', 'GoogleUpdate.exe'].includes(p.name)) {
        cpuPercent = +(Math.random() * 1.5).toFixed(1);
      } else if (['chrome.exe', 'obs64.exe', 'Code.exe', 'Discord.exe', 'firefox.exe'].includes(p.name)) {
        cpuPercent = +(1 + Math.random() * 18).toFixed(1);
      } else if (p.name === 'node.exe') {
        cpuPercent = +(0.5 + Math.random() * 8).toFixed(1);
      } else if (p.name === 'MsMpEng.exe') {
        cpuPercent = +(0.5 + Math.random() * 12).toFixed(1);
      } else {
        cpuPercent = +(Math.random() * 5).toFixed(1);
      }

      const memJitter = +(p.memoryMB * (1 + (Math.random() - 0.5) * 0.04)).toFixed(1);
      const memPctJitter = +((memJitter / 32768) * 100).toFixed(1);

      return {
        ...p,
        cpuPercent,
        memoryMB: memJitter,
        memoryPercent: memPctJitter,
        threads: p.name === 'chrome.exe' ? p.threads + Math.floor(Math.random() * 10) :
                 p.name === 'obs64.exe' ? p.threads + Math.floor(Math.random() * 4) :
                 p.threads,
        handles: p.handles + Math.floor(Math.random() * 40 - 20),
      };
    });
  }

  killProcess(pid: number): { success: boolean; message: string } {
    const proc = this.baseProcesses.find((p) => p.pid === pid);
    if (!proc) return { success: false, message: 'Process not found' };
    const sysPids = [4, 108, 1640, 1700, 1760, 1820];
    if (sysPids.includes(pid) || proc.name === 'MsMpEng.exe') {
      return { success: false, message: `Access denied: Cannot terminate system process "${proc.name}"` };
    }
    this.baseProcesses = this.baseProcesses.filter((p) => p.pid !== pid);
    return { success: true, message: `Process "${proc.name}" (PID: ${pid}) terminated successfully` };
  }

  getProcessDetail(pid: number): (ProcessEntry & { children: number[]; cpuHistory: number[]; memHistory: number[] }) | null {
    const proc = this.baseProcesses.find((p) => p.pid === pid);
    if (!proc) return null;
    const children = this.baseProcesses
      .filter((p) => p.name === proc.name && p.pid !== pid)
      .map((p) => p.pid);
    const cpuHistory = Array.from({ length: 30 }, () => +(Math.random() * 25).toFixed(1));
    const memHistory = Array.from({ length: 30 }, () => +((proc.memoryMB ?? 50) * (0.9 + Math.random() * 0.2)).toFixed(1));
    return { ...proc, children, cpuHistory, memHistory };
  }

  getProcessCount(): number {
    return this.baseProcesses.length;
  }
}
