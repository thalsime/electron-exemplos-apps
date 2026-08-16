import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { LinhaDeRegistro, PedidoDeCodificacao } from './main'

contextBridge.exposeInMainWorld('apiMp3', {
  // O <input type="file"> devolve um objeto File, e o navegador esconde o
  // caminho real por segurança: `input.value` traz "C:\fakepath\arquivo.wav".
  // O exemplo original contornava isso pela propriedade `path` que o Electron
  // acrescentava ao File - removida desde então. `webUtils.getPathForFile` é a
  // substituta oficial, e só existe do lado privilegiado, aqui no preload.
  caminhoDoArquivo: (arquivo: File): string => webUtils.getPathForFile(arquivo),

  codificar: (pedido: PedidoDeCodificacao): Promise<void> =>
    ipcRenderer.invoke('mp3:codificar', pedido),

  // O andamento chega do processo principal ao longo da execução, e não de uma
  // vez no fim: o codificador escreve no stdout enquanto trabalha.
  aoReceberRegistro: (ouvinte: (linha: LinhaDeRegistro) => void): void => {
    ipcRenderer.on('mp3:registro', (_evento, linha: LinhaDeRegistro) => ouvinte(linha))
  },
})
