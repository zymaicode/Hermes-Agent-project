export interface LanDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  status: 'online' | 'offline';
  lastSeen: string;
  openPorts: number[];
}

const MOCK_DEVICES: LanDevice[] = [
  { ip: '192.168.1.1',   mac: '00:11:22:33:44:01', hostname: 'router.home',            vendor: 'TP-Link',       status: 'online', lastSeen: new Date().toISOString(), openPorts: [80, 443, 53] },
  { ip: '192.168.1.50',  mac: '00:11:22:33:44:50', hostname: 'nas.home',               vendor: 'Synology',      status: 'online', lastSeen: new Date().toISOString(), openPorts: [5000, 5001, 22] },
  { ip: '192.168.1.101', mac: 'AA:BB:CC:DD:EE:01', hostname: 'workstation',           vendor: 'Intel Corp',    status: 'online', lastSeen: new Date().toISOString(), openPorts: [] },
  { ip: '192.168.1.102', mac: 'AA:BB:CC:DD:EE:02', hostname: 'media-pc',              vendor: 'ASUSTek',       status: 'online', lastSeen: new Date().toISOString(), openPorts: [3389] },
  { ip: '192.168.1.150', mac: '00:11:22:33:44:A0', hostname: 'smart-tv',              vendor: 'Samsung',       status: 'online', lastSeen: new Date().toISOString(), openPorts: [80, 443] },
  { ip: '192.168.1.200', mac: '00:11:22:33:44:C0', hostname: 'printer-office',        vendor: 'HP',            status: 'offline', lastSeen: new Date(Date.now() - 86400000).toISOString(), openPorts: [] },
  { ip: '192.168.1.55',  mac: '00:11:22:33:44:55', hostname: 'raspberry-pi',          vendor: 'Raspberry Pi',  status: 'online', lastSeen: new Date().toISOString(), openPorts: [22, 80] },
  { ip: '192.168.1.75',  mac: '00:11:22:33:44:75', hostname: 'esp32-sensor',          vendor: 'Espressif',     status: 'online', lastSeen: new Date().toISOString(), openPorts: [80] },
];

export class LanScanner {
  scan(): LanDevice[] {
    return MOCK_DEVICES.map(d => ({
      ...d,
      status: Math.random() > 0.15 ? 'online' as const : 'offline' as const,
      lastSeen: new Date().toISOString(),
    }));
  }

  refresh(): LanDevice[] {
    return this.scan();
  }
}
