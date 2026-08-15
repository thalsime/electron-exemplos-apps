import { contextBridge, ipcRenderer } from 'electron'

export interface RelatorioDeFalha {
  id: string
  data: string
}

// O preload é a única parte que enxerga os dois lados. Ele não entrega o
// ipcRenderer nem o process inteiros à página: expõe apenas as duas operações
// que este exemplo precisa.
contextBridge.exposeInMainWorld('crashReportApi', {
  listarRelatorios: (): Promise<RelatorioDeFalha[]> =>
    ipcRenderer.invoke('crash-report:listar-relatorios'),

  // Provocar a falha precisa acontecer NO renderizador: derrubar o processo
  // principal encerraria o aplicativo inteiro, e o relatório gerado seria de
  // outro processo. O preload tem acesso ao `process` do Node, então a página
  // consegue disparar a falha sem que nodeIntegration seja ligado.
  provocarFalha: (): void => process.crash(),
})
