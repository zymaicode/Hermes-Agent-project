export interface ExportReport {
  generatedAt: string;
  systemInfo: {
    hostname: string;
    os: string;
    uptime: string;
    manufacturer: string;
    model: string;
  };
  hardware: {
    cpu: { name: string; cores: number; threads: number; baseClock: number; usage: number; temp: number };
    memory: { total: number; used: number; slots: number; type: string };
    disks: Array<{ name: string; total: number; used: number; type: string; health: string }>;
    gpu: { name: string; vram: number; usage: number; temp: number };
    motherboard: { manufacturer: string; model: string; bios: string };
  };
  software: { totalInstalled: number; topApps: string[]; pendingUpdates: number; conflicts: number };
  health: { score: number; grade: string; topIssues: string[] };
  performance: { benchmarkScore: number; benchmarkGrade: string };
  recommendations: string[];
}

export interface ReportTemplate {
  name: string;
  sections: ('summary' | 'hardware' | 'software' | 'health' | 'performance' | 'full')[];
  format: 'json' | 'html' | 'text' | 'csv';
  includeCharts: boolean;
  includeRecommendations: boolean;
}

export class ReportExporter {
  generateReport(_template?: ReportTemplate): ExportReport {
    return {
      generatedAt: new Date().toISOString(),
      systemInfo: {
        hostname: 'DESKTOP-8F3K2LM',
        os: 'Windows 11 Pro 23H2 (Build 22631.3155)',
        uptime: '14 days, 06:42:18',
        manufacturer: 'Dell Inc.',
        model: 'Precision 5570',
      },
      hardware: {
        cpu: { name: 'Intel Core i9-12900H', cores: 14, threads: 20, baseClock: 2.5, usage: 34, temp: 62 },
        memory: { total: 32768, used: 18452, slots: 2, type: 'DDR5-4800' },
        disks: [
          { name: 'C:', total: 512000, used: 312000, type: 'NVMe SSD', health: 'Good' },
          { name: 'D:', total: 1000000, used: 650000, type: 'HDD', health: 'Good' },
        ],
        gpu: { name: 'NVIDIA RTX A2000 Laptop GPU', vram: 4096, usage: 12, temp: 48 },
        motherboard: { manufacturer: 'Dell Inc.', model: '0NVF7K', bios: '1.5.2' },
      },
      software: {
        totalInstalled: 87,
        topApps: ['Visual Studio Code', 'Docker Desktop', 'Node.js', 'Python 3.12', 'Git'],
        pendingUpdates: 5,
        conflicts: 3,
      },
      health: {
        score: 82,
        grade: 'Good',
        topIssues: ['5 software updates pending', 'Disk C: is 61% full', 'Memory usage at 56%'],
      },
      performance: {
        benchmarkScore: 7450,
        benchmarkGrade: 'Excellent',
      },
      recommendations: [
        'Update outdated software (5 apps have newer versions available)',
        'Run disk cleanup to free up space on C: drive',
        'Consider adding more RAM if memory usage consistently exceeds 80%',
        'Review startup programs to reduce boot time',
        'Enable automatic Windows Updates for critical security patches',
      ],
    };
  }

  exportToJson(report: ExportReport): string {
    return JSON.stringify(report, null, 2);
  }

