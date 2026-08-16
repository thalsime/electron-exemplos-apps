import { contextBridge, ipcRenderer } from 'electron'
import type { RecursosDaPlataforma } from './main'

// Nenhuma API de ícone existe no renderizador: `app`, `nativeImage` e os
// métodos de janela vivem só no processo principal. A página pede, o principal
// executa - e é por isso que este exemplo precisa de ponte.
contextBridge.exposeInMainWorld('apiIcone', {
  recursos: (): Promise<RecursosDaPlataforma> => ipcRenderer.invoke('icone:recursos'),

  definirContador: (quantidade: number): Promise<void> =>
    ipcRenderer.invoke('icone:definir-contador', quantidade),

  limparContador: (): Promise<void> => ipcRenderer.invoke('icone:limpar-contador'),

  trocarIcone: (nome: string): Promise<void> => ipcRenderer.invoke('icone:trocar-icone', nome),
})
