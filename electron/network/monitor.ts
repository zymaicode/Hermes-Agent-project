import type { NetworkInterface, NetworkTraffic, SpeedTestResult } from '../../src/utils/types';

let totalDL = 45.7;
let totalUL = 12.3;

const SIMULATED_INTERFACES: NetworkInterface[] = [
  {
    name: 'Ethernet',
    type: 'ethernet',
    status: 'connected',
    ipAddress: '192.168.1.100',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: ['8.8.8.8', '1.1.1.1'],
    macAddress: 'A4:BF:01:2C:4E:87',
    speed: 1000,
  },
  {
    name: 'Wi-Fi',
    type: 'wifi',
    status: 'connected',
    ipAddress: '192.168.1.101',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: ['8.8.8.8', '1.1.1.1'],
    macAddress: 'D8:3B:BF:21:6F:3C',
    speed: 866,
    signalStrength: 78,
    ssid: 'HomeNetwork-5G',
  },
  {
    name: 'Bluetooth PAN',
    type: 'bluetooth',
    status: 'disconnected',
    ipAddress: '0.0.0.0',
    subnet: '255.255.255.0',
    gateway: '0.0.0.0',
    dns: [],
    macAddress: '7C:2E:BD:89:A1:16',
    speed: 3,
  },
];

export class NetworkMonitor {
  getInterfaces(): NetworkInterface[] {
    const updated = SIMULATED_INTERFACES.map((iface) => ({ ...iface }));
    for (const iface of updated) {
      if (iface.type === 'wifi' && iface.signalStrength !== undefined) {
        iface.signalStrength = Math.max(30, Math.min(100, iface.signalStrength + (Math.random() - 0.5) * 8));
      }
    }
    return updated;
  }

  getTraffic(): NetworkTraffic {
    const dlSpeed = 50 + Math.random() * 450;
    const ulSpeed = 5 + Math.random() * 100;
    totalDL += dlSpeed * 0.001;
    totalUL += ulSpeed * 0.0003;
    return {
      downloadSpeed: Math.round(dlSpeed * 10) / 10,
      uploadSpeed: Math.round(ulSpeed * 10) / 10,
      totalDownload: Math.round(totalDL * 10) / 10,
      totalUpload: Math.round(totalUL * 10) / 10,
      activeConnections: 80 + Math.floor(Math.random() * 40),
    };
  }

  getSpeedTestResults(): SpeedTestResult {
    return {
      download: Math.round((250 + Math.random() * 600) * 10) / 10,
      upload: Math.round((20 + Math.random() * 100) * 10) / 10,
      ping: Math.round(5 + Math.random() * 30),
      timestamp: Date.now(),
    };
  }
}
