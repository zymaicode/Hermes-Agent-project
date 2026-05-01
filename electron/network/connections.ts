export interface NetworkConnection {
  protocol: 'TCP' | 'UDP' | 'TCPv6' | 'UDPv6';
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: 'established' | 'listen' | 'time_wait' | 'close_wait' | 'syn_sent' | 'syn_received' | 'fin_wait1' | 'fin_wait2' | 'closed' | 'bound' | 'unknown';
  processId: number;
  processName: string;
  processPath: string;
  created: string;
  bytesSent: number;
  bytesReceived: number;
}

export interface ListeningPort {
  protocol: string;
  port: number;
  address: string;
  processName: string;
  pid: number;
  service: string;
  description: string;
}

export interface ConnectionStats {
  total: number;
  established: number;
  listening: number;
  timeWait: number;
  pidCount: number;
}

const PROCESSES = [
  { name: 'chrome.exe', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { name: 'msedge.exe', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
  { name: 'Discord.exe', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9034\\Discord.exe' },
  { name: 'Code.exe', path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe' },
  { name: 'Spotify.exe', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
  { name: 'node.exe', path: 'C:\\Program Files\\nodejs\\node.exe' },
  { name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe' },
  { name: 'SearchHost.exe', path: 'C:\\Windows\\SystemApps\\Microsoft.Windows.Search_1.14.6\\SearchHost.exe' },
  { name: 'msedgewebview2.exe', path: 'C:\\Program Files (x86)\\Microsoft\\EdgeWebView\\Application\\msedgewebview2.exe' },
  { name: 'explorer.exe', path: 'C:\\Windows\\explorer.exe' },
  { name: 'System', path: 'C:\\Windows\\System32' },
  { name: 'lsass.exe', path: 'C:\\Windows\\System32\\lsass.exe' },
  { name: 'spoolsv.exe', path: 'C:\\Windows\\System32\\spoolsv.exe' },
  { name: 'OneDrive.exe', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe' },
];

const GEO_DATA: Record<string, { country: string; city: string; isp: string }> = {
  '142.250.80.46': { country: 'US', city: 'Mountain View', isp: 'Google LLC' },
  '104.16.124.96': { country: 'US', city: 'San Francisco', isp: 'Cloudflare Inc.' },
  '162.159.128.233': { country: 'US', city: 'San Francisco', isp: 'Cloudflare Inc.' },
  '151.101.2.132': { country: 'US', city: 'San Francisco', isp: 'Fastly' },
  '34.120.99.89': { country: 'US', city: 'Kansas City', isp: 'Google Cloud' },
  '52.109.12.5': { country: 'US', city: 'Redmond', isp: 'Microsoft Corp.' },
  '13.107.42.14': { country: 'US', city: 'Redmond', isp: 'Microsoft Corp.' },
  '35.186.224.47': { country: 'US', city: 'Mountain View', isp: 'Google LLC' },
  '104.244.42.193': { country: 'US', city: 'San Francisco', isp: 'Twitter Inc.' },
  '157.240.1.35': { country: 'US', city: 'Menlo Park', isp: 'Meta Platforms Inc.' },
};

function pickProcess(pid: number): { name: string; path: string } {
  return PROCESSES[pid % PROCESSES.length];
}

function randomIp(): string {
  return `${10 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${1 + Math.floor(Math.random() * 254)}`;
}

function randomRemoteIp(): string {
  const ips = Object.keys(GEO_DATA);
  if (Math.random() < 0.5) return ips[Math.floor(Math.random() * ips.length)];
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${1 + Math.floor(Math.random() * 254)}`;
}

export class NetworkConnectionMonitor {
  getConnections(filter?: { state?: string; protocol?: string; pid?: number }): NetworkConnection[] {
    const conns: NetworkConnection[] = [
      // Chrome browsing
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52431, remoteAddress: '142.250.80.46', remotePort: 443, state: 'established', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 45000).toISOString(), bytesSent: 245632, bytesReceived: 1452000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52432, remoteAddress: '151.101.2.132', remotePort: 443, state: 'established', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 72000).toISOString(), bytesSent: 89720, bytesReceived: 523400 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52433, remoteAddress: '104.16.124.96', remotePort: 443, state: 'established', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 120000).toISOString(), bytesSent: 34000, bytesReceived: 215000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52430, remoteAddress: '142.250.80.46', remotePort: 80, state: 'time_wait', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 200000).toISOString(), bytesSent: 12000, bytesReceived: 89000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52428, remoteAddress: '35.186.224.47', remotePort: 443, state: 'close_wait', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 300000).toISOString(), bytesSent: 0, bytesReceived: 4500 },

      // Edge
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52700, remoteAddress: '13.107.42.14', remotePort: 443, state: 'established', processId: 8340, processName: 'msedge.exe', processPath: PROCESSES[1].path, created: new Date(Date.now() - 30000).toISOString(), bytesSent: 56700, bytesReceived: 312000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52701, remoteAddress: '52.109.12.5', remotePort: 443, state: 'established', processId: 8340, processName: 'msedge.exe', processPath: PROCESSES[1].path, created: new Date(Date.now() - 60000).toISOString(), bytesSent: 23400, bytesReceived: 178000 },

      // Discord
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 64510, remoteAddress: '162.159.128.233', remotePort: 443, state: 'established', processId: 10920, processName: 'Discord.exe', processPath: PROCESSES[2].path, created: new Date(Date.now() - 1800000).toISOString(), bytesSent: 156000, bytesReceived: 890000 },
      { protocol: 'UDP', localAddress: '192.168.1.100', localPort: 50000, remoteAddress: '162.159.128.233', remotePort: 443, state: 'bound', processId: 10920, processName: 'Discord.exe', processPath: PROCESSES[2].path, created: new Date(Date.now() - 1800000).toISOString(), bytesSent: 450000, bytesReceived: 320000 },

      // VS Code (update check + extensions)
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52980, remoteAddress: '104.16.124.96', remotePort: 443, state: 'established', processId: 5612, processName: 'Code.exe', processPath: PROCESSES[3].path, created: new Date(Date.now() - 3600000).toISOString(), bytesSent: 3400, bytesReceived: 12000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52981, remoteAddress: '34.120.99.89', remotePort: 443, state: 'established', processId: 5612, processName: 'Code.exe', processPath: PROCESSES[3].path, created: new Date(Date.now() - 900000).toISOString(), bytesSent: 8900, bytesReceived: 45000 },

      // Spotify
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 57621, remoteAddress: '151.101.2.132', remotePort: 443, state: 'established', processId: 7430, processName: 'Spotify.exe', processPath: PROCESSES[4].path, created: new Date(Date.now() - 1200000).toISOString(), bytesSent: 23000, bytesReceived: 345000 },

      // Node.js dev server
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 5173, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 9840, processName: 'node.exe', processPath: PROCESSES[5].path, created: new Date(Date.now() - 7200000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 3000, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 9841, processName: 'node.exe', processPath: PROCESSES[5].path, created: new Date(Date.now() - 7200000).toISOString(), bytesSent: 0, bytesReceived: 0 },

      // System services
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 135, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 940, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 445, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 4, processName: 'System', processPath: PROCESSES[10].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 3389, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 1532, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 5985, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 940, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 5040, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 2936, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },

      // Search host
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 53100, remoteAddress: '52.109.12.5', remotePort: 443, state: 'established', processId: 7240, processName: 'SearchHost.exe', processPath: PROCESSES[7].path, created: new Date(Date.now() - 300000).toISOString(), bytesSent: 12000, bytesReceived: 78000 },

      // Time_wait connections
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52345, remoteAddress: '104.244.42.193', remotePort: 443, state: 'time_wait', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 600000).toISOString(), bytesSent: 4500, bytesReceived: 23000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52346, remoteAddress: '157.240.1.35', remotePort: 443, state: 'time_wait', processId: 4820, processName: 'chrome.exe', processPath: PROCESSES[0].path, created: new Date(Date.now() - 600000).toISOString(), bytesSent: 3400, bytesReceived: 12000 },
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 52347, remoteAddress: '151.101.2.132', remotePort: 443, state: 'time_wait', processId: 5612, processName: 'Code.exe', processPath: PROCESSES[3].path, created: new Date(Date.now() - 480000).toISOString(), bytesSent: 1200, bytesReceived: 5600 },

      // Additional established
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 53500, remoteAddress: '34.120.99.89', remotePort: 443, state: 'established', processId: 8340, processName: 'msedge.exe', processPath: PROCESSES[1].path, created: new Date(Date.now() - 120000).toISOString(), bytesSent: 34500, bytesReceived: 189000 },
      { protocol: 'UDP', localAddress: '192.168.1.100', localPort: 5353, remoteAddress: '224.0.0.251', remotePort: 5353, state: 'bound', processId: 7240, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 1200, bytesReceived: 3400 },

      // Explorer
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 49872, remoteAddress: '13.107.42.14', remotePort: 443, state: 'established', processId: 3100, processName: 'explorer.exe', processPath: PROCESSES[9].path, created: new Date(Date.now() - 2400000).toISOString(), bytesSent: 8900, bytesReceived: 56000 },

      // OneDrive
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 61200, remoteAddress: '52.109.12.5', remotePort: 443, state: 'established', processId: 4200, processName: 'OneDrive.exe', processPath: PROCESSES[13].path, created: new Date(Date.now() - 3600000).toISOString(), bytesSent: 120000, bytesReceived: 450000 },

      // lsass
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 49664, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 792, processName: 'lsass.exe', processPath: PROCESSES[11].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 49665, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 792, processName: 'lsass.exe', processPath: PROCESSES[11].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 49666, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 940, processName: 'svchost.exe', processPath: PROCESSES[6].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },
      { protocol: 'TCP', localAddress: '0.0.0.0', localPort: 49667, remoteAddress: '0.0.0.0', remotePort: 0, state: 'listen', processId: 1532, processName: 'spoolsv.exe', processPath: PROCESSES[12].path, created: new Date(Date.now() - 86400000).toISOString(), bytesSent: 0, bytesReceived: 0 },

      // Edge WebView2
      { protocol: 'TCP', localAddress: '192.168.1.100', localPort: 54200, remoteAddress: '104.16.124.96', remotePort: 443, state: 'established', processId: 6550, processName: 'msedgewebview2.exe', processPath: PROCESSES[8].path, created: new Date(Date.now() - 600000).toISOString(), bytesSent: 12000, bytesReceived: 67000 },
    ];

    let filtered = conns;
    if (filter?.state) filtered = filtered.filter((c) => c.state === filter.state);
    if (filter?.protocol) filtered = filtered.filter((c) => c.protocol === filter.protocol);
    if (filter?.pid) filtered = filtered.filter((c) => c.processId === filter.pid);

    return filtered;
  }

  getListeningPorts(): ListeningPort[] {
    return [
      { protocol: 'TCP', port: 135, address: '0.0.0.0', processName: 'svchost.exe', pid: 940, service: 'RpcSs', description: 'Remote Procedure Call (RPC)' },
      { protocol: 'TCP', port: 445, address: '0.0.0.0', processName: 'System', pid: 4, service: 'LanmanServer', description: 'SMB / File and Printer Sharing' },
      { protocol: 'TCP', port: 3389, address: '0.0.0.0', processName: 'svchost.exe', pid: 1532, service: 'TermService', description: 'Remote Desktop Protocol (RDP)' },
      { protocol: 'TCP', port: 5985, address: '0.0.0.0', processName: 'svchost.exe', pid: 940, service: 'WinRM', description: 'Windows Remote Management (WinRM HTTP)' },
      { protocol: 'TCP', port: 5040, address: '127.0.0.1', processName: 'svchost.exe', pid: 2936, service: '', description: 'Windows Diagnostic Service Host' },
      { protocol: 'TCP', port: 5357, address: '0.0.0.0', processName: 'svchost.exe', pid: 940, service: 'WSDAPI', description: 'Web Services for Devices API' },
      { protocol: 'TCP', port: 5173, address: '0.0.0.0', processName: 'node.exe', pid: 9840, service: '', description: 'Vite Dev Server' },
      { protocol: 'TCP', port: 3000, address: '0.0.0.0', processName: 'node.exe', pid: 9841, service: '', description: 'Node.js Development Server' },
      { protocol: 'TCP', port: 5432, address: '127.0.0.1', processName: 'postgres.exe', pid: 5670, service: '', description: 'PostgreSQL Database Server' },
      { protocol: 'TCP', port: 9229, address: '127.0.0.1', processName: 'node.exe', pid: 9841, service: '', description: 'Node.js Debugging Protocol' },
      { protocol: 'TCP', port: 49664, address: '0.0.0.0', processName: 'lsass.exe', pid: 792, service: '', description: 'Local Security Authority Process' },
      { protocol: 'TCP', port: 49665, address: '0.0.0.0', processName: 'lsass.exe', pid: 792, service: '', description: 'Local Security Authority Process' },
      { protocol: 'TCP', port: 49666, address: '0.0.0.0', processName: 'wininit.exe', pid: 550, service: '', description: 'Windows Initialization Process (DCOM)' },
      { protocol: 'TCP', port: 49667, address: '0.0.0.0', processName: 'spoolsv.exe', pid: 2856, service: 'Spooler', description: 'Print Spooler Service' },
      { protocol: 'TCP', port: 49668, address: '0.0.0.0', processName: 'svchost.exe', pid: 940, service: '', description: 'Windows HTTP Service' },
      { protocol: 'TCP', port: 49669, address: '127.0.0.1', processName: 'svchost.exe', pid: 1532, service: '', description: 'Microsoft Edge Update Service' },
      { protocol: 'UDP', port: 53, address: '127.0.0.1', processName: 'svchost.exe', pid: 940, service: 'Dnscache', description: 'DNS Client Service' },
      { protocol: 'UDP', port: 67, address: '0.0.0.0', processName: 'svchost.exe', pid: 940, service: 'Dhcp', description: 'DHCP Client' },
      { protocol: 'UDP', port: 1900, address: '239.255.255.250', processName: 'svchost.exe', pid: 940, service: 'SSDPSRV', description: 'SSDP Discovery' },
      { protocol: 'UDP', port: 3702, address: '239.255.255.250', processName: 'svchost.exe', pid: 940, service: 'WSDAPI', description: 'WS-Discovery (Multicast)' },
      { protocol: 'UDP', port: 5353, address: '224.0.0.251', processName: 'svchost.exe', pid: 940, service: 'Dnscache', description: 'mDNS / Multicast DNS' },
      { protocol: 'UDP', port: 5355, address: '224.0.0.252', processName: 'svchost.exe', pid: 940, service: 'Dnscache', description: 'LLMNR / Link-Local Multicast Name Resolution' },
    ];
  }

  getConnectionStats(): ConnectionStats {
    const conns = this.getConnections();
    return {
      total: conns.length,
      established: conns.filter((c) => c.state === 'established').length,
      listening: conns.filter((c) => c.state === 'listen').length,
      timeWait: conns.filter((c) => c.state === 'time_wait').length,
      pidCount: new Set(conns.map((c) => c.processId)).size,
    };
  }

  getGeoInfo(ip: string): { country: string; city: string; isp: string } | null {
    return GEO_DATA[ip] || null;
  }
}
