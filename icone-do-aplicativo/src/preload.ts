import { contextBridge, ipcRenderer } from 'electron';
import type { RecursosDaPlataforma } from './main';
import type { ApiIcone } from './ponte';

// Nenhuma API de ícone existe no renderizador: `app`, `nativeImage` e os
// métodos de janela vivem só no processo principal. A página pede, o principal
// executa - e é por isso que este exemplo precisa de ponte.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiIcone: ApiIcone = {
  recursos: (): Promise<RecursosDaPlataforma> => ipcRenderer.invoke('icone:recursos'),

  definirContador: (quantidade: number): Promise<void> =>
    ipcRenderer.invoke('icone:definir-contador', quantidade),

  limparContador: (): Promise<void> => ipcRenderer.invoke('icone:limpar-contador'),

  trocarIcone: (nome: string): Promise<void> => ipcRenderer.invoke('icone:trocar-icone', nome),
};

contextBridge.exposeInMainWorld('apiIcone', apiIcone);
