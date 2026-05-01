import { create } from 'zustand';
import type { PerfLogSession, PerfLogEntry } from '../../electron/perflog/recorder';

interface PerfLogState {
  sessions: PerfLogSession[];
  activeSession: PerfLogSession | null;
  sessionData: PerfLogEntry[];
  loading: boolean;
  isRecording: boolean;
  sessionName: string;
  expandedSessionId: string | null;
  result: { success: boolean; message: string } | null;

  fetchSessions: () => Promise<void>;
  startRecording: (name: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  setSessionName: (n: string) => void;
  expandSession: (id: string) => Promise<void>;
  collapseSession: () => void;
  deleteSession: (id: string) => Promise<void>;
  clearResult: () => void;
}

export const usePerfLogStore = create<PerfLogState>((set, get) => ({
  sessions: [],
  activeSession: null,
  sessionData: [],
  loading: true,
  isRecording: false,
  sessionName: '',
  expandedSessionId: null,
  result: null,

  fetchSessions: async () => {
    try {
      const sessions = await window.pchelper.getPerfLogSessions();
      const active = await window.pchelper.getActiveSession();
      set({ sessions, activeSession: active, isRecording: !!active, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  startRecording: async (name) => {
    try {
      const session = await window.pchelper.startPerfRecording(name);
      set({ activeSession: session, isRecording: true, result: { success: true, message: `Recording "${name}" started` } });
    } catch {
      set({ result: { success: false, message: 'Failed to start recording' } });
    }
    setTimeout(() => set({ result: null }), 3000);
  },

  stopRecording: async () => {
    try {
      const session = await window.pchelper.stopPerfRecording();
      set({ activeSession: null, isRecording: false, result: { success: true, message: 'Recording saved' } });
      if (session) {
        set((s) => ({ sessions: [session, ...s.sessions] }));
      }
    } catch {
      set({ result: { success: false, message: 'Failed to stop recording' } });
    }
    setTimeout(() => set({ result: null }), 3000);
  },

  setSessionName: (n) => set({ sessionName: n }),

  expandSession: async (id) => {
    set((s) => ({ expandedSessionId: s.expandedSessionId === id ? null : id }));
    try {
      const data = await window.pchelper.getPerfSessionData(id);
      set({ sessionData: data });
    } catch {
      // silent
    }
  },

  collapseSession: () => set({ expandedSessionId: null, sessionData: [] }),
  deleteSession: async (id) => {
    try {
      await window.pchelper.deletePerfSession(id);
      set((s) => ({
        sessions: s.sessions.filter((ses) => ses.id !== id),
        expandedSessionId: s.expandedSessionId === id ? null : s.expandedSessionId,
      }));
    } catch {
      // silent
    }
  },

  clearResult: () => set({ result: null }),
}));
