import { contextBridge, ipcRenderer } from 'electron'
import type { OpcoesDeImpressao } from './main'

// A janela de pré-visualização, o diálogo de salvamento e a gravação do arquivo
// vivem no processo principal. A página só envia as opções escolhidas no
// formulário e recebe de volta uma mensagem para exibir no log.
contextBridge.exposeInMainWorld('printingApi', {
  abrirPrevia: (): Promise<void> => ipcRenderer.invoke('printing:abrir-previa'),
  imprimir: (): Promise<string> => ipcRenderer.invoke('printing:imprimir'),
  salvarPDF: (opcoes: OpcoesDeImpressao): Promise<string> =>
    ipcRenderer.invoke('printing:salvar-pdf', opcoes),
  abrirPDF: (): Promise<string> => ipcRenderer.invoke('printing:abrir-pdf'),
})
