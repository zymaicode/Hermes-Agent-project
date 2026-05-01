import { create } from 'zustand';
import type { ChatMessage } from '../utils/types';

interface ChatState {
  messages: ChatMessage[];
  inputText: string;
  loading: boolean;
  endpoint: string;
  model: string;

  setInputText: (text: string) => void;
  fetchHistory: () => Promise<void>;
  sendMessage: () => Promise<void>;
  clearHistory: () => Promise<void>;
  setEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputText: '',
  loading: false,
  endpoint: 'https://api.deepseek.com',
  model: 'deepseek-v4-pro',

  setInputText: (text) => set({ inputText: text }),

  fetchHistory: async () => {
    const history = await window.pchelper.getChatHistory(100);
    set({
      messages: (history as ChatMessage[]).map((m) => ({
        ...m,
        role: m.role as 'user' | 'assistant' | 'system',
      })),
    });
  },

  sendMessage: async () => {
    const { inputText, loading, messages, endpoint, model } = get();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      timestamp: Date.now(),
      role: 'user',
      content: inputText.trim(),
    };

    set({ messages: [...messages, userMsg], inputText: '', loading: true });

    try {
      const response = await window.pchelper.sendChatMessage(
        userMsg.content,
        endpoint,
        model
      );
      const { content } = response as { role: string; content: string };
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        timestamp: Date.now(),
        role: 'assistant',
        content,
      };
      set((state) => ({
        messages: [...state.messages, assistantMsg],
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  clearHistory: async () => {
    await window.pchelper.clearChatHistory();
    set({ messages: [] });
  },

  setEndpoint: (endpoint) => set({ endpoint }),
  setModel: (model) => set({ model }),
}));
