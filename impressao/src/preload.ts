import { contextBridge, ipcRenderer } from 'electron';
import type { OpcoesDeImpressao } from './main';
import type { ApiImpressao } from './ponte';

// A janela de pré-visualização, o diálogo de salvamento e a gravação do arquivo
// vivem no processo principal. A página só envia as opções escolhidas no
// formulário e recebe de volta uma mensagem para exibir no log.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiImpressao: ApiImpressao = {
  abrirPrevia: (): Promise<void> => ipcRenderer.invoke('impressao:abrir-previa'),
  imprimir: (): Promise<string> => ipcRenderer.invoke('impressao:imprimir'),
  salvarPDF: (opcoes: OpcoesDeImpressao): Promise<string> =>
    ipcRenderer.invoke('impressao:salvar-pdf', opcoes),
  abrirPDF: (): Promise<string> => ipcRenderer.invoke('impressao:abrir-pdf'),
};

contextBridge.exposeInMainWorld('apiImpressao', apiImpressao);
