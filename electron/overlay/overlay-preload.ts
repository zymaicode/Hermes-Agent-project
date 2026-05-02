import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayApi', {
  aiQuery: (query: string) =>
    ipcRenderer.invoke('pchelper:overlay-ai-query', query),
  onToggleAi: (callback: () => void) => {
    ipcRenderer.on('toggle-ai', () => callback());
  },
});
