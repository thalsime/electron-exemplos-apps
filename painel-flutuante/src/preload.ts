import { contextBridge, ipcRenderer } from 'electron'
import type { EstadoDaApresentacao } from './main'

// Um preload só, compartilhado pelas duas janelas - a de conteúdo e o painel.
// Cada uma usa a parte que lhe interessa: o painel manda comandos, a de
// conteúdo apenas escuta. Separar em dois arquivos duplicaria a ponte sem
// ganho, já que o processo principal é quem controla quem pode o quê.
contextBridge.exposeInMainWorld('apiPainel', {
  estadoAtual: (): Promise<EstadoDaApresentacao> => ipcRenderer.invoke('painel:estado-atual'),

  alternarApresentacao: (): void => {
    ipcRenderer.send('painel:alternar-apresentacao')
  },

  moverSlide: (passo: number): void => {
    ipcRenderer.send('painel:mover-slide', passo)
  },

  ocultarPainel: (): void => {
    ipcRenderer.send('painel:ocultar')
  },

  // Chega a cada mudança, para as duas janelas ao mesmo tempo.
  aoMudarEstado: (ouvinte: (estado: EstadoDaApresentacao) => void): void => {
    ipcRenderer.on('painel:estado', (_evento, estado: EstadoDaApresentacao) => {
      ouvinte(estado)
    })
  },
})
