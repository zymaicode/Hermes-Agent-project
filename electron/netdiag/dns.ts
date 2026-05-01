import { createRng } from '../repair/utils';

export interface DnsRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT' | 'SOA';
  value: string;
  ttl: number;
}

export interface DnsLookupResult {
  domain: string;
  records: DnsRecord[];
  duration: number;
  resolver: string;
}

const SIMULATED_DOMAINS: Record<string, DnsRecord[]> = {
  'baidu.com': [
    { type: 'A', value: '110.242.68.66', ttl: 600 },
    { type: 'A', value: '110.242.68.67', ttl: 600 },
    { type: 'AAAA', value: '240e:83:205:1e1::', ttl: 600 },
    { type: 'MX', value: '10 mx.baidu.com', ttl: 1800 },
    { type: 'MX', value: '20 mx2.baidu.com', ttl: 1800 },
    { type: 'NS', value: 'ns1.baidu.com', ttl: 86400 },
    { type: 'NS', value: 'ns2.baidu.com', ttl: 86400 },
    { type: 'TXT', value: 'v=spf1 include:_spf.baidu.com ~all', ttl: 3600 },
    { type: 'SOA', value: 'ns1.baidu.com admin.baidu.com 2024010101 3600 900 604800 86400', ttl: 86400 },
  ],
  'google.com': [
    { type: 'A', value: '142.250.80.46', ttl: 300 },
    { type: 'AAAA', value: '2607:f8b0:4005:80e::200e', ttl: 300 },
    { type: 'MX', value: '10 smtp.google.com', ttl: 600 },
    { type: 'NS', value: 'ns1.google.com', ttl: 86400 },
    { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
  ],
  'github.com': [
    { type: 'A', value: '140.82.121.4', ttl: 60 },
    { type: 'MX', value: '10 aspmx.l.google.com', ttl: 3600 },
    { type: 'NS', value: 'ns-1707.awsdns-21.co.uk', ttl: 86400 },
    { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
  ],
  'taobao.com': [
    { type: 'A', value: '203.119.214.15', ttl: 600 },
    { type: 'A', value: '203.119.214.16', ttl: 600 },
    { type: 'CNAME', value: 'taobao.com.gds.alibabadns.com', ttl: 600 },
    { type: 'NS', value: 'ns1.alibabadns.com', ttl: 86400 },
    { type: 'TXT', value: 'v=spf1 include:_spf.taobao.com ~all', ttl: 3600 },
  ],
  'qq.com': [
    { type: 'A', value: '61.129.7.47', ttl: 600 },
    { type: 'MX', value: '10 mx.qq.com', ttl: 1800 },
    { type: 'NS', value: 'ns1.qq.com', ttl: 86400 },
  ],
};

const RESOLVERS = ['8.8.8.8', '1.1.1.1', '114.114.114.114', '223.5.5.5'];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function dnsLookup(domain: string, types?: string[]): Promise<DnsLookupResult> {
  const startTime = performance.now();
  const rng = createRng(Date.now());
  const resolver = RESOLVERS[Math.floor(rng() * RESOLVERS.length)];

  await sleep(100 + rng() * 300);

  let records = SIMULATED_DOMAINS[domain];
  if (!records) {
    // Generate generic records for unknown domain
    records = [
      { type: 'A' as const, value: `${93 + Math.floor(rng() * 30)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`, ttl: 600 },
      { type: 'NS' as const, value: `ns1.${domain}`, ttl: 86400 },
      { type: 'NS' as const, value: `ns2.${domain}`, ttl: 86400 },
      { type: 'SOA' as const, value: `ns1.${domain} admin.${domain} 2024010101 3600 900 604800 86400`, ttl: 86400 },
    ];
  }

  let filtered = records;
  if (types && types.length > 0) {
    const upperTypes = types.map((t) => t.toUpperCase());
    if (!upperTypes.includes('ALL')) {
      filtered = records.filter((r) => upperTypes.includes(r.type));
    }
  }

  const duration = Math.round((performance.now() - startTime) / 100) / 10;

  return {
    domain,
    records: filtered,
    duration,
    resolver,
  };
}
