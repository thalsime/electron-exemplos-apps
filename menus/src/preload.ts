import { contextBridge, ipcRenderer } from 'electron'

// O preload expõe apenas o pedido de menu. Menu e MenuItem continuam existindo
// só no processo principal: a página descreve o que quer, não constrói o menu.
contextBridge.exposeInMainWorld('apiMenus', {
  abrirContexto: (tipo: 'itens' | 'frutas' | 'cores'): Promise<string | null> =>
    ipcRenderer.invoke('menus:abrir-contexto', tipo),
})
