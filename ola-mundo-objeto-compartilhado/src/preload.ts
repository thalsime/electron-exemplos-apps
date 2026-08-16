import { contextBridge, ipcRenderer } from 'electron';

import type { ApiObjetoCompartilhado } from './ponte';

// O preload é a única parte que enxerga os dois lados. Ele não entrega o
// ipcRenderer inteiro à página: expõe apenas a função de leitura que este
// exemplo precisa, que é o ponto da troca do antigo módulo remote por IPC.
//
// O tipo é aplicado à variável, e não passado direto ao contextBridge, porque
// exposeInMainWorld recebe `api: any` - sem esta linha nada conferiria a ponte.
const apiObjetoCompartilhado: ApiObjetoCompartilhado = {
  obterMinhaVariavel: (): Promise<string> =>
    ipcRenderer.invoke('objeto-compartilhado:obter-minha-variavel'),
};

contextBridge.exposeInMainWorld('apiObjetoCompartilhado', apiObjetoCompartilhado);
