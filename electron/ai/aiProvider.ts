import { AiDiagnosticEngine } from './diagnostic';
import type { AiConfig } from './types';
import { getSetting } from '../database/index';

let diagnosticEngine: AiDiagnosticEngine | null = null;

export async function getDiagnosticEngine(): Promise<AiDiagnosticEngine> {
  if (!diagnosticEngine) {
    const config: AiConfig = {
      endpoint: getSetting('ai_endpoint') || 'https://api.deepseek.com',
      model: getSetting('ai_model') || 'deepseek-chat',
      apiKey: getSetting('ai_api_key') || '',
    };
    diagnosticEngine = new AiDiagnosticEngine(config);
  }
  return diagnosticEngine;
}

export function resetDiagnosticEngine(): void {
  diagnosticEngine = null;
}
