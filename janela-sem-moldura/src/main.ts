import { app, BrowserWindow, ipcMain } from 'electron'
// `IpcMainInvokeEvent` só aparece como anotação, nunca como valor. Separá-lo num
// `import type` deixa isso explícito: esta linha desaparece por inteiro na compilação.
import type { IpcMainInvokeEvent } from 'electron'
import path from 'path'

let janelaPrincipal: BrowserWindow | null = null

// O original chamava remote.BrowserWindow.getFocusedWindow() de dentro da página.
// Sem o módulo remote, cada operação vira um canal: a janela é descoberta a partir
// do webContents que originou a chamada, o que dá o mesmo alvo do código antigo.
function janelaDoEvento(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

ipcMain.handle('janela:fechar', (event): void => {
  janelaDoEvento(event)?.close()
})

ipcMain.handle('janela:minimizar', (event): void => {
  janelaDoEvento(event)?.minimize()
})

ipcMain.handle('janela:maximizar', (event): void => {
  janelaDoEvento(event)?.maximize()
})

ipcMain.handle('janela:restaurar', (event): void => {
  janelaDoEvento(event)?.unmaximize()
})

ipcMain.handle('janela:definir-tela-cheia', (event, flag: boolean): void => {
  janelaDoEvento(event)?.setFullScreen(flag)
})

ipcMain.handle('janela:esta-em-tela-cheia', (event): boolean => {
  return janelaDoEvento(event)?.isFullScreen() ?? false
})

ipcMain.handle('janela:esta-maximizada', (event): boolean => {
  return janelaDoEvento(event)?.isMaximized() ?? false
})

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 360,
    height: 300,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Em desenvolvimento a página vem do servidor do Vite; empacotado, do build.
  if (process.env.VITE_DEV_SERVER_URL) {
    janelaPrincipal.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    janelaPrincipal.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

app.whenReady().then(criarJanela)

app.on('window-all-closed', () => {
  app.quit()
})
