export interface BandwidthProcess {
  pid: number;
  processName: string;
  downloadSpeed: number;
  uploadSpeed: number;
  totalBytes: number;
  protocol: string;
  remoteAddress: string;
}

const MOCK_PROCESSES: BandwidthProcess[] = [
  { pid: 1234, processName: 'chrome.exe',       downloadSpeed: 2450, uploadSpeed: 320,  totalBytes: 890,  protocol: 'TCP', remoteAddress: '142.250.80.46:443' },
  { pid: 5678, processName: 'steam.exe',        downloadSpeed: 8500, uploadSpeed: 120,  totalBytes: 12000, protocol: 'TCP', remoteAddress: '155.133.248.34:27015' },
  { pid: 9012, processName: 'discord.exe',      downloadSpeed: 180,  uploadSpeed: 45,   totalBytes: 210,  protocol: 'UDP', remoteAddress: '162.159.136.232:443' },
  { pid: 3456, processName: 'dropbox.exe',      downloadSpeed: 670,  uploadSpeed: 1200, totalBytes: 3400, protocol: 'TCP', remoteAddress: '199.47.216.179:443' },
  { pid: 7890, processName: 'bittorrent.exe',   downloadSpeed: 3200, uploadSpeed: 2100, totalBytes: 8500, protocol: 'TCP', remoteAddress: '85.17.186.131:6881' },
  { pid: 2345, processName: 'system',           downloadSpeed: 50,   uploadSpeed: 30,   totalBytes: 120,  protocol: 'TCP', remoteAddress: '13.107.4.52:80' },
  { pid: 6789, processName: 'svchost.exe',      downloadSpeed: 95,   uploadSpeed: 60,   totalBytes: 180,  protocol: 'UDP', remoteAddress: '52.96.36.138:443' },
  { pid: 1111, processName: 'spotify.exe',      downloadSpeed: 320,  uploadSpeed: 8,    totalBytes: 450,  protocol: 'TCP', remoteAddress: '35.186.224.27:443' },
];

export class BandwidthTop {
  getTopProcesses(limit: number = 10): BandwidthProcess[] {
    return [...MOCK_PROCESSES]
      .sort((a, b) => (b.downloadSpeed + b.uploadSpeed) - (a.downloadSpeed + a.uploadSpeed))
      .slice(0, limit)
      .map(p => ({
        ...p,
        downloadSpeed: Math.max(10, p.downloadSpeed + (Math.random() - 0.5) * 200),
        uploadSpeed: Math.max(5, p.uploadSpeed + (Math.random() - 0.5) * 50),
      }));
  }

  getTotalBw(): { totalDownload: number; totalUpload: number } {
    return MOCK_PROCESSES.reduce(
      (acc, p) => ({ totalDownload: acc.totalDownload + p.downloadSpeed, totalUpload: acc.totalUpload + p.uploadSpeed }),
      { totalDownload: 0, totalUpload: 0 }
    );
  }
}
