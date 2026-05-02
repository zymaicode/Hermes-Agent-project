import { callAiApi, extractJson } from './apiClient';

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

const SYSTEM_PROCS = ['svchost.exe', 'System', 'Idle', 'csrss.exe', 'wininit.exe', 'lsass.exe', 'services.exe', 'smss.exe', 'winlogon.exe', 'spoolsv.exe'];
const BROWSER_PROCS = ['chrome.exe', 'msedge.exe', 'firefox.exe', 'brave.exe'];

export class BehaviorAnalyzer {
  constructor(
    private endpoint: string,
    private model: string,
    private apiKey: string,
  ) {}

  async analyzeProcess(proc: ProcessAnalysisContext): Promise<ProcessAnalysisResult> {
    if (!this.apiKey) return this.localAnalysis(proc);

    const prompt = this.buildAnalysisPrompt(proc);
    const res = await callAiApi(
      { endpoint: this.endpoint, model: this.model, apiKey: this.apiKey },
      [{ role: 'user', content: prompt }], 512,
      '你是一个Windows进程安全分析专家。只输出JSON。',
    );

    if (res.error || !res.content) return this.localAnalysis(proc);
    return extractJson<ProcessAnalysisResult>(res.content) || this.localAnalysis(proc);
  }

  private buildAnalysisPrompt(proc: ProcessAnalysisContext): string {
    return [
      '你是一个Windows进程行为分析专家。分析以下进程的信息，给出安全性评估和建议。',
      '',
      '进程信息：',
      `- 名称：${proc.name}`,
      `- PID：${proc.pid}`,
      `- CPU占用：${proc.cpu}%`,
      `- 内存占用：${proc.memory} MB`,
      `- 状态：${proc.status}`,
      `- 路径：${proc.path || '未知'}`,
      `- 启动用户：${proc.user || '未知'}`,
      `- 启动时间：${proc.startTime || '未知'}`,
      '',
      '请分析：',
      '1. 这是否是一个正常的系统进程？',
      '2. 其资源占用是否合理？',
      '3. 是否存在安全风险？',
      '4. 给出具体建议',
      '',
      '请按以下JSON格式回复：',
      JSON.stringify({
        verdict: '"normal" | "suspicious" | "warning" | "critical"',
        summary: '一句话结论',
        analysis: '详细分析（100-200字）',
        suggestions: ['建议1', '建议2'],
      }, null, 2),
    ].join('\n');
  }

  private localAnalysis(proc: ProcessAnalysisContext): ProcessAnalysisResult {
    const cpuHigh = proc.cpu > 30;
    const memHigh = proc.memory > 500;
    const isSystemProc = SYSTEM_PROCS.includes(proc.name);
    const isBrowser = BROWSER_PROCS.includes(proc.name);
    const nameLower = proc.name.toLowerCase();

    let verdict: ProcessAnalysisResult['verdict'] = 'normal';
    const suggestions: string[] = [];

    if (isSystemProc) {
      verdict = 'normal';
    } else if (nameLower.includes('miner') || nameLower.includes('crypto')) {
      verdict = 'critical';
    } else if (cpuHigh && memHigh && !isBrowser) {
      verdict = 'suspicious';
    } else if (cpuHigh && !isBrowser) {
      verdict = 'warning';
    }

    if (cpuHigh) suggestions.push('CPU占用较高，建议检查是否有异常活动');
    if (memHigh) suggestions.push('内存占用较大，建议重启该进程释放资源');

    const p = proc.path?.toLowerCase() || '';
    if (!proc.path || p.includes('temp\\') || p.includes('appdata\\local\\temp')) {
      suggestions.push('⚠ 进程从临时目录运行，建议扫描病毒');
    }

    return {
      verdict,
      summary: verdict === 'normal' ? `${proc.name} 运行正常` : `${proc.name} 可能存在异常`,
      analysis: [
        `${proc.name} (PID: ${proc.pid})`,
        isSystemProc ? ' 是系统关键进程，' : '',
        `当前CPU占用${proc.cpu}%，内存${proc.memory}MB。`,
        cpuHigh ? 'CPU占用偏高。' : '资源占用在正常范围内。',
        !proc.path ? '路径信息不可用。' : '',
      ].join(''),
      suggestions: suggestions.length ? suggestions : ['一切正常，无需操作'],
    };
  }
}
