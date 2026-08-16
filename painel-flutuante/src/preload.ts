import { contextBridge, ipcRenderer } from 'electron'
import type { EstadoDaApresentacao } from './main'
import type { ApiPainel } from './ponte'

// Um preload só, compartilhado pelas duas janelas - a de conteúdo e o painel.
// Cada uma usa a parte que lhe interessa: o painel manda comandos, a de
// conteúdo apenas escuta. Separar em dois arquivos duplicaria a ponte sem
// ganho, já que o processo principal é quem controla quem pode o quê.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiPainel: ApiPainel = {
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
}

contextBridge.exposeInMainWorld('apiPainel', apiPainel)
