import { contextBridge, ipcRenderer } from 'electron';
import type { FonteDeCaptura } from './main';
import type { CapturaApi } from './ponte';

// O desktopCapturer só existe no processo principal. A página recebe a lista
// com as miniaturas já convertidas em data URL e informa qual fonte escolheu.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const capturaApi: CapturaApi = {
  listarFontes: (): Promise<FonteDeCaptura[]> => ipcRenderer.invoke('captura:listar-fontes'),
  escolherFonte: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('captura:escolher-fonte', id),
};

contextBridge.exposeInMainWorld('capturaApi', capturaApi);
