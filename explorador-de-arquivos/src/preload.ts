import { contextBridge, ipcRenderer } from 'electron';
import type { ConteudoDePasta } from './main';
import type { ArquivosApi } from './ponte';

// Todo o acesso ao disco fica do lado do processo principal. O renderizador
// pede pelo caminho e recebe a lista pronta - é a troca do antigo `remote`,
// que dava à página o `fs` inteiro.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const arquivosApi: ArquivosApi = {
  listar: (diretorio: string): Promise<ConteudoDePasta> =>
    ipcRenderer.invoke('arquivos:listar', diretorio),
  ehPasta: (caminho: string): Promise<boolean> =>
    ipcRenderer.invoke('arquivos:e-pasta', caminho),
  abrir: (caminho: string): Promise<string> => ipcRenderer.invoke('arquivos:abrir', caminho),
  inicio: (): Promise<string> => ipcRenderer.invoke('arquivos:inicio'),
  sobre: (): Promise<void> => ipcRenderer.invoke('arquivos:sobre'),
};

contextBridge.exposeInMainWorld('arquivosApi', arquivosApi);
