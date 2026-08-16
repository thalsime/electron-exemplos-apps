import { contextBridge, ipcRenderer } from 'electron'
import type { AvisoDeOutraJanela, RelatorioDeFalha, ResumoDeCookie } from './main'
import type { ApiNavegador } from './ponte'

// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiNavegador: ApiNavegador = {
  listarCookies: (): Promise<ResumoDeCookie[]> => ipcRenderer.invoke('navegador:listar-cookies'),

  limparCookies: (): Promise<void> => ipcRenderer.invoke('navegador:limpar-cookies'),

  listarRelatorios: (): Promise<RelatorioDeFalha[]> =>
    ipcRenderer.invoke('navegador:listar-relatorios'),

  abrirEmNovaJanela: (endereco: string): void => {
    ipcRenderer.send('navegador:abrir-em-nova-janela', endereco)
  },

  aoReceberAviso: (ouvinte: (aviso: AvisoDeOutraJanela) => void): void => {
    ipcRenderer.on('navegador:aviso', (_evento, aviso: AvisoDeOutraJanela) => {
      ouvinte(aviso)
    })
  },
}

contextBridge.exposeInMainWorld('apiNavegador', apiNavegador)
