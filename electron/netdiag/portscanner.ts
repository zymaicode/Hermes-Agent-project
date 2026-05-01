import { createRng } from '../repair/utils';

export interface PortResult {
  port: number;
  service: string;
  state: 'open' | 'closed' | 'filtered';
  banner?: string;
}

export interface PortScanResult {
  target: string;
  ports: PortResult[];
  openCount: number;
  duration: number;
}

const COMMON_PORTS: Array<{ port: number; service: string; banner?: string }> = [
  { port: 21, service: 'FTP', banner: '220 FTP Server Ready' },
  { port: 22, service: 'SSH', banner: 'SSH-2.0-OpenSSH_8.9' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP', banner: '220 mail.example.com ESMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP', banner: 'HTTP/1.1 200 OK\r\nServer: nginx/1.24.0' },
  { port: 110, service: 'POP3' },
  { port: 135, service: 'RPC' },
  { port: 139, service: 'NetBIOS' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS', banner: 'HTTP/1.1 200 OK\r\nServer: nginx/1.24.0' },
  { port: 445, service: 'SMB' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 1723, service: 'PPTP' },
  { port: 3306, service: 'MySQL', banner: '5.7.38 MySQL Community Server' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 5900, service: 'VNC' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP-Alt', banner: 'HTTP/1.1 200 OK\r\nServer: Apache/2.4.57' },
  { port: 8443, service: 'HTTPS-Alt' },
  { port: 9090, service: 'Web-Admin' },
  { port: 27017, service: 'MongoDB' },
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const QUICK_PORTS = [22, 80, 443, 3389, 8080, 8443];
const FULL_RANGE_START = 1;
const FULL_RANGE_END = 1024;

export async function scanPorts(target: string, ports?: number[]): Promise<PortScanResult> {
  const startTime = performance.now();
  const rng = createRng(Date.now());

  const targets = ports && ports.length > 0 ? ports : QUICK_PORTS;
  const results: PortResult[] = [];
  const isLocalhost = target === 'localhost' || target === '127.0.0.1';

  for (const port of targets) {
    await sleep(30 + rng() * 50);
    const portRng = createRng(Date.now() + port * 100);
    const commonPort = COMMON_PORTS.find((p) => p.port === port);

    let state: 'open' | 'closed' | 'filtered';
    if (isLocalhost) {
      // Localhost: more ports open
      state = portRng() < 0.5 ? 'open' : (portRng() < 0.8 ? 'closed' : 'filtered');
    } else {
      // Remote: most ports closed
      const r = portRng();
      state = r < 0.15 ? 'open' : (r < 0.7 ? 'closed' : 'filtered');
    }

    results.push({
      port,
      service: commonPort?.service || '未知',
      state,
      banner: state === 'open' && commonPort?.banner ? commonPort.banner : undefined,
    });
  }

  const duration = Math.round((performance.now() - startTime) / 100) / 10;
  const openCount = results.filter((r) => r.state === 'open').length;

  return {
    target,
    ports: results,
    openCount,
    duration,
  };
}
