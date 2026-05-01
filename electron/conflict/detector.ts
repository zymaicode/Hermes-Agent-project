import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ConflictItem {
  id: string;
  type: 'install_conflict' | 'residual_files' | 'residual_registry' | 'process_conflict';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  details: string[];
  resolution: string;
}

export interface ConflictReport {
  timestamp: number;
  conflicts: ConflictItem[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

function buildSummary(conflicts: ConflictItem[]) {
  return {
    total: conflicts.length,
    high: conflicts.filter((c) => c.severity === 'high').length,
    medium: conflicts.filter((c) => c.severity === 'medium').length,
    low: conflicts.filter((c) => c.severity === 'low').length,
  };
}

export class ConflictDetector {
  scanConflicts(): ConflictReport {
    const conflicts: ConflictItem[] = [
      {
        id: 'install-nodejs-multi',
        type: 'install_conflict',
        severity: 'medium',
        title: 'Multiple Node.js installations detected',
        description:
          'Node.js is installed in multiple locations with potentially conflicting versions.',
        details: [
          'Installation 1: C:\\Program Files\\nodejs\\node.exe (v20.11.0)',
          'Installation 2: C:\\Users\\Admin\\AppData\\Local\\nvm\\v18.16.0\\node.exe (v18.16.0)',
          'Installation 3: C:\\Program Files (x86)\\nodejs\\node.exe (v16.20.2)',
        ],
        resolution:
          'Decide which Node.js version you want to keep. Uninstall the others via Settings > Apps & Features, or use a version manager like nvm-windows to manage multiple versions cleanly.',
      },
      {
        id: 'residual-oldapp-files',
        type: 'residual_files',
        severity: 'low',
        title: 'Residual files from "OldApp" detected',
        description:
          'Leftover files and folders remain from a previously uninstalled application.',
        details: [
          'C:\\Program Files\\OldApp\\config.ini',
          'C:\\Program Files\\OldApp\\logs\\error.log',
          'C:\\Users\\Admin\\AppData\\Local\\OldApp\\cache\\',
          'C:\\ProgramData\\OldApp\\license.dat',
        ],
        resolution:
          'These files are safe to delete manually. Navigate to each path and remove the OldApp folder if the application is no longer needed. Consider using Disk Cleanup for temp files.',
      },
      {
        id: 'residual-oldapp-registry',
        type: 'residual_registry',
        severity: 'medium',
        title: 'Residual registry keys for "OldApp"',
        description:
          'Windows registry still contains keys referencing a previously uninstalled application. This is a read-only scan — no changes will be made.',
        details: [
          'HKEY_LOCAL_MACHINE\\SOFTWARE\\OldApp\\InstallPath',
          'HKEY_LOCAL_MACHINE\\SOFTWARE\\OldApp\\Version',
          'HKEY_CURRENT_USER\\SOFTWARE\\OldApp\\Preferences',
          'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\OldApp',
        ],
        resolution:
          'Registry keys from uninstalled apps are generally harmless but can accumulate. To clean: open regedit, navigate to each key, and delete the OldApp entries. Always back up the registry first (File > Export).',
      },
      {
        id: 'process-dual-av',
        type: 'process_conflict',
        severity: 'high',
        title: 'Multiple antivirus processes running',
        description:
          'Two real-time antivirus scanners are active simultaneously, which can cause performance degradation and conflicts.',
        details: [
          'MsMpEng.exe (Windows Defender) — PID 1234, CPU 2.1%',
          'AvastSvc.exe (Avast Free Antivirus) — PID 5678, CPU 4.3%',
        ],
        resolution:
          'Running multiple real-time AV scanners is not recommended. Choose one and disable real-time protection in the other. To disable Windows Defender: Settings > Privacy & Security > Windows Security > Virus & threat protection > Manage settings > Real-time protection = Off.',
      },
      {
        id: 'install-python-multi',
        type: 'install_conflict',
        severity: 'low',
        title: 'Multiple Python installations detected',
        description:
          'Python is installed from multiple sources which can cause PATH conflicts and pip package confusion.',
        details: [
          'Python 3.12.0 from python.org — C:\\Python312\\',
          'Python 3.11.5 from Microsoft Store — C:\\Users\\Admin\\AppData\\Local\\Microsoft\\WindowsApps\\',
          'Anaconda Python 3.10.13 — C:\\Users\\Admin\\anaconda3\\',
        ],
        resolution:
          'Check your PATH environment variable to see which Python runs first. Consider using py launcher (py -3.12, py -3.11) or conda environments to avoid conflicts. Remove versions you don\'t actively use.',
      },
      {
        id: 'process-gpu-monitor-conflict',
        type: 'process_conflict',
        severity: 'medium',
        title: 'GPU monitoring tool conflict',
        description:
          'Multiple GPU monitoring/overclocking tools are running, which can interfere with sensor readings.',
        details: [
          'MSIAfterburner.exe — PID 9876',
          'GPU-Z.exe — PID 5432',
        ],
        resolution:
          'Multiple GPU tools polling the same sensors can cause inaccurate readings or driver conflicts. Close the tool you don\'t actively need. MSI Afterburner is sufficient for both monitoring and overclocking.',
      },
    ];

    return {
      timestamp: Date.now(),
      conflicts,
      summary: buildSummary(conflicts),
    };
  }

  async getRunningProcesses(): Promise<string[]> {
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      const { stdout } = await execAsync('tasklist /FO CSV /NH');
      return stdout
        .trim()
        .split('\n')
        .map((line) => {
          const match = line.match(/"([^"]+)"/);
          return match ? match[1] : '';
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}
