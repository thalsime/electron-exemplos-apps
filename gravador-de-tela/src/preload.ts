import { contextBridge, ipcRenderer } from 'electron'
import type { ArquivoGravado, FonteDeCaptura } from './main'

contextBridge.exposeInMainWorld('apiGravador', {
  listarFontes: (): Promise<FonteDeCaptura[]> => ipcRenderer.invoke('gravador:listar-fontes'),

  escolherFonte: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('gravador:escolher-fonte', id),

  marcarGravacao: (ativa: boolean): void => {
    ipcRenderer.send('gravador:marcar', ativa)
  },

  salvar: (dados: ArrayBuffer): Promise<ArquivoGravado | null> =>
    ipcRenderer.invoke('gravador:salvar', dados),

  // A bandeja não grava: ela pede à página, que é quem tem o MediaRecorder.
  aoPedirAlternancia: (ouvinte: () => void): void => {
    ipcRenderer.on('gravador:alternar', () => ouvinte())
  },
})
