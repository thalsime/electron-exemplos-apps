import { contextBridge, ipcRenderer } from 'electron'
import type { ResumoDeCookie } from './main'

// A sessão e a API de cookies vivem só no processo principal. O renderizador
// recebe a lista pronta e pede remoções pelo nome - é a troca do antigo
// `remote.getCurrentWebContents().session` por uma superfície mínima.
contextBridge.exposeInMainWorld('cookiesApi', {
  listar: (): Promise<ResumoDeCookie[]> => ipcRenderer.invoke('cookies:listar'),
  remover: (cookie: ResumoDeCookie): Promise<void> =>
    ipcRenderer.invoke('cookies:remover', cookie),
})
