import { contextBridge, ipcRenderer } from 'electron'
import type { MensagemRecebida } from './main'

// Um preload só, usado pelas DUAS janelas. Não há nada específico de uma ou de
// outra aqui: a ponte é a mesma, e quem define o papel é o endereço da página.
contextBridge.exposeInMainWorld('apiJanelas', {
  // Sentido janela -> processo principal. Usa `send`, e não `invoke`, porque
  // não há resposta a esperar: a mensagem é entregue a outra janela, não a esta.
  enviar: (texto: string): void => {
    ipcRenderer.send('janelas:enviar', texto)
  },

  // Sentido processo principal -> janela. O ouvinte recebe o que o main
  // reenviou. Repare que o `evento` do ipcRenderer não é repassado à página:
  // ele traz o `sender`, que a página não tem o que fazer com.
  aoReceber: (ouvinte: (mensagem: MensagemRecebida) => void): void => {
    ipcRenderer.on('janelas:receber', (_evento, mensagem: MensagemRecebida) => {
      ouvinte(mensagem)
    })
  },
})
