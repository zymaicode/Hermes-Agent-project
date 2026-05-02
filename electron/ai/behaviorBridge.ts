import { BehaviorAnalyzer, type ProcessAnalysisContext, type ProcessAnalysisResult } from './behaviorAnalyzer';
import type { AiConfig } from './types';

export async function analyzeProcess(proc: ProcessAnalysisContext, config: AiConfig): Promise<ProcessAnalysisResult> {
  const analyzer = new BehaviorAnalyzer(config.endpoint, config.model, config.apiKey);
  return analyzer.analyzeProcess(proc);
}
