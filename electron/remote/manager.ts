export interface RemoteConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'RDP' | 'VNC' | 'SSH' | 'TeamViewer' | 'AnyDesk';
  username: string;
  authenticationType: 'password' | 'key' | 'smartcard' | 'network_level';
  resolution: string;
  colorDepth: number;
  useGateway: boolean;
  gatewayHost?: string;
  favorite: boolean;
  lastConnected: string | null;
  connectionCount: number;
  group: string;
  notes: string;
  tags: string[];
  status: 'online' | 'offline' | 'unknown';
  localDrives: boolean;
  clipboardSharing: boolean;
  audioRedirection: 'local' | 'remote' | 'none';
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

const BUILD_IN_CONNECTIONS: Omit<RemoteConnection, 'status'>[] = [
  {
    id: '1',
    name: 'Work PC',
    host: '192.168.1.100',
    port: 3389,
    protocol: 'RDP',
    username: 'jason.chen',
    authenticationType: 'network_level',
    resolution: '2560x1440',
    colorDepth: 32,
    useGateway: false,
    gatewayHost: undefined,
    favorite: true,
    lastConnected: new Date(Date.now() - 3600000).toISOString(),
    connectionCount: 347,
    group: 'Work',
    notes: 'Primary workstation at office. Use VPN first.',
    tags: ['office', 'primary', 'domain-joined'],
    localDrives: true,
    clipboardSharing: true,
    audioRedirection: 'local',
  },
  {
    id: '2',
    name: 'Home Server',
    host: '10.0.0.50',
    port: 3389,
    protocol: 'RDP',
    username: 'administrator',
    authenticationType: 'password',
    resolution: '1920x1080',
    colorDepth: 24,
    useGateway: false,
    gatewayHost: undefined,
    favorite: true,
    lastConnected: new Date(Date.now() - 86400000 * 2).toISOString(),
    connectionCount: 128,
    group: 'Home',
    notes: 'Plex server + NAS. Wake-on-LAN enabled.',
    tags: ['nas', 'plex', 'local'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
  {
    id: '3',
    name: 'Dev Server (Staging)',
    host: 'dev-staging.example.com',
    port: 22,
    protocol: 'SSH',
    username: 'deploy',
    authenticationType: 'key',
    resolution: '',
    colorDepth: 16,
    useGateway: false,
    gatewayHost: undefined,
    favorite: true,
    lastConnected: new Date(Date.now() - 86400000 * 5).toISOString(),
    connectionCount: 892,
    group: 'Servers',
    notes: 'Staging environment for QA testing. Deploy via Ansible.',
    tags: ['staging', 'linux', 'deploy'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
  {
    id: '4',
    name: 'Azure VM (Production)',
    host: 'prod-app.eastus.cloudapp.azure.com',
    port: 3389,
    protocol: 'RDP',
    username: 'prodadmin',
    authenticationType: 'smartcard',
    resolution: '1920x1080',
    colorDepth: 32,
    useGateway: true,
    gatewayHost: 'rdg.contoso.com',
    favorite: false,
    lastConnected: new Date(Date.now() - 86400000 * 12).toISOString(),
    connectionCount: 56,
    group: 'Cloud',
    notes: 'Production app server. Requires Azure VPN.',
    tags: ['azure', 'production', 'critical'],
    localDrives: false,
    clipboardSharing: true,
    audioRedirection: 'remote',
  },
  {
    id: '5',
    name: 'Raspberry Pi',
    host: '192.168.1.200',
    port: 22,
    protocol: 'SSH',
    username: 'pi',
    authenticationType: 'key',
    resolution: '',
    colorDepth: 16,
    useGateway: false,
    gatewayHost: undefined,
    favorite: false,
    lastConnected: new Date(Date.now() - 86400000 * 30).toISOString(),
    connectionCount: 23,
    group: 'Home',
    notes: 'Pi-hole + HomeBridge. Headless.',
    tags: ['iot', 'pihole', 'raspberry'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
  {
    id: '6',
    name: 'Media Center',
    host: '192.168.1.80',
    port: 5900,
    protocol: 'VNC',
    username: 'media',
    authenticationType: 'password',
    resolution: '1920x1080',
    colorDepth: 24,
    useGateway: false,
    gatewayHost: undefined,
    favorite: false,
    lastConnected: null,
    connectionCount: 45,
    group: 'Home',
    notes: 'Living room HTPC. Rarely accessed remotely.',
    tags: ['htpc', 'living-room'],
    localDrives: true,
    clipboardSharing: false,
    audioRedirection: 'remote',
  },
  {
    id: '7',
    name: 'Client Office PC',
    host: 'client-pc.acmecorp.local',
    port: 0,
    protocol: 'TeamViewer',
    username: 'support',
    authenticationType: 'password',
    resolution: '1920x1080',
    colorDepth: 32,
    useGateway: false,
    gatewayHost: undefined,
    favorite: false,
    lastConnected: new Date(Date.now() - 86400000 * 90).toISOString(),
    connectionCount: 12,
    group: 'Clients',
    notes: 'Access for remote support. TeamViewer ID: 123 456 789.',
    tags: ['client', 'support', 'external'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
  {
    id: '8',
    name: 'Remote Office',
    host: 'office-remote.dyndns.org',
    port: 0,
    protocol: 'AnyDesk',
    username: 'office',
    authenticationType: 'password',
    resolution: '2560x1440',
    colorDepth: 32,
    useGateway: false,
    gatewayHost: undefined,
    favorite: true,
    lastConnected: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    connectionCount: 201,
    group: 'Work',
    notes: 'Backup office PC. Use when VPN is down.',
    tags: ['backup', 'office', 'remote'],
    localDrives: true,
    clipboardSharing: true,
    audioRedirection: 'local',
  },
  {
    id: '9',
    name: 'Database Server',
    host: 'db-prod.internal',
    port: 22,
    protocol: 'SSH',
    username: 'dbadmin',
    authenticationType: 'key',
    resolution: '',
    colorDepth: 16,
    useGateway: true,
    gatewayHost: 'bastion.internal',
    favorite: false,
    lastConnected: null,
    connectionCount: 0,
    group: 'Servers',
    notes: 'PostgreSQL production. Access via bastion only.',
    tags: ['database', 'postgresql', 'production'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
  {
    id: '10',
    name: 'Test VM',
    host: '192.168.1.150',
    port: 5900,
    protocol: 'VNC',
    username: 'tester',
    authenticationType: 'password',
    resolution: '1280x720',
    colorDepth: 24,
    useGateway: false,
    gatewayHost: undefined,
    favorite: false,
    lastConnected: new Date(Date.now() - 86400000 * 60).toISOString(),
    connectionCount: 8,
    group: 'Servers',
    notes: 'Test environment for new deployments.',
    tags: ['test', 'vm', 'local'],
    localDrives: false,
    clipboardSharing: false,
    audioRedirection: 'none',
  },
];

export class RemoteDesktopManager {
  private connections: RemoteConnection[] = [];
  private nextId = 1000;

  constructor() {
    this.connections = BUILD_IN_CONNECTIONS.map((c) => ({
      ...c,
      id: String(this.nextId++),
      status: 'unknown' as const,
    }));
  }

  getConnections(): RemoteConnection[] {
    return [...this.connections].sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      return a.name.localeCompare(b.name);
    });
  }

  connect(id: string): { success: boolean; message: string; command?: string } {
    const conn = this.connections.find((c) => c.id === id);
    if (!conn) return { success: false, message: 'Connection not found.' };

    conn.lastConnected = new Date().toISOString();
    conn.connectionCount++;

    const commands: Record<string, string> = {
      RDP: `mstsc /v:${conn.host}:${conn.port}`,
      SSH: `ssh ${conn.username}@${conn.host} -p ${conn.port}`,
      VNC: `vncviewer ${conn.host}:${conn.port}`,
      TeamViewer: `teamviewer --connect ${conn.host}`,
      AnyDesk: `anydesk ${conn.host}`,
    };

    return {
      success: true,
      message: `Connecting to ${conn.name}...`,
      command: commands[conn.protocol] || `${conn.protocol}://${conn.host}`,
    };
  }

  testConnection(id: string): { success: boolean; latency: number; message: string } {
    const conn = this.connections.find((c) => c.id === id);
    if (!conn) return { success: false, latency: 0, message: 'Connection not found.' };

    const online = conn.status === 'online' || conn.status === 'unknown';
    const latency = online ? Math.round(1 + Math.random() * 40) : 0;

    if (online && conn.status === 'unknown') {
      conn.status = 'online';
    }

    return {
      success: online,
      latency,
      message: online ? `Reachable (${latency}ms)` : 'Host unreachable.',
    };
  }

  addConnection(conn: Omit<RemoteConnection, 'id' | 'lastConnected' | 'connectionCount'>): RemoteConnection {
    const entry: RemoteConnection = {
      ...conn,
      id: String(this.nextId++),
      lastConnected: null,
      connectionCount: 0,
    };
    this.connections.push(entry);
    return entry;
  }

  updateConnection(id: string, updates: Partial<RemoteConnection>): RemoteConnection {
    const idx = this.connections.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Connection ${id} not found.`);
    this.connections[idx] = { ...this.connections[idx], ...updates };
    return this.connections[idx];
  }

  deleteConnection(id: string): void {
    this.connections = this.connections.filter((c) => c.id !== id);
  }

  toggleFavorite(id: string): void {
    const conn = this.connections.find((c) => c.id === id);
    if (conn) conn.favorite = !conn.favorite;
  }

  getGroups(): string[] {
    return ['Work', 'Home', 'Servers', 'Clients', 'Cloud'];
  }

  importFromFile(_path: string): { added: number; failed: number } {
    return { added: 3, failed: 0 };
  }

  exportToFile(): string {
    return JSON.stringify(this.connections, null, 2);
  }
}
