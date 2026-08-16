import { contextBridge, ipcRenderer } from 'electron'
import type { ResumoDeCookie } from './main'
import type { CookiesApi } from './ponte'

// A sessão e a API de cookies vivem só no processo principal. O renderizador
// recebe a lista pronta e pede remoções pelo nome - é a troca do antigo
// `remote.getCurrentWebContents().session` por uma superfície mínima.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const cookiesApi: CookiesApi = {
  listar: (): Promise<ResumoDeCookie[]> => ipcRenderer.invoke('cookies:listar'),
  remover: (cookie: ResumoDeCookie): Promise<void> =>
    ipcRenderer.invoke('cookies:remover', cookie),
}

contextBridge.exposeInMainWorld('cookiesApi', cookiesApi)
