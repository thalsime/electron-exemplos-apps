import { contextBridge, ipcRenderer } from 'electron'
import type { OpcoesDeImpressao } from './main'

// A janela de pré-visualização, o diálogo de salvamento e a gravação do arquivo
// vivem no processo principal. A página só envia as opções escolhidas no
// formulário e recebe de volta uma mensagem para exibir no log.
contextBridge.exposeInMainWorld('apiImpressao', {
  abrirPrevia: (): Promise<void> => ipcRenderer.invoke('impressao:abrir-previa'),
  imprimir: (): Promise<string> => ipcRenderer.invoke('impressao:imprimir'),
  salvarPDF: (opcoes: OpcoesDeImpressao): Promise<string> =>
    ipcRenderer.invoke('impressao:salvar-pdf', opcoes),
  abrirPDF: (): Promise<string> => ipcRenderer.invoke('impressao:abrir-pdf'),
})
