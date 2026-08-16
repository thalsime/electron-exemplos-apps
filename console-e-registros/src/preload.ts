import { contextBridge, ipcRenderer } from 'electron'

// O preload roda no processo do RENDERIZADOR, não no principal. É a confusão
// mais comum sobre ele: por rodar antes da página e ter acesso ao Node, parece
// que pertence ao main - mas o console dele sai junto com o da página.
function emitirOsCincoNiveis(origem: string): void {
  console.log(`[${origem}] console.log - a mensagem comum do dia a dia`)
  console.info(`[${origem}] console.info - informação, tratada como log na maioria dos destinos`)
  console.warn(`[${origem}] console.warn - aviso, costuma sair em amarelo`)
  console.error(`[${origem}] console.error - erro, costuma sair em vermelho e vai para o stderr`)
  console.debug(`[${origem}] console.debug - o mais discreto: some se o destino filtra por nível`)
}

// Esta linha é emitida no carregamento, sem ninguém pedir. Ela prova que o
// preload roda ANTES do renderer.ts - repare na ordem em que as duas aparecem.
console.log('[preload] preload carregado - roda antes do código da página')

contextBridge.exposeInMainWorld('apiRegistros', {
  // Vai até o processo principal e emite de lá.
  emitirNoMain: (): Promise<void> => ipcRenderer.invoke('registros:emitir-no-main'),

  // Emite daqui mesmo, do preload, sem sair do processo do renderizador.
  emitirNoPreload: (): void => emitirOsCincoNiveis('preload'),

  abrirDevTools: (): Promise<void> => ipcRenderer.invoke('registros:abrir-devtools'),
})
