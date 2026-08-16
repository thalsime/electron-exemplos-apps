import { contextBridge, ipcRenderer } from 'electron'
import type { RelatorioDeFalha, ResumoDeCookie } from './main'

export interface AvisoDeOutraJanela {
  texto: string
  daPropria: boolean
}

contextBridge.exposeInMainWorld('apiNavegador', {
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
})
