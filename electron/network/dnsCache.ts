export interface DnsCacheEntry {
  name: string;
  type: string;
  ttl: number;
  length: number;
  section: string;
}

const MOCK_DNS_CACHE: DnsCacheEntry[] = [
  { name: 'google.com',              type: 'A',     ttl: 245, length: 4,   section: 'Answer' },
  { name: 'google.com',              type: 'AAAA',  ttl: 245, length: 16,  section: 'Answer' },
  { name: 'youtube.com',             type: 'A',     ttl: 182, length: 4,   section: 'Answer' },
  { name: 'github.com',              type: 'A',     ttl: 58,  length: 4,   section: 'Answer' },
  { name: 'microsoft.com',           type: 'A',     ttl: 120, length: 4,   section: 'Answer' },
  { name: 'cdn.jsdelivr.net',        type: 'CNAME', ttl: 300, length: 8,   section: 'Answer' },
  { name: 'api.deepseek.com',        type: 'A',     ttl: 60,  length: 4,   section: 'Answer' },
  { name: 'stackoverflow.com',       type: 'A',     ttl: 89,  length: 4,   section: 'Answer' },
  { name: 'npmjs.com',               type: 'A',     ttl: 180, length: 4,   section: 'Answer' },
  { name: 'wikipedia.org',           type: 'AAAA',  ttl: 300, length: 16,  section: 'Answer' },
  { name: 'reddit.com',              type: 'A',     ttl: 43,  length: 4,   section: 'Answer' },
  { name: 'amazon.com',              type: 'A',     ttl: 210, length: 4,   section: 'Answer' },
  { name: 'bing.com',                type: 'CNAME', ttl: 3600, length: 8,  section: 'Answer' },
  { name: 'localhost',               type: 'A',     ttl: 86400, length: 4, section: 'Answer' },
];

export class DnsCacheManager {
  getCache(): DnsCacheEntry[] {
    return MOCK_DNS_CACHE.map(e => ({
      ...e,
      ttl: Math.max(0, e.ttl - Math.floor(Math.random() * 10)),
    }));
  }

  flushCache(): { success: boolean; cleared: number } {
    return { success: true, cleared: MOCK_DNS_CACHE.length };
  }

  getCacheSize(): number {
    return MOCK_DNS_CACHE.length;
  }
}
