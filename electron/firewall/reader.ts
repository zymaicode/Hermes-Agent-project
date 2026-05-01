export interface FirewallRule {
  name: string;
  enabled: boolean;
  direction: 'inbound' | 'outbound';
  action: 'allow' | 'block';
  protocol: 'TCP' | 'UDP' | 'Any';
  localPorts: string;
  remotePorts: string;
  localAddresses: string;
  remoteAddresses: string;
  program: string;
  profiles: ('domain' | 'private' | 'public')[];
  description: string;
}

const RULES: FirewallRule[] = [
  { name: 'Core Networking - DNS (UDP Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'UDP', localPorts: 'Any', remotePorts: '53', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Allows outbound DNS queries for name resolution.' },
  { name: 'Core Networking - DHCP (UDP In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '68', remotePorts: '67', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Allows inbound DHCP responses for IP address assignment.' },
  { name: 'Core Networking - HTTP/HTTPS Out', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '80,443', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Allows outbound HTTP and HTTPS traffic for web browsing.' },
  { name: 'File and Printer Sharing (SMB-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '445', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['private'], description: 'Inbound SMB for file and printer sharing on private networks.' },
  { name: 'File and Printer Sharing (NB-Session-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '139', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['private'], description: 'NetBIOS session service for file sharing on private networks.' },
  { name: 'Network Discovery (LLMNR-UDP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '5355', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['private'], description: 'Link-Local Multicast Name Resolution for network discovery.' },
  { name: 'Network Discovery (mDNS-UDP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '5353', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['private'], description: 'Multicast DNS for local network service discovery.' },
  { name: 'Remote Desktop (TCP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '3389', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'Allows inbound Remote Desktop Protocol connections.' },
  { name: 'Remote Desktop (UDP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '3389', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'Allows inbound Remote Desktop via UDP for improved performance.' },
  { name: 'Windows Update Delivery Optimization', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: '7680', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Delivery Optimization for Windows Update peer-to-peer downloads.' },
  { name: 'Windows Defender Network Inspection', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.24090.11-0\\NisSrv.exe', profiles: ['domain', 'private', 'public'], description: 'Network Inspection System for real-time threat detection.' },
  { name: 'VNC Server (TCP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '5900', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\RealVNC\\VNC Server\\vncserver.exe', profiles: ['private'], description: 'Inbound VNC remote control connections.' },
  { name: 'SSH Server (TCP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '22', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Windows\\System32\\OpenSSH\\sshd.exe', profiles: ['private'], description: 'OpenSSH server for secure remote shell access.' },
  { name: 'Node.js Dev Server (TCP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '3000,5173,8080', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\nodejs\\node.exe', profiles: ['private'], description: 'Allows inbound connections to Node.js development servers.' },
  { name: 'Docker Desktop (TCP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '2375,2376', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Docker\\Docker\\resources\\com.docker.backend.exe', profiles: ['private'], description: 'Docker daemon API and TLS endpoints.' },
  { name: 'Docker Container Ports (TCP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '8000-9000', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Docker\\Docker\\resources\\vpnkit.exe', profiles: ['private'], description: 'Published container ports range for local development.' },
  { name: 'Google Chrome (TCP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '80,443', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', profiles: ['domain', 'private', 'public'], description: 'Outbound web traffic for Google Chrome browser.' },
  { name: 'Mozilla Firefox (TCP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '80,443', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe', profiles: ['domain', 'private', 'public'], description: 'Outbound web traffic for Mozilla Firefox browser.' },
  { name: 'Microsoft Edge (TCP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '80,443', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', profiles: ['domain', 'private', 'public'], description: 'Outbound web traffic for Microsoft Edge browser.' },
  { name: 'Steam Client (TCP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '27015-27036', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files (x86)\\Steam\\steam.exe', profiles: ['private', 'public'], description: 'Steam game client outbound connections.' },
  { name: 'Steam Client (UDP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'UDP', localPorts: 'Any', remotePorts: '27000-27036', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files (x86)\\Steam\\steam.exe', profiles: ['private', 'public'], description: 'Steam game traffic and voice chat via UDP.' },
  { name: 'Discord Voice (UDP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '50000-55000', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9032\\Discord.exe', profiles: ['private', 'public'], description: 'Discord voice chat UDP inbound for direct peer connections.' },
  { name: 'Minecraft Server (TCP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '25565', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Java\\jre1.8.0_391\\bin\\javaw.exe', profiles: ['private'], description: 'Minecraft game server port.' },
  { name: 'SQL Server (TCP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '1433', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\Microsoft SQL Server\\MSSQL15.MSSQLSERVER\\MSSQL\\Binn\\sqlservr.exe', profiles: ['domain', 'private'], description: 'Microsoft SQL Server database connections.' },
  { name: 'PostgreSQL (TCP-In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '5432', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\PostgreSQL\\15\\bin\\postgres.exe', profiles: ['private'], description: 'PostgreSQL database server connections.' },
  { name: 'ICMP Echo Request (In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'Any', localPorts: 'Any', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'Allow ping (ICMPv4 echo request) for network diagnostics.' },
  { name: 'ICMPv6 Echo Request (In)', enabled: true, direction: 'inbound', action: 'allow', protocol: 'Any', localPorts: 'Any', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'Allow IPv6 ping for network diagnostics.' },
  { name: 'Windows Time (UDP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'UDP', localPorts: 'Any', remotePorts: '123', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Network Time Protocol for clock synchronization.' },
  { name: 'Spotify (TCP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'TCP', localPorts: 'Any', remotePorts: '4070,443', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe', profiles: ['private', 'public'], description: 'Spotify music streaming outbound connections.' },
  { name: 'VPN - WireGuard (UDP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '51820', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\WireGuard\\wireguard.exe', profiles: ['public'], description: 'WireGuard VPN tunnel endpoint.' },
  { name: 'VPN - OpenVPN (UDP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'UDP', localPorts: '1194', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe', profiles: ['public'], description: 'OpenVPN server endpoint.' },
  { name: 'Windows Remote Management (HTTP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '5985', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'WinRM for PowerShell Remoting over HTTP.' },
  { name: 'IIS Web Server (TCP-In)', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '80,443', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private', 'public'], description: 'Internet Information Services web server ports.' },
  { name: 'Multicast DNS Discovery (UDP-Out)', enabled: true, direction: 'outbound', action: 'allow', protocol: 'UDP', localPorts: 'Any', remotePorts: '5353', localAddresses: 'Any', remoteAddresses: '224.0.0.251', program: 'System', profiles: ['private'], description: 'Outbound mDNS queries for service discovery.' },
  { name: 'Windows Media Player Network Sharing', enabled: false, direction: 'inbound', action: 'allow', protocol: 'TCP', localPorts: '2869,10243', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['private'], description: 'Media streaming and network sharing service.' },
  { name: 'Hyper-V Virtual Switch', enabled: true, direction: 'inbound', action: 'allow', protocol: 'Any', localPorts: 'Any', remotePorts: 'Any', localAddresses: 'Any', remoteAddresses: 'Any', program: 'System', profiles: ['domain', 'private'], description: 'Hyper-V virtual switch traffic passthrough.' },
];

export class FirewallReader {
  private rules: FirewallRule[];

  constructor() {
    this.rules = RULES.map((r) => ({ ...r }));
  }

  getRules(): FirewallRule[] {
    return this.rules;
  }

  toggleRule(name: string, enabled: boolean): { success: boolean; message: string } {
    const rule = this.rules.find((r) => r.name === name);
    if (!rule) {
      return { success: false, message: `Rule "${name}" not found` };
    }
    rule.enabled = enabled;
    return { success: true, message: `Rule "${name}" ${enabled ? 'enabled' : 'disabled'}` };
  }
}
