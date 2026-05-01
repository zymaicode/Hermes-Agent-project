export interface ServiceEntry {
  name: string;
  displayName: string;
  description: string;
  status: 'running' | 'stopped' | 'paused' | 'starting' | 'stopping';
  startupType: 'automatic' | 'automatic_delayed' | 'manual' | 'disabled';
  logOnAs: string;
  pid: number;
  processName: string;
  serviceType: 'win32_own_process' | 'win32_share_process' | 'kernel_driver' | 'file_system_driver';
  dependencies: string[];
  dependentServices: string[];
  path: string;
  startTime: string | null;
  restartCount: number;
  isCritical: boolean;
}

export type ServiceDetail = ServiceEntry & {
  group: string;
  tagId: number;
  flags: string[];
  requiredPrivileges: string[];
  registryPath: string;
};

const NOW = Date.now();

function ago(minutes: number): string {
  return new Date(NOW - minutes * 60000).toISOString();
}

const SERVICES: ServiceEntry[] = [
  // Critical system services
  { name: 'RpcSs', displayName: 'Remote Procedure Call (RPC)', description: 'The RPCSS service is the Service Control Manager for COM and DCOM servers.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 912, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['DcomLaunch'], dependentServices: ['EventLog', 'Schedule', 'Winmgmt', 'BITS', 'WlanSvc'], path: 'C:\\Windows\\System32\\svchost.exe -k rpcss', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'DcomLaunch', displayName: 'DCOM Server Process Launcher', description: 'The DCOMLAUNCH service launches COM and DCOM servers in response to object activation requests.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 688, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: [], dependentServices: ['RpcSs', 'PlugPlay', 'Power'], path: 'C:\\Windows\\System32\\svchost.exe -k DcomLaunch', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'PlugPlay', displayName: 'Plug and Play', description: 'Enables a computer to recognize and adapt to hardware changes with little or no user input.', status: 'running', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 832, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['DcomLaunch'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k DcomLaunch', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'Power', displayName: 'Power', description: 'Manages power policy and power policy notification delivery.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 856, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['DcomLaunch'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k DcomLaunch', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'EventLog', displayName: 'Windows Event Log', description: 'This service manages events and event logs.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\LocalService', pid: 1140, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: ['Schedule'], path: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'Schedule', displayName: 'Task Scheduler', description: 'Enables a user to configure and schedule automated tasks.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1188, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs', 'EventLog'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(1440), restartCount: 0, isCritical: true },
  { name: 'Winmgmt', displayName: 'Windows Management Instrumentation', description: 'Provides a common interface to access management information about the OS and devices.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1320, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(1440), restartCount: 0, isCritical: true },

  // Common Windows services
  { name: 'WSearch', displayName: 'Windows Search', description: 'Provides content indexing, property caching, and search results for files, email, and other content.', status: 'running', startupType: 'automatic_delayed', logOnAs: 'NT AUTHORITY\\System', pid: 2896, processName: 'SearchIndexer.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\SearchIndexer.exe /Embedding', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Spooler', displayName: 'Print Spooler', description: 'Loads files to memory for later printing.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1568, processName: 'spoolsv.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\spoolsv.exe', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Themes', displayName: 'Themes', description: 'Provides user experience theme management.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1540, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'WlanSvc', displayName: 'WLAN AutoConfig', description: 'Provides the logic required to configure, discover, connect to, and disconnect from wireless LANs.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1356, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalSystemNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'BITS', displayName: 'Background Intelligent Transfer Service', description: 'Transfers files using idle network bandwidth. If the service is disabled, BITS-dependent apps will fail.', status: 'running', startupType: 'automatic_delayed', logOnAs: 'NT AUTHORITY\\System', pid: 1724, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Dhcp', displayName: 'DHCP Client', description: 'Registers and updates IP addresses and DNS records for this computer.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\LocalService', pid: 1204, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs', 'Tcpip'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Dnscache', displayName: 'DNS Client', description: 'Caches DNS names and registers the full computer name.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 1208, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs', 'Tcpip'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k NetworkService', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'WinHttpAutoProxySvc', displayName: 'WinHTTP Web Proxy Auto-Discovery Service', description: 'Implements the Web Proxy Auto-Discovery protocol for HTTP clients.', status: 'running', startupType: 'manual', logOnAs: 'NT AUTHORITY\\LocalService', pid: 2704, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['Dhcp', 'Dnscache'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalService', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'CryptSvc', displayName: 'Cryptographic Services', description: 'Provides management services for the Windows Cryptographic API.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 1264, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k NetworkService', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Audiosrv', displayName: 'Windows Audio', description: 'Manages audio devices for the Windows Audio session.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\LocalService', pid: 1368, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'AudioEndpointBuilder', displayName: 'Windows Audio Endpoint Builder', description: 'Manages audio devices for the Windows Audio service.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1376, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalSystemNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'wuauserv', displayName: 'Windows Update', description: 'Enables the detection, download, and installation of updates for Windows and other programs.', status: 'running', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 3208, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(120), restartCount: 0, isCritical: false },
  { name: 'WinDefend', displayName: 'Windows Defender Antivirus', description: 'Helps protect users from malware and other potentially unwanted software.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1964, processName: 'MsMpEng.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe"', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'SysMain', displayName: 'SysMain', description: 'Maintains and improves system performance.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 2840, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalSystemNetworkRestricted', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'ShellHWDetection', displayName: 'Shell Hardware Detection', description: 'Provides notifications for AutoPlay hardware events.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1580, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'iphlpsvc', displayName: 'IP Helper', description: 'Provides tunnel connectivity using IPv6 transition technologies.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 1332, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs', 'Tcpip'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k NetSvcs', startTime: ago(1440), restartCount: 0, isCritical: false },

  // Stopped services
  { name: 'Fax', displayName: 'Fax', description: 'Enables you to send and receive faxes.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: ['RpcSs', 'Spooler'], dependentServices: [], path: 'C:\\Windows\\System32\\fxssvc.exe', startTime: null, restartCount: 0, isCritical: false },
  { name: 'XblAuth', displayName: 'Xbox Live Auth Manager', description: 'Provides authentication and authorization services for Xbox Live.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: null, restartCount: 0, isCritical: false },
  { name: 'XboxNetApiSvc', displayName: 'Xbox Live Networking Service', description: 'Supports the Xbox Live networking infrastructure.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k netsvcs', startTime: null, restartCount: 0, isCritical: false },
  { name: 'WMSvc', displayName: 'Web Management Service', description: 'Enables web-based management of IIS.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\inetsrv\\WMSvc.exe', startTime: null, restartCount: 0, isCritical: false },
  { name: 'Wecsvc', displayName: 'Windows Event Collector', description: 'Manages persistent subscriptions to events from remote sources.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['EventLog'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k NetworkService', startTime: null, restartCount: 0, isCritical: false },
  { name: 'VSS', displayName: 'Volume Shadow Copy', description: 'Manages and implements Volume Shadow Copies used for backup.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\vssvc.exe', startTime: null, restartCount: 0, isCritical: false },
  { name: 'TrustedInstaller', displayName: 'Windows Modules Installer', description: 'Enables installation, modification, and removal of Windows updates.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\servicing\\TrustedInstaller.exe', startTime: null, restartCount: 0, isCritical: false },
  { name: 'Netlogon', displayName: 'Netlogon', description: 'Maintains a secure channel between this computer and the domain controller.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\lsass.exe', startTime: null, restartCount: 0, isCritical: false },
  { name: 'wmiApSrv', displayName: 'WMI Performance Adapter', description: 'Provides performance library information from WMI providers.', status: 'stopped', startupType: 'manual', logOnAs: 'NT AUTHORITY\\LocalService', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\wbem\\WmiApSrv.exe', startTime: null, restartCount: 0, isCritical: false },

  // Disabled services
  { name: 'lltdsvc', displayName: 'Link-Layer Topology Discovery Mapper', description: 'Creates a Network Map of the PC and device connectivity.', status: 'stopped', startupType: 'disabled', logOnAs: 'NT AUTHORITY\\LocalService', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalService', startTime: null, restartCount: 0, isCritical: false },
  { name: 'RemoteRegistry', displayName: 'Remote Registry', description: 'Enables remote users to modify registry settings on this computer.', status: 'stopped', startupType: 'disabled', logOnAs: 'NT AUTHORITY\\LocalService', pid: 0, processName: '', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k LocalService', startTime: null, restartCount: 0, isCritical: false },
  { name: 'WMSysPr', displayName: 'WMSysPr', description: 'Windows Media System Printer service.', status: 'stopped', startupType: 'disabled', logOnAs: 'NT AUTHORITY\\System', pid: 0, processName: '', serviceType: 'win32_own_process', dependencies: [], dependentServices: [], path: 'C:\\Windows\\System32\\WMSysPr.exe', startTime: null, restartCount: 0, isCritical: false },

  // Third-party services
  { name: 'NvContainerLocalSystem', displayName: 'NVIDIA LocalSystem Container', description: 'NVIDIA LocalSystem Container service for managing NVIDIA GPU features.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 2380, processName: 'nvcontainer.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\Program Files\\NVIDIA Corporation\\NvContainer\\nvcontainer.exe" -s NvContainerLocalSystem', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'RtkAudioUniversalService', displayName: 'Realtek Audio Universal Service', description: 'Realtek HD Audio Universal Service.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 2412, processName: 'RtkAudUService64.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\Program Files\\Realtek\\Audio\\HDA\\RtkAudUService64.exe"', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'com.docker.service', displayName: 'Docker Desktop Service', description: 'Docker Desktop service manages containers and images.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 3544, processName: 'com.docker.service.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\Program Files\\Docker\\Docker\\com.docker.service.exe"', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Intel(R) SUR QC', displayName: 'Intel(R) System Usage Report', description: 'Intel System Usage Report service collects system performance data.', status: 'running', startupType: 'automatic_delayed', logOnAs: 'NT AUTHORITY\\System', pid: 3620, processName: 'SystemUsageReport.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\Program Files\\Intel\\SUR\\SystemUsageReport.exe"', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'Steam Client Service', displayName: 'Steam Client Service', description: 'Steam Client Service monitors and updates Steam components.', status: 'running', startupType: 'automatic', logOnAs: 'NT AUTHORITY\\System', pid: 3984, processName: 'steamservice.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: '"C:\\Program Files (x86)\\Steam\\bin\\steamservice.exe"', startTime: ago(1440), restartCount: 0, isCritical: false },
  { name: 'ssh-agent', displayName: 'OpenSSH Authentication Agent', description: 'Agent to hold private keys used for public key authentication.', status: 'running', startupType: 'manual', logOnAs: 'NT AUTHORITY\\System', pid: 4120, processName: 'ssh-agent.exe', serviceType: 'win32_own_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\OpenSSH\\ssh-agent.exe', startTime: ago(180), restartCount: 0, isCritical: false },

  // Paused service
  { name: 'DoSvc', displayName: 'Delivery Optimization', description: 'Performs content delivery optimization tasks.', status: 'paused', startupType: 'automatic_delayed', logOnAs: 'NT AUTHORITY\\NetworkService', pid: 2976, processName: 'svchost.exe', serviceType: 'win32_share_process', dependencies: ['RpcSs'], dependentServices: [], path: 'C:\\Windows\\System32\\svchost.exe -k NetworkService', startTime: ago(1440), restartCount: 2, isCritical: false },
];

const DETAILS: Record<string, Omit<ServiceDetail, keyof ServiceEntry>> = {
  'RpcSs': {
    group: 'COM Infrastructure',
    tagId: 1,
    flags: ['RunsInSystemProcess', 'IsCritical'],
    requiredPrivileges: ['SeChangeNotifyPrivilege', 'SeImpersonatePrivilege'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\RpcSs',
  },
  'DcomLaunch': {
    group: 'COM Infrastructure',
    tagId: 2,
    flags: ['RunsInSystemProcess'],
    requiredPrivileges: ['SeChangeNotifyPrivilege', 'SeImpersonatePrivilege'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\DcomLaunch',
  },
  'EventLog': {
    group: 'Event Log',
    tagId: 3,
    flags: ['IsCritical'],
    requiredPrivileges: ['SeChangeNotifyPrivilege', 'SeSystemProfilePrivilege'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\EventLog',
  },
  'com.docker.service': {
    group: '',
    tagId: 0,
    flags: [],
    requiredPrivileges: ['SeChangeNotifyPrivilege'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\com.docker.service',
  },
};

function defaultDetail(s: ServiceEntry): ServiceDetail {
  return {
    ...s,
    group: s.isCritical ? 'Core System Services' : '',
    tagId: 0,
    flags: [],
    requiredPrivileges: ['SeChangeNotifyPrivilege'],
    registryPath: `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${s.name}`,
  };
}

export class ServiceManager {
  getServices(): ServiceEntry[] {
    return SERVICES;
  }

  startService(name: string): { success: boolean; message: string } {
    const s = SERVICES.find((s) => s.name === name);
    if (!s) return { success: false, message: `Service "${name}" not found` };
    if (s.status === 'running') return { success: false, message: `${s.displayName} is already running` };
    return { success: true, message: `${s.displayName} started successfully` };
  }

  stopService(name: string): { success: boolean; message: string } {
    const s = SERVICES.find((s) => s.name === name);
    if (!s) return { success: false, message: `Service "${name}" not found` };
    if (s.status === 'stopped') return { success: false, message: `${s.displayName} is already stopped` };
    if (s.isCritical) return { success: false, message: `Cannot stop critical service "${s.displayName}"` };
    return { success: true, message: `${s.displayName} stopped successfully` };
  }

  restartService(name: string): { success: boolean; message: string } {
    const s = SERVICES.find((s) => s.name === name);
    if (!s) return { success: false, message: `Service "${name}" not found` };
    if (s.isCritical) return { success: false, message: `Cannot restart critical service "${s.displayName}"` };
    return { success: true, message: `${s.displayName} restarted successfully` };
  }

  setStartupType(name: string, type: ServiceEntry['startupType']): { success: boolean; message: string } {
    const s = SERVICES.find((s) => s.name === name);
    if (!s) return { success: false, message: `Service "${name}" not found` };
    return { success: true, message: `Startup type for ${s.displayName} set to ${type}` };
  }

  getServiceDetails(name: string): ServiceDetail | null {
    const s = SERVICES.find((s) => s.name === name);
    if (!s) return null;
    return DETAILS[name] ? { ...s, ...DETAILS[name] } : defaultDetail(s);
  }
}
