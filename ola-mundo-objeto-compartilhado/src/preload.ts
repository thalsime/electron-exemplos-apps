import { contextBridge, ipcRenderer } from 'electron'

// O preload é a única parte que enxerga os dois lados. Ele não entrega o
// ipcRenderer inteiro à página: expõe apenas a função de leitura que este
// exemplo precisa, que é o ponto da troca do antigo módulo remote por IPC.
contextBridge.exposeInMainWorld('apiObjetoCompartilhado', {
  obterMinhaVariavel: (): Promise<string> =>
    ipcRenderer.invoke('objeto-compartilhado:obter-minha-variavel'),
})
