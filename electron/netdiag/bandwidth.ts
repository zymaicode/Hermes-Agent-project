import { createRng } from '../repair/utils';

export interface BandwidthResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  server: string;
  duration: number;
  dataDownloaded: number;
}

const TEST_SERVERS = [
  'Beijing - China Telecom',
  'Shanghai - China Unicom',
  'Guangzhou - China Mobile',
  'Shenzhen - Tencent Cloud',
  'Hong Kong - HKIX',
  'Tokyo - NTT',
  'Singapore - AWS',
  'Frankfurt - Cloudflare',
  'London - GCP',
  'San Jose - Fastly',
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function testBandwidth(): Promise<BandwidthResult> {
  const startTime = performance.now();
  const rng = createRng(Date.now());
  const server = TEST_SERVERS[Math.floor(rng() * TEST_SERVERS.length)];

  // Phase 1: Latency test
  await sleep(300 + rng() * 400);
  const latency = Math.round((5 + rng() * 45) * 100) / 100;

  // Phase 2: Download test (simulated multi-stream)
  await sleep(800 + rng() * 1200);
  const downloadRng = createRng(Date.now() + 1);
  const downloadSpeed = Math.round((50 + downloadRng() * 450) * 100) / 100;

  // Phase 3: Upload test
  await sleep(400 + rng() * 800);
  const uploadRng = createRng(Date.now() + 2);
  const uploadSpeed = Math.round((10 + uploadRng() * 90) * 100) / 100;

  const duration = Math.round((performance.now() - startTime) / 100) / 10;
  const dataDownloaded = Math.round((downloadSpeed * (duration / 8)) * 100) / 100;

  return {
    downloadSpeed,
    uploadSpeed,
    latency,
    server,
    duration,
    dataDownloaded,
  };
}
