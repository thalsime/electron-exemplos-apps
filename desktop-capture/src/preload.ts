import { contextBridge, ipcRenderer } from 'electron'
import type { FonteDeCaptura } from './main'

// O desktopCapturer só existe no processo principal. A página recebe a lista
// com as miniaturas já convertidas em data URL e informa qual fonte escolheu.
contextBridge.exposeInMainWorld('capturaApi', {
  listarFontes: (): Promise<FonteDeCaptura[]> => ipcRenderer.invoke('captura:listar-fontes'),
  escolherFonte: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('captura:escolher-fonte', id),
})
