import { createRng } from '../repair/utils';

export interface Hop {
  hop: number;
  ip: string;
  hostname: string;
  rtt1: number;
  rtt2: number;
  rtt3: number;
  location: string;
}

export interface TraceRouteResult {
  target: string;
  ip: string;
  hops: Hop[];
  totalHops: number;
  duration: number;
}

const ISP_HOPS: Array<{ ip: string; hostname: string; location: string }> = [
  { ip: '192.168.1.1', hostname: '_gateway', location: '本地网关' },
  { ip: '10.0.0.1', hostname: 'lo0.router.local', location: '本地路由' },
  { ip: '100.64.1.1', hostname: '100.64.1.1', location: '运营商接入层' },
  { ip: '172.30.0.1', hostname: 'agg.core.isp.net', location: '运营商汇聚层' },
  { ip: '202.96.128.1', hostname: 'core1.china.isp.net', location: '骨干网 - 北京' },
  { ip: '202.96.128.86', hostname: 'core2.china.isp.net', location: '骨干网 - 上海' },
  { ip: '202.96.128.166', hostname: 'border.china.isp.net', location: '骨干网出口 - 广州' },
  { ip: '59.43.130.1', hostname: 'peer1.backbone.net', location: '国际出口 - 香港' },
  { ip: '129.250.2.1', hostname: 'xe-0-1-1.border.us.net', location: '国际骨干网 - 东京' },
  { ip: '129.250.3.1', hostname: 'ae-1.border.us.net', location: '国际骨干网 - 圣何塞' },
  { ip: '129.250.4.1', hostname: 'core.nyc.datacenter.net', location: '纽约数据中心' },
];

const DEST_HOSTS: Record<string, string[]> = {
  baidu: ['110.242.68.66', 'www.baidu.com'],
  google: ['142.250.80.46', 'www.google.com'],
  github: ['140.82.121.4', 'www.github.com'],
  taobao: ['203.119.214.15', 'www.taobao.com'],
  qq: ['61.129.7.47', 'www.qq.com'],
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function traceRoute(target: string, maxHops = 16): Promise<TraceRouteResult> {
  const startTime = performance.now();
  const rng = createRng(Date.now());
  const totalHops = 8 + Math.floor(rng() * (maxHops - 8));
  const hops: Hop[] = [];
  const destKey = Object.keys(DEST_HOSTS).find((k) => target.toLowerCase().includes(k));
  const [destIp, destHost] = destKey ? DEST_HOSTS[destKey] : [`${203 + Math.floor(rng() * 20)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`, target];

  for (let i = 1; i <= totalHops; i++) {
    await sleep(100 + rng() * 200);
    const hopRng = createRng(Date.now() + i * 100);

    let hopData: Hop;
    if (i <= ISP_HOPS.length && i < totalHops) {
      const template = ISP_HOPS[i - 1];
      hopData = {
        hop: i,
        ip: template.ip,
        hostname: template.hostname,
        rtt1: Math.round((1 + hopRng() * 15) * 100) / 100,
        rtt2: Math.round((1 + hopRng() * 15) * 100) / 100,
        rtt3: Math.round((1 + hopRng() * 15) * 100) / 100,
        location: template.location,
      };
    } else if (i === totalHops) {
      hopData = {
        hop: i,
        ip: destIp,
        hostname: destHost,
        rtt1: Math.round((5 + hopRng() * 50) * 100) / 100,
        rtt2: Math.round((5 + hopRng() * 50) * 100) / 100,
        rtt3: Math.round((5 + hopRng() * 50) * 100) / 100,
        location: destKey ? (destKey === 'baidu' || destKey === 'qq' || destKey === 'taobao' ? '中国境内' : '海外') : '目标位置',
      };
    } else {
      // Transit hop after ISP HOPs
      const transitIdx = i - ISP_HOPS.length;
      hopData = {
        hop: i,
        ip: `10.${10 + transitIdx + Math.floor(hopRng() * 10)}.${Math.floor(hopRng() * 255)}.${Math.floor(hopRng() * 255)}`,
        hostname: `transit${transitIdx}.backbone.net`,
        rtt1: Math.round((10 + hopRng() * 80) * 100) / 100,
        rtt2: Math.round((10 + hopRng() * 80) * 100) / 100,
        rtt3: Math.round((10 + hopRng() * 80) * 100) / 100,
        location: '骨干网中转节点',
      };
    }
    hops.push(hopData);
  }

  const duration = Math.round((performance.now() - startTime) / 100) / 10;

  return {
    target,
    ip: destIp,
    hops,
    totalHops,
    duration,
  };
}
