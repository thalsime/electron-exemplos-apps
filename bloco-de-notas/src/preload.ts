import { contextBridge, ipcRenderer } from 'electron'
import type { Nota, NotaNova } from './main'

export type ComandoDoMenu = 'nova' | 'salvar' | 'exportar' | 'pdf'

// Repare no que NÃO está aqui: nada de menu de contexto. Ele é montado inteiro
// no processo principal, a partir do evento nativo - justamente para não
// competir com o corretor ortográfico. Ver o README.
contextBridge.exposeInMainWorld('apiNotas', {
  listar: (): Promise<Nota[]> => ipcRenderer.invoke('notas:listar'),
  criar: (nota: NotaNova): Promise<number> => ipcRenderer.invoke('notas:criar', nota),
  atualizar: (nota: Nota): Promise<void> => ipcRenderer.invoke('notas:atualizar', nota),
  remover: (id: number): Promise<void> => ipcRenderer.invoke('notas:remover', id),

  exportar: (nota: Nota): Promise<string | null> => ipcRenderer.invoke('notas:exportar', nota),
  salvarPDF: (): Promise<string | null> => ipcRenderer.invoke('notas:salvar-pdf'),

  aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void): void => {
    ipcRenderer.on('notas:comando', (_evento, comando: ComandoDoMenu) => {
      ouvinte(comando)
    })
  },
})
