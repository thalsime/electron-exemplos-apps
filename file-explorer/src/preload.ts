import { contextBridge, ipcRenderer } from 'electron'
import type { EntradaDePasta } from './main'

export interface ConteudoDePasta {
  caminho: string
  entradas: EntradaDePasta[]
}

// Todo o acesso ao disco fica do lado do processo principal. O renderizador
// pede pelo caminho e recebe a lista pronta - é a troca do antigo `remote`,
// que dava à página o `fs` inteiro.
contextBridge.exposeInMainWorld('arquivosApi', {
  listar: (diretorio: string): Promise<ConteudoDePasta> =>
    ipcRenderer.invoke('arquivos:listar', diretorio),
  ehPasta: (caminho: string): Promise<boolean> =>
    ipcRenderer.invoke('arquivos:e-pasta', caminho),
  abrir: (caminho: string): Promise<string> => ipcRenderer.invoke('arquivos:abrir', caminho),
  inicio: (): Promise<string> => ipcRenderer.invoke('arquivos:inicio'),
  sobre: (): Promise<void> => ipcRenderer.invoke('arquivos:sobre'),
})
