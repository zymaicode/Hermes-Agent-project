import type { DetectedIssue } from './engine';

export interface AiDiagnosticResult {
  analysis: string;
  likelyRootCause: string;
  recommendedFix: Array<{
    steps: string[];
    priority: number;
    confidence: number;
    explanation: string;
  }>;
  followUpQuestions: string[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class RepairAiAssistant {
  constructor(
    private endpoint: string,
    private model: string,
    private apiKey: string,
  ) {}

  async diagnoseIssues(
    issues: DetectedIssue[],
    systemInfo: Record<string, unknown>,
  ): Promise<AiDiagnosticResult> {
    if (!this.apiKey) {
      return this.localDiagnose(issues);
    }

    try {
      const prompt = this.buildDiagnosticPrompt(issues, systemInfo);
      const response = await this.callAi(prompt);

      return this.parseDiagnosticResponse(response, issues);
    } catch {
      return this.localDiagnose(issues);
    }
  }

  async chatDiagnose(
    userMessage: string,
    context: { issues: DetectedIssue[]; history: AiChatMessage[] },
  ): Promise<{ reply: string; suggestedFixes?: string[] }> {
    if (!this.apiKey) {
      return this.localChatResponse(userMessage, context.issues);
    }

    try {
      const messages: AiChatMessage[] = [
        {
          role: 'system',
          content: `你是一个专业的Windows电脑故障诊断助手。用户正在遇到电脑问题，请根据以下扫描结果帮助他们诊断问题。

当前检测到的问题:
${context.issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n')}

请用中文回复。根据用户描述的症状，分析最可能的原因，并建议修复步骤。如果用户描述的症状与扫描结果不符，请指出。`,
        },
        ...context.history,
        { role: 'user', content: userMessage },
      ];

      const url = `${this.endpoint}/v1/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return this.localChatResponse(userMessage, context.issues);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
      };
      const reply = data.choices[0]?.message?.content || '';

      return {
        reply,
        suggestedFixes: this.extractSuggestedFixes(reply, context.issues),
      };
    } catch {
      return this.localChatResponse(userMessage, context.issues);
    }
  }

  async analyzeBluescreen(
    dumpFiles: Array<{ path: string; timestamp: string; sizeKB: number }>,
    eventLogEntries: Array<{ id: number; timestamp: string; message: string }>,
  ): Promise<{
    likelyCause: string;
    affectedComponent: string;
    fixSuggestion: string;
    stopCode: string;
    confidence: number;
  }> {
    // Local analysis based on known stop codes
    const stopCodeMatch = eventLogEntries[0]?.message?.match(/\((VIDEO_TDR_FAILURE|MEMORY_MANAGEMENT|SYSTEM_SERVICE_EXCEPTION|CRITICAL_PROCESS_DIED|PAGE_FAULT_IN_NONPAGED_AREA|KERNEL_SECURITY_CHECK_FAILURE|DRIVER_IRQL_NOT_LESS_OR_EQUAL|VIDEO_DXGKRNL_FATAL_ERROR)\)/);
    const stopCode = stopCodeMatch ? stopCodeMatch[1] : 'UNKNOWN';

    const analyses: Record<string, { cause: string; component: string; fix: string; confidence: number }> = {
      'VIDEO_TDR_FAILURE': {
        cause: '显卡驱动超时无响应，可能是驱动版本不兼容、GPU过热或电源供电不足',
        component: '显卡驱动 (nvlddmkm.sys)',
        fix: '1) 使用DDU彻底卸载显卡驱动后重新安装最新版本\n2) 检查GPU温度，清理灰尘\n3) 检查电源功率是否足够',
        confidence: 0.85,
      },
      'MEMORY_MANAGEMENT': {
        cause: '内存管理错误，可能是物理内存故障或驱动程序非法内存访问',
        component: '物理内存/内存控制器驱动',
        fix: '1) 运行Windows内存诊断工具\n2) 尝试重新插拔内存条\n3) 更新主板芯片组驱动',
        confidence: 0.78,
      },
      'SYSTEM_SERVICE_EXCEPTION': {
        cause: '系统服务异常，通常由第三方驱动程序引起',
        component: '第三方驱动程序',
        fix: '1) 更新所有驱动程序\n2) 运行sfc /scannow修复系统文件\n3) 卸载最近安装的软件/驱动',
        confidence: 0.72,
      },
    };

    const analysis = analyses[stopCode] || {
      cause: '系统遇到严重错误，可能由硬件故障、驱动冲突或系统文件损坏引起',
      affectedComponent: '需要进一步分析dump文件',
      fix: '1) 更新所有驱动程序\n2) 运行系统文件检查\n3) 检查硬件状态',
      confidence: 0.5,
    };

    return {
      likelyCause: analysis.cause,
      affectedComponent: analysis.component,
      fixSuggestion: analysis.fix,
      stopCode,
      confidence: analysis.confidence,
    };
  }

  private async callAi(prompt: string): Promise<string> {
    const url = `${this.endpoint}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content || '';
  }

  private buildDiagnosticPrompt(issues: DetectedIssue[], systemInfo: Record<string, unknown>): string {
    return `你是一个Windows电脑故障诊断专家。请分析以下检测到的问题并给出诊断建议。

系统信息:
- 操作系统: ${systemInfo.os || 'Windows 11 Pro'}
- 运行时间: ${systemInfo.uptime || '未知'}
- 最后启动: ${systemInfo.lastBoot || '未知'}
- 管理员权限: ${systemInfo.adminAccess ? '有' : '无'}

检测到的问题 (${issues.length}个):
${issues.map((i, idx) => `
${idx + 1}. [${i.severity}] ${i.title} (${i.category})
   描述: ${i.description}
   详情: ${i.details}
   证据: ${i.evidence.join(', ')}
   可自动修复: ${i.canAutoFix ? '是' : '否'}
`).join('\n')}

请提供:
1. 综合分析 (所有问题的关联性)
2. 最可能的根本原因
3. 推荐修复方案 (按优先级排列)
4. 需要向用户确认的问题

请用中文回复。`;
  }

  private parseDiagnosticResponse(response: string, issues: DetectedIssue[]): AiDiagnosticResult {
    return {
      analysis: response,
      likelyRootCause: '需要综合分析多个检测结果',
      recommendedFix: issues
        .filter((i) => i.canAutoFix)
        .map((i, idx) => ({
          steps: [i.autoFixDescription],
          priority: idx + 1,
          confidence: 0.8,
          explanation: i.details,
        })),
      followUpQuestions: [
        '这些问题是什么时候开始出现的？',
        '最近是否安装过新的软件或驱动？',
        '是否尝试过其他修复方法？',
      ],
    };
  }

  private localDiagnose(issues: DetectedIssue[]): AiDiagnosticResult {
    const criticalIssues = issues.filter((i) => i.severity === 'critical');
    const warningIssues = issues.filter((i) => i.severity === 'warning');

    let likelyRootCause = '未发现明确的根本原因';
    if (criticalIssues.length > 0) {
      likelyRootCause = `最可能的原因与 ${criticalIssues[0].category} 类别中的严重问题相关: ${criticalIssues[0].title}`;
    } else if (warningIssues.length > 0) {
      likelyRootCause = `多个 ${warningIssues[0].category} 相关问题可能需要关注`;
    }

    return {
      analysis: `检测到 ${issues.length} 个问题 (${criticalIssues.length} 严重, ${warningIssues.length} 警告, ${issues.length - criticalIssues.length - warningIssues.length} 信息)。建议按优先级处理严重问题。`,
      likelyRootCause,
      recommendedFix: issues
        .filter((i) => i.canAutoFix)
        .map((i, idx) => ({
          steps: [i.autoFixDescription],
          priority: idx + 1,
          confidence: 0.7,
          explanation: `基于检测到的 ${i.category} 问题推荐此修复`,
        })),
      followUpQuestions: [
        '这些问题是什么时候开始出现的？',
        '最近是否安装过新的软件或驱动？',
      ],
    };
  }

  private localChatResponse(
    userMessage: string,
    issues: DetectedIssue[],
  ): { reply: string; suggestedFixes?: string[] } {
    const msg = userMessage.toLowerCase();

    if (msg.includes('黑屏') || msg.includes('屏幕')) {
      const displayIssues = issues.filter((i) => i.category === 'display');
      if (displayIssues.length > 0) {
        return {
          reply: `根据扫描结果，我发现了与显示相关的 ${displayIssues.length} 个问题。最可能的原因是${displayIssues[0].title}。建议您尝试: 按 Win+Ctrl+Shift+B 快捷键重启显卡驱动，或者让我帮您自动修复这些问题。`,
          suggestedFixes: displayIssues.filter((i) => i.canAutoFix).map((i) => i.fixId),
        };
      }
      return {
        reply: '根据扫描结果，当前未检测到显示相关问题。如果确实出现黑屏，可能是硬件连接问题。请检查显示器数据线是否连接牢固，或尝试更换线缆。按 Win+Ctrl+Shift+B 可以快速重启显卡驱动。',
      };
    }

    if (msg.includes('卡') || msg.includes('慢') || msg.includes('性能')) {
      const perfIssues = issues.filter((i) => i.category === 'performance');
      if (perfIssues.length > 0) {
        return {
          reply: `检测到 ${perfIssues.length} 个可能影响性能的问题。${perfIssues.map((i) => i.title).join('、')}。建议优先处理高严重度的问题。`,
          suggestedFixes: perfIssues.filter((i) => i.canAutoFix).map((i) => i.fixId),
        };
      }
      return {
        reply: '性能问题可能由多种因素引起。建议运行完整扫描以识别具体问题。您也可以打开任务管理器 (Ctrl+Shift+Esc) 查看哪些进程占用资源最多。',
      };
    }

    if (msg.includes('网') || msg.includes('wifi') || msg.includes('网络')) {
      const netIssues = issues.filter((i) => i.category === 'network');
      if (netIssues.length > 0) {
        return {
          reply: `发现 ${netIssues.length} 个网络相关的问题。${netIssues[0].title}。建议先尝试网络重置。`,
          suggestedFixes: netIssues.filter((i) => i.canAutoFix).map((i) => i.fixId),
        };
      }
      return {
        reply: '未检测到网络相关问题。如果无法上网，请检查路由器是否正常工作，或尝试重启路由器。',
      };
    }

    if (msg.includes('声音') || msg.includes('音频') || msg.includes('没声')) {
      const audioIssues = issues.filter((i) => i.category === 'audio');
      if (audioIssues.length > 0) {
        return {
          reply: `发现 ${audioIssues.length} 个音频问题。${audioIssues[0].title}。可以尝试重启音频服务来解决。`,
          suggestedFixes: audioIssues.filter((i) => i.canAutoFix).map((i) => i.fixId),
        };
      }
      return {
        reply: '未检测到音频问题。请检查扬声器是否已连接并开启，音量是否被静音。',
      };
    }

    if (msg.includes('蓝屏') || msg.includes('死机') || msg.includes('崩溃')) {
      return {
        reply: '蓝屏问题通常是驱动或硬件故障引起的。建议运行蓝屏分析工具检查minidump文件，同时检查最近是否安装了新的驱动程序或硬件。如果您有具体的蓝屏错误代码，请告诉我。',
        suggestedFixes: ['analyze-bluescreen'],
      };
    }

    return {
      reply: `根据当前扫描结果，我发现了 ${issues.length} 个潜在问题。您能具体描述一下遇到的是什么问题吗？比如: 电脑运行慢、无法上网、没有声音、频繁死机等。这样我可以给出更有针对性的建议。`,
    };
  }

  private extractSuggestedFixes(reply: string, issues: DetectedIssue[]): string[] {
    const fixIds: string[] = [];
    for (const issue of issues) {
      if (issue.canAutoFix && reply.includes(issue.title.substring(0, 4))) {
        fixIds.push(issue.fixId);
      }
    }
    return fixIds;
  }
}