  exportToHtml(report: ExportReport): string {
    const hw = report.hardware;
    const disksHtml = hw.disks.map((d) => `
      <tr><td>${d.name}</td><td>${this.formatMB(d.total)}</td><td>${this.formatMB(d.used)}</td><td>${d.type}</td><td>${d.health}</td></tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Report — ${report.systemInfo.hostname}</title>
<style>
  :root { --bg: #0d1117; --card: #161b22; --border: #30363d; --text: #c9d1d9; --muted: #8b949e; --accent: #58a6ff; --green: #3fb950; --yellow: #d2991d; --orange: #db6d28; --red: #f85149; --purple: #a371f7; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); padding: 24px; max-width: 960px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 16px; color: var(--accent); margin: 24px 0 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
  .meta { color: var(--muted); font-size: 12px; margin-bottom: 20px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
  .card .value { font-size: 28px; font-weight: 700; }
  .card .label { font-size: 11px; color: var(--muted); margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 600; font-size: 10px; text-transform: uppercase; }
  .score { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 700; }
  .score-good { background: var(--green)33; color: var(--green); }
  .rec li { margin: 4px 0; font-size: 13px; }
  .rec li:before { content: "• "; color: var(--accent); }
  @media print { body { background: #fff; color: #000; } .card { border-color: #ccc; } }
</style>
</head>
<body>
  <h1>PCHelper System Report</h1>
  <div class="meta">Generated: ${new Date(report.generatedAt).toLocaleString()} | Host: ${report.systemInfo.hostname}</div>

  <div class="summary">
    <div class="card"><div class="value" style="color:var(--green)">${report.health.score}</div><div class="label">Health Score</div></div>
    <div class="card"><div class="value" style="color:var(--accent)">${report.performance.benchmarkScore.toLocaleString()}</div><div class="label">Benchmark</div></div>
    <div class="card"><div class="value">${report.software.totalInstalled}</div><div class="label">Installed Apps</div></div>
    <div class="card"><div class="value" style="color:var(--yellow)">${report.software.pendingUpdates}</div><div class="label">Pending Updates</div></div>
  </div>

  <h2>System Information</h2>
  <table>
    <tr><td>Hostname</td><td>${report.systemInfo.hostname}</td></tr>
    <tr><td>OS</td><td>${report.systemInfo.os}</td></tr>
    <tr><td>Uptime</td><td>${report.systemInfo.uptime}</td></tr>
    <tr><td>Manufacturer</td><td>${report.systemInfo.manufacturer}</td></tr>
    <tr><td>Model</td><td>${report.systemInfo.model}</td></tr>
  </table>

  <h2>Hardware</h2>
  <table>
    <tr><th>Component</th><th>Detail</th></tr>
    <tr><td>CPU</td><td>${hw.cpu.name} (${hw.cpu.cores}C/${hw.cpu.threads}T, ${hw.cpu.baseClock}GHz, ${hw.cpu.temp}°C, ${hw.cpu.usage}% usage)</td></tr>
    <tr><td>Memory</td><td>${this.formatMB(hw.memory.total)} total (${this.formatMB(hw.memory.used)} used), ${hw.memory.type}, ${hw.memory.slots} slots</td></tr>
    <tr><td>GPU</td><td>${hw.gpu.name}, ${hw.gpu.vram}MB VRAM, ${hw.gpu.temp}°C, ${hw.gpu.usage}% usage</td></tr>
    <tr><td>Motherboard</td><td>${hw.motherboard.manufacturer} ${hw.motherboard.model} (BIOS ${hw.motherboard.bios})</td></tr>
  </table>

  <h2>Disks</h2>
  <table>
    <tr><th>Drive</th><th>Total</th><th>Used</th><th>Type</th><th>Health</th></tr>
    ${disksHtml}
  </table>

  <h2>Software</h2>
  <table>
    <tr><td>Total Installed</td><td>${report.software.totalInstalled}</td></tr>
    <tr><td>Pending Updates</td><td>${report.software.pendingUpdates}</td></tr>
    <tr><td>Known Conflicts</td><td>${report.software.conflicts}</td></tr>
    <tr><td>Top Apps</td><td>${report.software.topApps.join(', ')}</td></tr>
  </table>

  <h2>Recommendations</h2>
  <ol class="rec">${report.recommendations.map((r) => `<li>${r}</li>`).join('')}</ol>

  <div style="margin-top:32px; font-size:10px; color:var(--muted); text-align:center">Generated by PCHelper</div>
</body>
</html>`;
  }

  exportToText(report: ExportReport): string {
    const lines = [
      `========================================`,
      `  PCHelper System Report`,
      `  Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      `  Host: ${report.systemInfo.hostname}`,
      `========================================`,
      ``,
      `--- System Information ---`,
      `  OS:          ${report.systemInfo.os}`,
      `  Manufacturer: ${report.systemInfo.manufacturer}`,
      `  Model:       ${report.systemInfo.model}`,
      `  Uptime:      ${report.systemInfo.uptime}`,
      ``,
      `--- Health Score ---`,
      `  Score: ${report.health.score}/100 (${report.health.grade})`,
      `  Issues:`,
    ];
    for (const issue of report.health.topIssues) {
      lines.push(`    - ${issue}`);
    }
    lines.push(
      ``,
      `--- Hardware ---`,
      `  CPU: ${report.hardware.cpu.name} | ${report.hardware.cpu.cores}C/${report.hardware.cpu.threads}T | ${report.hardware.cpu.baseClock}GHz | ${report.hardware.cpu.temp}°C | ${report.hardware.cpu.usage}%`,
      `  RAM: ${this.formatMB(report.hardware.memory.total)} (${this.formatMB(report.hardware.memory.used)} used) | ${report.hardware.memory.type} | ${report.hardware.memory.slots} slots`,
      `  GPU: ${report.hardware.gpu.name} | ${report.hardware.gpu.vram}MB | ${report.hardware.gpu.temp}°C | ${report.hardware.gpu.usage}%`,
      `  MB:  ${report.hardware.motherboard.manufacturer} ${report.hardware.motherboard.model} (BIOS ${report.hardware.motherboard.bios})`,
      ``,
      `--- Disks ---`,
    );
    for (const d of report.hardware.disks) {
      lines.push(`  ${d.name}: ${this.formatMB(d.total)} total | ${this.formatMB(d.used)} used | ${d.type} | ${d.health}`);
    }
    lines.push(
      ``,
      `--- Software ---`,
      `  Installed: ${report.software.totalInstalled} apps | Updates pending: ${report.software.pendingUpdates} | Conflicts: ${report.software.conflicts}`,
      `  Top: ${report.software.topApps.join(', ')}`,
      ``,
      `--- Performance ---`,
      `  Benchmark: ${report.performance.benchmarkScore} (${report.performance.benchmarkGrade})`,
      ``,
      `--- Recommendations ---`,
    );
    for (const r of report.recommendations) {
      lines.push(`  * ${r}`);
    }
    lines.push(``, `Generated by PCHelper`);
    return lines.join('\n');
  }

  exportToCsv(section: string, data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => String(row[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  getAvailableTemplates(): ReportTemplate[] {
    return [
      { name: 'Quick Summary', sections: ['summary'], format: 'text', includeCharts: false, includeRecommendations: true },
      { name: 'Full Report', sections: ['full'], format: 'html', includeCharts: true, includeRecommendations: true },
      { name: 'Hardware Specs', sections: ['hardware'], format: 'json', includeCharts: false, includeRecommendations: false },
      { name: 'Software Inventory', sections: ['software'], format: 'csv', includeCharts: false, includeRecommendations: false },
    ];
  }

  private formatMB(mb: number): string {
    if (mb >= 1000000) return `${(mb / 1000000).toFixed(2)} TB`;
    if (mb >= 1000) return `${(mb / 1000).toFixed(0)} GB`;
    return `${mb} MB`;
  }
}
