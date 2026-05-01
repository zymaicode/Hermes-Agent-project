export interface SystemInfo {
  os: {
    name: string;
    version: string;
    buildNumber: string;
    architecture: string;
    edition: string;
    installDate: string;
    uptime: string;
    lastBoot: string;
  };
  computer: {
    name: string;
    manufacturer: string;
    model: string;
    biosVendor: string;
    biosVersion: string;
    biosDate: string;
    serialNumber: string;
  };
  environment: {
    variables: Array<{ name: string; value: string }>;
    processorCount: number;
    logicalProcessors: number;
  };
  power: {
    powerSource: 'AC' | 'Battery';
    batteryPercent?: number;
    batteryRemaining?: string;
    batteryHealth?: string;
  };
}

const ENV_VARS: Array<{ name: string; value: string }> = [
  { name: 'ALLUSERSPROFILE', value: 'C:\\ProgramData' },
  { name: 'APPDATA', value: 'C:\\Users\\User\\AppData\\Roaming' },
  { name: 'CommonProgramFiles', value: 'C:\\Program Files\\Common Files' },
  { name: 'CommonProgramFiles(x86)', value: 'C:\\Program Files (x86)\\Common Files' },
  { name: 'CommonProgramW6432', value: 'C:\\Program Files\\Common Files' },
  { name: 'COMPUTERNAME', value: 'DESKTOP-R7X9KQ3' },
  { name: 'ComSpec', value: 'C:\\Windows\\System32\\cmd.exe' },
  { name: 'DriverData', value: 'C:\\Windows\\System32\\Drivers\\DriverData' },
  { name: 'HOMEDRIVE', value: 'C:' },
  { name: 'HOMEPATH', value: '\\Users\\User' },
  { name: 'LOCALAPPDATA', value: 'C:\\Users\\User\\AppData\\Local' },
  { name: 'LOGONSERVER', value: '\\\\DESKTOP-R7X9KQ3' },
  { name: 'NUMBER_OF_PROCESSORS', value: '16' },
  { name: 'OneDrive', value: 'C:\\Users\\User\\OneDrive' },
  { name: 'OS', value: 'Windows_NT' },
  { name: 'Path', value: 'C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Program Files\\nodejs;C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Program Files\\Git\\cmd' },
  { name: 'PATHEXT', value: '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC' },
  { name: 'PROCESSOR_ARCHITECTURE', value: 'AMD64' },
  { name: 'PROCESSOR_IDENTIFIER', value: 'Intel64 Family 6 Model 183 Stepping 1, GenuineIntel' },
  { name: 'PROCESSOR_LEVEL', value: '6' },
  { name: 'PROCESSOR_REVISION', value: 'b701' },
  { name: 'ProgramData', value: 'C:\\ProgramData' },
  { name: 'ProgramFiles', value: 'C:\\Program Files' },
  { name: 'ProgramFiles(x86)', value: 'C:\\Program Files (x86)' },
  { name: 'ProgramW6432', value: 'C:\\Program Files' },
  { name: 'PSModulePath', value: 'C:\\Users\\User\\Documents\\WindowsPowerShell\\Modules;C:\\Program Files\\WindowsPowerShell\\Modules;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules' },
  { name: 'PUBLIC', value: 'C:\\Users\\Public' },
  { name: 'SystemDrive', value: 'C:' },
  { name: 'SystemRoot', value: 'C:\\Windows' },
  { name: 'TEMP', value: 'C:\\Users\\User\\AppData\\Local\\Temp' },
  { name: 'TMP', value: 'C:\\Users\\User\\AppData\\Local\\Temp' },
  { name: 'USERDOMAIN', value: 'DESKTOP-R7X9KQ3' },
  { name: 'USERNAME', value: 'User' },
  { name: 'USERPROFILE', value: 'C:\\Users\\User' },
  { name: 'windir', value: 'C:\\Windows' },
  { name: 'WSLENV', value: 'WT_SESSION:WT_PROFILE_ID' },
];

export class SystemInfoCollector {
  getSystemInfo(): SystemInfo {
    const bootTime = Date.now() - (3 * 24 * 3600 * 1000 + 12 * 3600 * 1000 + 34 * 60 * 1000);
    const uptimeMs = Date.now() - bootTime;
    const d = Math.floor(uptimeMs / 86400000);
    const h = Math.floor((uptimeMs % 86400000) / 3600000);
    const m = Math.floor((uptimeMs % 3600000) / 60000);
    const uptime = `${d}d ${h}h ${m}m`;

    return {
      os: {
        name: 'Microsoft Windows 11 Pro',
        version: '23H2',
        buildNumber: '22631.3447',
        architecture: 'x64',
        edition: 'Professional',
        installDate: '2025-11-15 14:30:00',
        uptime,
        lastBoot: new Date(bootTime).toISOString().replace('T', ' ').split('.')[0],
      },
      computer: {
        name: 'DESKTOP-R7X9KQ3',
        manufacturer: 'Dell Inc.',
        model: 'XPS 15 9530',
        biosVendor: 'Dell Inc.',
        biosVersion: '1.15.2',
        biosDate: '2025-09-10',
        serialNumber: 'ABC123XYZ789',
      },
      environment: {
        variables: ENV_VARS,
        processorCount: 8,
        logicalProcessors: 16,
      },
      power: {
        powerSource: 'AC',
      },
    };
  }
}
