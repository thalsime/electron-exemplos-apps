import { contextBridge, ipcRenderer } from 'electron';
import type { ArquivoGravado, FonteDeCaptura } from './main';
import type { ApiGravador } from './ponte';

// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiGravador: ApiGravador = {
  listarFontes: (): Promise<FonteDeCaptura[]> => ipcRenderer.invoke('gravador:listar-fontes'),

  escolherFonte: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('gravador:escolher-fonte', id),

  marcarGravacao: (ativa: boolean): void => {
    ipcRenderer.send('gravador:marcar', ativa);
  },

  salvar: (dados: ArrayBuffer): Promise<ArquivoGravado | null> =>
    ipcRenderer.invoke('gravador:salvar', dados),

  // A bandeja não grava: ela pede à página, que é quem tem o MediaRecorder.
  aoPedirAlternancia: (ouvinte: () => void): void => {
    ipcRenderer.on('gravador:alternar', () => ouvinte());
  },
};

contextBridge.exposeInMainWorld('apiGravador', apiGravador);
