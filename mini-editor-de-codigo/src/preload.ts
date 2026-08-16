import { clipboard, contextBridge, ipcRenderer } from 'electron';
import type { AcaoDeEdicao, ArquivoAberto, ComandoDoMenu } from './main';
import type { ApiEditor } from './ponte';

// O `clipboard` do Electron não é alcançável pela página com contextIsolation
// ligado, então passa por aqui. As funções de arquivo e de menu vão ao processo
// principal por IPC, no lugar do antigo `remote`.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiEditor: ApiEditor = {
  abrir: (): Promise<ArquivoAberto | null> => ipcRenderer.invoke('editor:abrir'),
  salvar: (caminho: string, conteudo: string): Promise<void> =>
    ipcRenderer.invoke('editor:salvar', caminho, conteudo),
  salvarComo: (conteudo: string): Promise<string | null> =>
    ipcRenderer.invoke('editor:salvar-como', conteudo),
  novaJanela: (): Promise<void> => ipcRenderer.invoke('editor:nova-janela'),
  menuDeContexto: (temSelecao: boolean): Promise<AcaoDeEdicao | null> =>
    ipcRenderer.invoke('editor:menu-de-contexto', temSelecao),

  // O menu de aplicação vive no processo principal e avisa a página por aqui:
  // é ela que sabe o conteúdo do editor e se há arquivo associado.
  aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void): void => {
    ipcRenderer.on('editor:comando', (_evento, comando: ComandoDoMenu) => ouvinte(comando));
  },

  lerAreaDeTransferencia: (): string => clipboard.readText(),
  escreverNaAreaDeTransferencia: (texto: string): void => clipboard.writeText(texto),
};

contextBridge.exposeInMainWorld('apiEditor', apiEditor);
