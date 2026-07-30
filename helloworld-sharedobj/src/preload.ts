import { contextBridge, ipcRenderer } from 'electron'

// O preload é a única parte que enxerga os dois lados. Ele não entrega o
// ipcRenderer inteiro à página: expõe apenas a função de leitura que este
// exemplo precisa, que é o ponto da troca do antigo módulo remote por IPC.
contextBridge.exposeInMainWorld('sharedObjApi', {
  getMyvar: (): Promise<string> => ipcRenderer.invoke('sharedobj:get-myvar'),
})
