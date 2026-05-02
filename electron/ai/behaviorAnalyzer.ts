export interface ProcessAnalysisContext {
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: string;
  path?: string;
  user?: string;
  startTime?: string;
}

export interface ProcessAnalysisResult {
  verdict: 'normal' | 'suspicious' | 'warning' | 'critical';
  summary: string;
  analysis: string;
  suggestions: string[];
}

export class BehaviorAnalyzer {
  constructor(
    private endpoint: string,
    private model: string,
    private apiKey: string,
  ) {}

  async analyzeProcess(proc: ProcessAnalysisContext): Promise<ProcessAnalysisResult> {
    if (!this.apiKey) {
      return this.localAnalysis(proc);
    }

    const prompt = `你是一个Windows进程行为分析专家。分析以下进程的信息，给出安全性评估和建议。

进程信息：
- 名称：${proc.name}
- PID：${proc.pid}
- CPU占用：${proc.cpu}%
- 内存占用：${proc.memory} MB
- 状态：${proc.status}
- 路径：${proc.path || '未知'}
- 启动用户：${proc.user || '未知'}
- 启动时间：${proc.startTime || '未知'}

请分析：
1. 这是否是一个正常的系统进程？
2. 其资源占用是否合理？
3. 是否存在安全风险？
4. 给出具体建议

请按以下JSON格式回复：
{
  "verdict": "normal" | "suspicious" | "warning" | "critical",
  "summary": "一句话结论",
  "analysis": "详细分析（100-200字）",
  "suggestions": ["建议1", "建议2"]
}`;

    try {
      const url = `${this.endpoint}/v1/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: '你是一个Windows进程安全分析专家。只输出JSON。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 512,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const text = data.choices[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]) as ProcessAnalysisResult;
    } catch {
      // Fall through to local analysis
    }
    return this.localAnalysis(proc);
  }

  private localAnalysis(proc: ProcessAnalysisContext): ProcessAnalysisResult {
    const cpuHigh = proc.cpu > 30;
    const memHigh = proc.memory > 500;
    const isSystemProc = ['svchost.exe', 'System', 'Idle', 'csrss.exe', 'wininit.exe', 'lsass.exe', 'services.exe', 'smss.exe', 'winlogon.exe', 'spoolsv.exe'].includes(proc.name);
    const isBrowser = ['chrome.exe', 'msedge.exe', 'firefox.exe', 'brave.exe'].includes(proc.name);

    let verdict: ProcessAnalysisResult['verdict'] = 'normal';
    const suggestions: string[] = [];

    if (cpuHigh && !isBrowser && !isSystemProc) { verdict = 'warning'; }
    if (cpuHigh && memHigh && !isBrowser && !isSystemProc) { verdict = 'suspicious'; }
    if (proc.name.toLowerCase().includes('miner') || proc.name.toLowerCase().includes('crypto')) { verdict = 'critical'; }
    if (isSystemProc) { verdict = 'normal'; }

    if (cpuHigh) suggestions.push('CPU占用较高，建议检查是否有异常活动');
    if (memHigh) suggestions.push('内存占用较大，建议重启该进程释放资源');
    if (!proc.path || proc.path.includes('Temp\\') || proc.path.includes('AppData\\Local\\Temp')) {
      suggestions.push('⚠ 进程从临时目录运行，建议扫描病毒');
    }

    return {
      verdict,
      summary: verdict === 'normal' ? `${proc.name} 运行正常` : `${proc.name} 可能存在异常`,
      analysis: `${proc.name} (PID: ${proc.pid}) ${isSystemProc ? '是系统关键进程，' : ''}当前CPU占用${proc.cpu}%，内存${proc.memory}MB。${
        cpuHigh ? 'CPU占用偏高。' : '资源占用在正常范围内。'
      }${!proc.path ? '路径信息不可用。' : ''}`,
      suggestions: suggestions.length ? suggestions : ['一切正常，无需操作'],
    };
  }
}
