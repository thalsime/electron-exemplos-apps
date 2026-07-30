import { contextBridge, ipcRenderer } from 'electron'

// A página só enxerga estas sete operações, uma para cada uso que o exemplo fazia
// do módulo remote. As consultas que antes eram síncronas devolvem promessa.
contextBridge.exposeInMainWorld('windowApi', {
  close: (): Promise<void> => ipcRenderer.invoke('window:close'),
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  unmaximize: (): Promise<void> => ipcRenderer.invoke('window:unmaximize'),
  setFullScreen: (flag: boolean): Promise<void> =>
    ipcRenderer.invoke('window:set-full-screen', flag),
  isFullScreen: (): Promise<boolean> => ipcRenderer.invoke('window:is-full-screen'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
})
