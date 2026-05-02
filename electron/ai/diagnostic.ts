import type { AiConfig, AiDiagnosticReport, AiDiagnosticSection } from './types';
import type { HardwareSnapshot } from '../hardware/collector';

export class AiDiagnosticEngine {
  constructor(private config: AiConfig) {}

  async runFullDiagnostic(snapshot: HardwareSnapshot): Promise<AiDiagnosticReport> {
    const prompt = this.buildDiagnosticPrompt(snapshot);

    if (!this.config.apiKey) {
      return this.fallbackDiagnostic(snapshot);
    }

    try {
      const response = await this.callAi(prompt);
      return this.parseResponse(response, snapshot);
    } catch {
      return this.fallbackDiagnostic(snapshot);
    }
  }

  private buildDiagnosticPrompt(snapshot: HardwareSnapshot): string {
    return `你是一位专业的PC健康诊断专家。请基于以下系统数据，给出全面的系统健康评估报告。

系统数据：
${JSON.stringify(snapshot, null, 2)}

请按以下JSON格式回复（不要加额外的文本或markdown）：
{
  "score": <0-100的数字>,
  "grade": <"excellent"|"good"|"fair"|"poor"|"critical">,
  "summary": "<一句话总结系统状态>",
  "sections": [
    {
      "title": "<分类标题，如CPU、内存、磁盘、GPU>",
      "severity": <"good"|"warning"|"critical">,
      "items": [
        {
          "label": "<指标名称>",
          "status": <"ok"|"warning"|"error">,
          "detail": "<具体数据描述>",
          "suggestion": "<优化建议，可选>"
        }
      ]
    }
  ]
}`;
  }

  private async callAi(prompt: string): Promise<string> {
    const url = `${this.config.endpoint}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: '你是一个专业的PC诊断专家。只输出JSON，不要有任何其他文字。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content || '';
  }

  private parseResponse(text: string, snapshot: HardwareSnapshot): AiDiagnosticReport {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AiDiagnosticReport;
      }
    } catch {
      // fallback
    }
    return this.fallbackDiagnostic(snapshot);
  }

  private fallbackDiagnostic(snapshot: HardwareSnapshot): AiDiagnosticReport {
    const cpuUsage = snapshot.cpu?.usage ?? 0;
    const memUsage = snapshot.memory?.usagePercent ?? 0;
    const diskWarning = snapshot.disks?.some((d) => (d.usagePercent ?? 0) > 90);
    const gpuUsage = snapshot.gpu?.usage ?? 0;
    const gpuTemp = snapshot.gpu?.temp ?? 0;
    const cpuTemp = snapshot.cpu?.temp ?? 0;

    const score = Math.max(0, Math.round(100 - cpuUsage * 0.25 - memUsage * 0.25 - gpuUsage * 0.1 - (diskWarning ? 15 : 0) - (cpuTemp > 80 ? 10 : cpuTemp > 65 ? 5 : 0) - (gpuTemp > 80 ? 10 : gpuTemp > 65 ? 5 : 0)));
    const grade = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : score >= 30 ? 'poor' : 'critical';

    const sections: AiDiagnosticSection[] = [];

    // CPU section
    const cpuItems = [{
      label: 'CPU 使用率',
      status: (cpuUsage > 80 ? 'error' : cpuUsage > 60 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
      detail: `当前使用率 ${cpuUsage}%`,
      suggestion: cpuUsage > 80 ? 'CPU负载过高，请关闭不必要的程序' : undefined,
    }];
    cpuItems.push({
      label: 'CPU 温度',
      status: (cpuTemp > 80 ? 'error' : cpuTemp > 65 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
      detail: `当前温度 ${cpuTemp}°C`,
      suggestion: cpuTemp > 80 ? 'CPU温度过高，请检查散热' : undefined,
    });
    sections.push({
      title: 'CPU',
      severity: cpuUsage > 80 || cpuTemp > 80 ? 'critical' : cpuUsage > 60 || cpuTemp > 65 ? 'warning' : 'good',
      items: cpuItems,
    });

    // Memory section
    sections.push({
      title: '内存',
      severity: memUsage > 85 ? 'critical' : memUsage > 70 ? 'warning' : 'good',
      items: [{
        label: '内存占用',
        status: (memUsage > 85 ? 'error' : memUsage > 70 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
        detail: `当前占用 ${memUsage}% (已用 ${snapshot.memory.used}GB / 共 ${snapshot.memory.total}GB)`,
        suggestion: memUsage > 85 ? '内存不足，建议关闭部分程序或增加内存条' : undefined,
      }],
    });

    // GPU section
    const gpuItems = [{
      label: 'GPU 使用率',
      status: (gpuUsage > 80 ? 'error' : gpuUsage > 60 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
      detail: `当前使用率 ${gpuUsage}%`,
      suggestion: gpuUsage > 80 ? 'GPU负载过高，请关闭图形密集型程序' : undefined,
    }];
    gpuItems.push({
      label: 'GPU 温度',
      status: (gpuTemp > 80 ? 'error' : gpuTemp > 65 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
      detail: `当前温度 ${gpuTemp}°C`,
      suggestion: gpuTemp > 80 ? 'GPU温度过高，请检查散热' : undefined,
    });
    sections.push({
      title: 'GPU',
      severity: gpuUsage > 80 || gpuTemp > 80 ? 'critical' : gpuUsage > 60 || gpuTemp > 65 ? 'warning' : 'good',
      items: gpuItems,
    });

    // Disk section
    if (diskWarning) {
      sections.push({
        title: '磁盘',
        severity: 'critical',
        items: snapshot.disks.filter((d) => (d.usagePercent ?? 0) > 90).map((d) => ({
          label: d.name || d.model || '磁盘',
          status: 'error' as const,
          detail: `使用率 ${d.usagePercent}% (剩余 ${d.free}GB)`,
          suggestion: '磁盘空间不足，请清理不必要的文件',
        })),
      });
    }

    return {
      score,
      grade,
      summary: grade === 'excellent' ? '系统状态良好' : grade === 'good' ? '系统基本正常' : '系统需要关注',
      sections,
      timestamp: Date.now(),
    };
  }
}
