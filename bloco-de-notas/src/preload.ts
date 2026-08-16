import { contextBridge, ipcRenderer } from 'electron';
import type { ComandoDoMenu, Nota, NotaNova } from './main';
import type { ApiNotas } from './ponte';

// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiNotas: ApiNotas = {
  listar: (): Promise<Nota[]> => ipcRenderer.invoke('notas:listar'),
  criar: (nota: NotaNova): Promise<number> => ipcRenderer.invoke('notas:criar', nota),
  atualizar: (nota: Nota): Promise<void> => ipcRenderer.invoke('notas:atualizar', nota),
  remover: (id: number): Promise<void> => ipcRenderer.invoke('notas:remover', id),

  exportar: (nota: Nota): Promise<string | null> => ipcRenderer.invoke('notas:exportar', nota),
  salvarPDF: (): Promise<string | null> => ipcRenderer.invoke('notas:salvar-pdf'),

  aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void): void => {
    ipcRenderer.on('notas:comando', (_evento, comando: ComandoDoMenu) => {
      ouvinte(comando);
    });
  },
};

contextBridge.exposeInMainWorld('apiNotas', apiNotas);
