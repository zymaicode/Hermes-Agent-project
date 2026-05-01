import { createRng } from '../repair/utils';

export interface PingResult {
  target: string;
  status: 'success' | 'timeout' | 'error';
  ip: string;
  sent: number;
  received: number;
  loss: number;
  rtt: {
    min: number;
    max: number;
    avg: number;
    last: number;
  };
  hops: number;
  ttl: number;
  duration: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function ping(target: string, count = 4, timeout = 2000): Promise<PingResult> {
  const startTime = performance.now();
  const rng = createRng(Date.now());
  const rtts: number[] = [];

  for (let i = 0; i < count; i++) {
    await sleep(200 + rng() * 300);
    const seqRng = createRng(Date.now() + i * 100);
    const success = seqRng() > 0.05;
    if (success) {
      const baseRtt = target === 'localhost' || target === '127.0.0.1' ? 0.5 : 5 + seqRng() * 100;
      rtts.push(Math.round(baseRtt * 100) / 100);
    }
  }

  const duration = Math.round((performance.now() - startTime) / 100) / 10;
  const rtt = {
    min: rtts.length ? Math.min(...rtts) : 0,
    max: rtts.length ? Math.max(...rtts) : 0,
    avg: rtts.length ? Math.round((rtts.reduce((a, b) => a + b, 0) / rtts.length) * 100) / 100 : 0,
    last: rtts.length ? rtts[rtts.length - 1] : 0,
  };

  return {
    target,
    status: rtts.length > 0 ? 'success' : 'timeout',
    ip: target === 'localhost' || target === '127.0.0.1' ? '127.0.0.1' : `192.168.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
    sent: count,
    received: rtts.length,
    loss: Math.round(((count - rtts.length) / count) * 100),
    rtt,
    hops: 1,
    ttl: target === 'localhost' || target === '127.0.0.1' ? 64 : 54 + Math.floor(rng() * 8),
    duration,
  };
}
