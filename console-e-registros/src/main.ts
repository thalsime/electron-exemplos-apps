import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let janelaPrincipal: BrowserWindow | null = null

// Emite os cinco níveis de uma vez. A mesma função existe, com o mesmo texto,
// no preload e no renderizador - é a comparação lado a lado que dá o assunto
// deste exemplo: mensagem idêntica, destino diferente.
function emitirOsCincoNiveis(origem: string): void {
  console.log(`[${origem}] console.log - a mensagem comum do dia a dia`)
  console.info(`[${origem}] console.info - informação, tratada como log na maioria dos destinos`)
  console.warn(`[${origem}] console.warn - aviso, costuma sair em amarelo`)
  console.error(`[${origem}] console.error - erro, costuma sair em vermelho e vai para o stderr`)
  console.debug(`[${origem}] console.debug - o mais discreto: some se o destino filtra por nível`)
}

// Este bloco roda ANTES de qualquer janela existir, e é a primeira prova do
// exemplo: no terminal ele aparece sozinho, sem nenhum DevTools aberto.
console.log('[main] processo principal iniciando - esta linha nasce antes da janela')

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 940,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    janelaPrincipal.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    janelaPrincipal.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

// O renderizador não consegue escrever no terminal por conta própria: ele pede
// ao processo principal, que é quem tem stdout e stderr de verdade.
ipcMain.handle('registros:emitir-no-main', () => {
  emitirOsCincoNiveis('main')
})

// `webContents.openDevTools` é o caminho oficial para abrir as ferramentas sem
// depender de atalho de teclado, que muda de sistema para sistema.
ipcMain.handle('registros:abrir-devtools', (evento) => {
  evento.sender.openDevTools()
})

app.whenReady().then(() => {
  console.log('[main] app.whenReady - a partir daqui já dá para criar janela')
  criarJanela()
})

app.on('window-all-closed', () => {
  console.log('[main] última janela fechada - encerrando')
  app.quit()
})
