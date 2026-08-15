import { contextBridge, ipcRenderer } from 'electron'

// A página só enxerga estas sete operações, uma para cada uso que o exemplo fazia
// do módulo remote. As consultas que antes eram síncronas devolvem promessa.
contextBridge.exposeInMainWorld('janelaApi', {
  close: (): Promise<void> => ipcRenderer.invoke('janela:fechar'),
  minimizar: (): Promise<void> => ipcRenderer.invoke('janela:minimizar'),
  maximizar: (): Promise<void> => ipcRenderer.invoke('janela:maximizar'),
  restaurar: (): Promise<void> => ipcRenderer.invoke('janela:restaurar'),
  definirTelaCheia: (flag: boolean): Promise<void> =>
    ipcRenderer.invoke('janela:definir-tela-cheia', flag),
  estaEmTelaCheia: (): Promise<boolean> => ipcRenderer.invoke('janela:esta-em-tela-cheia'),
  estaMaximizada: (): Promise<boolean> => ipcRenderer.invoke('janela:esta-maximizada'),
})
