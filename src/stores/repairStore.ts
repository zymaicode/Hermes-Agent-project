import { create } from 'zustand';

export interface DetectedIssue {
  id: string;
  category: 'display' | 'performance' | 'network' | 'audio' | 'peripherals' | 'software' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  details: string;
  evidence: string[];
  canAutoFix: boolean;
  autoFixDescription: string;
  canGuideFix: boolean;
  requiresAdmin: boolean;
  fixId: string;
  rollbackPlan: string;
}

export interface ScanProgress {
  phase: string;
  pct: number;
  category?: string;
  issuesFound: number;
}

export interface ScannerResult {
  issues: DetectedIssue[];
  systemInfo: {
    os: string;
    uptime: string;
    lastBoot: string;
    pendingUpdate: boolean;
    adminAccess: boolean;
  };
  scanDuration: number;
}

export interface FixResult {
  success: boolean;
  message: string;
  requiresRestart: boolean;
  rollbackSteps?: string[];
  performedActions: string[];
  duration: number;
  error?: string;
}

export interface RepairLogEntry {
  id: number;
  timestamp: string;
  issueId: string;
  issueTitle: string;
  category: string;
  severity: string;
  fixAction: string;
  fixResult: 'success' | 'failed' | 'partial';
  details: string;
  userApproved: boolean;
  requiresRestart: boolean;
  restartPerformed: boolean;
  rollbackAvailable: boolean;
  duration: number;
  adminElevated: boolean;
}

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

export interface BluescreenAnalysis {
  dumpFiles: Array<{ path: string; timestamp: string; sizeKB: number }>;
  eventLogEntries: Array<{ id: number; timestamp: string; message: string }>;
  possibleCauses: string[];
  stopCode: string | null;
  affectedDriver: string | null;
  recommendations: string[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type RepairState =
  | 'idle'
  | 'scanning'
  | 'results'
  | 'detail'
  | 'approving'
  | 'fixing'
  | 'done'
  | 'ai_chat'
  | 'history';

interface RepairStore {
  state: RepairState;
  scanResult: ScannerResult | null;
  scanProgress: ScanProgress | null;
  selectedIssue: DetectedIssue | null;
  fixResult: FixResult | null;
  aiDiagnosis: AiDiagnosticResult | null;
  aiChatMessages: AiChatMessage[];
  bluescreenAnalysis: BluescreenAnalysis | null;
  repairHistory: RepairLogEntry[];
  createRestorePoint: boolean;
  understandRisks: boolean;

  setState: (state: RepairState) => void;
  startScan: () => Promise<void>;
  selectIssue: (issue: DetectedIssue) => void;
  executeFix: (issueId: string) => Promise<void>;
  undoFix: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  aiDiagnose: () => Promise<void>;
  sendAiMessage: (message: string) => Promise<void>;
  analyzeBluescreen: () => Promise<void>;
  resetToIdle: () => void;
  setCreateRestorePoint: (v: boolean) => void;
  setUnderstandRisks: (v: boolean) => void;
  approveFix: () => void;
  cancelFix: () => Promise<void>;
  restartSystem: () => void;
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  state: 'idle',
  scanResult: null,
  scanProgress: null,
  selectedIssue: null,
  fixResult: null,
  aiDiagnosis: null,
  aiChatMessages: [],
  bluescreenAnalysis: null,
  repairHistory: [],
  createRestorePoint: true,
  understandRisks: false,

  setState: (state) => set({ state }),

  startScan: async () => {
    set({ state: 'scanning', scanProgress: null, scanResult: null, aiDiagnosis: null });

    try {
      const result = await window.pchelper.startRepairScan(
        (progress: ScanProgress) => {
          set({ scanProgress: progress });
        }
      );
      set({ scanResult: result as unknown as ScannerResult, state: 'results' });
    } catch {
      set({ state: 'idle' });
    }
  },

  selectIssue: (issue) => {
    set({ selectedIssue: issue, state: 'detail', fixResult: null });
  },

  executeFix: async (issueId) => {
    const { createRestorePoint } = get();
    set({ state: 'fixing', fixResult: null });

    try {
      const result = await window.pchelper.executeRepairFix(issueId, createRestorePoint);
      set({ fixResult: result, state: 'done' });
    } catch (err) {
      set({
        fixResult: {
          success: false,
          message: `修复失败: ${String(err)}`,
          requiresRestart: false,
          performedActions: [],
          duration: 0,
          error: String(err),
        },
        state: 'done',
      });
    }
  },

  undoFix: async () => {
    try {
      await window.pchelper.undoRepairFix();
      set({ state: 'results', fixResult: null, selectedIssue: null });
    } catch {
      // silent
    }
  },

  fetchHistory: async () => {
    try {
      const history = await window.pchelper.getRepairHistory();
      set({ repairHistory: history, state: 'history' });
    } catch {
      // silent
    }
  },

  aiDiagnose: async () => {
    const { scanResult } = get();
    if (!scanResult) return;

    try {
      const diagnosis = await window.pchelper.aiDiagnoseIssues(
        scanResult.issues,
        scanResult.systemInfo
      );
      set({ aiDiagnosis: diagnosis });
    } catch {
      // silent
    }
  },

  sendAiMessage: async (message) => {
    const { scanResult, aiChatMessages } = get();
    if (!scanResult) return;

    const userMsg: AiChatMessage = { role: 'user', content: message };
    set({ aiChatMessages: [...aiChatMessages, userMsg] });

    try {
      const response = await window.pchelper.aiRepairChat(message, {
        issues: scanResult.issues,
        history: [...aiChatMessages, userMsg],
      });
      const assistantMsg: AiChatMessage = { role: 'assistant', content: response.reply };
      set({ aiChatMessages: [...get().aiChatMessages, assistantMsg] });
    } catch {
      const errorMsg: AiChatMessage = {
        role: 'assistant',
        content: 'AI连接失败，请检查API设置。以下是基于本地诊断的建议...',
      };
      set({ aiChatMessages: [...get().aiChatMessages, errorMsg] });
    }
  },

  analyzeBluescreen: async () => {
    try {
      const analysis = await window.pchelper.analyzeBluescreen();
      set({ bluescreenAnalysis: analysis, state: 'detail' });
    } catch {
      // silent
    }
  },

  resetToIdle: () => {
    set({
      state: 'idle',
      scanResult: null,
      scanProgress: null,
      selectedIssue: null,
      fixResult: null,
      aiDiagnosis: null,
      aiChatMessages: [],
      bluescreenAnalysis: null,
      createRestorePoint: true,
      understandRisks: false,
    });
  },

  setCreateRestorePoint: (v) => set({ createRestorePoint: v }),
  setUnderstandRisks: (v) => set({ understandRisks: v }),

  approveFix: () => {
    const { selectedIssue } = get();
    if (selectedIssue && selectedIssue.canAutoFix) {
      set({ state: 'approving' });
    }
  },

  cancelFix: async () => {
    const { state } = get();
    if (state === 'fixing') {
      set({ state: 'results', fixResult: null });
    }
  },

  restartSystem: () => {
    // The actual restart will be triggered by the UI button
    // In Electron: require('electron').powerManager.restart()
    window.pchelper.repairCreateRestorePoint('重启前备份').catch(() => {});
  },
}));
