import { contextBridge, ipcRenderer } from 'electron';
import type { TipoDeMenu } from './main';
import type { ApiMenus } from './ponte';

// O preload expõe apenas o pedido de menu. Menu e MenuItem continuam existindo
// só no processo principal: a página descreve o que quer, não constrói o menu.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiMenus: ApiMenus = {
  abrirContexto: (tipo: TipoDeMenu): Promise<string | null> =>
    ipcRenderer.invoke('menus:abrir-contexto', tipo),
};

contextBridge.exposeInMainWorld('apiMenus', apiMenus);
