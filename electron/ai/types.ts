export interface AiConfig {
  endpoint: string;
  model: string;
  apiKey: string;
}

export interface AiDiagnosticReport {
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  summary: string;
  sections: AiDiagnosticSection[];
  timestamp: number;
}

export interface AiDiagnosticSection {
  title: string;
  severity: 'good' | 'warning' | 'critical';
  items: AiDiagnosticItem[];
}

export interface AiDiagnosticItem {
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail: string;
  suggestion?: string;
}
