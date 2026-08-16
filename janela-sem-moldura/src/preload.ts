import { contextBridge, ipcRenderer } from 'electron';
import type { JanelaApi } from './ponte';

// A página só enxerga estas sete operações, uma para cada uso que o exemplo fazia
// do módulo remote. As consultas que antes eram síncronas devolvem promessa.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const janelaApi: JanelaApi = {
  close: (): Promise<void> => ipcRenderer.invoke('janela:fechar'),
  minimizar: (): Promise<void> => ipcRenderer.invoke('janela:minimizar'),
  maximizar: (): Promise<void> => ipcRenderer.invoke('janela:maximizar'),
  restaurar: (): Promise<void> => ipcRenderer.invoke('janela:restaurar'),
  definirTelaCheia: (flag: boolean): Promise<void> =>
    ipcRenderer.invoke('janela:definir-tela-cheia', flag),
  estaEmTelaCheia: (): Promise<boolean> => ipcRenderer.invoke('janela:esta-em-tela-cheia'),
  estaMaximizada: (): Promise<boolean> => ipcRenderer.invoke('janela:esta-maximizada'),
};

contextBridge.exposeInMainWorld('janelaApi', janelaApi);
