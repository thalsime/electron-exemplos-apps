import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'

let janelaPrincipal: BrowserWindow | null = null

// O original chamava remote.BrowserWindow.getFocusedWindow() de dentro da página.
// Sem o módulo remote, cada operação vira um canal: a janela é descoberta a partir
// do webContents que originou a chamada, o que dá o mesmo alvo do código antigo.
function janelaDoEvento(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

ipcMain.handle('janela:fechar', (event) => {
  janelaDoEvento(event)?.close()
})

ipcMain.handle('janela:minimizar', (event) => {
  janelaDoEvento(event)?.minimize()
})

ipcMain.handle('janela:maximizar', (event) => {
  janelaDoEvento(event)?.maximize()
})

ipcMain.handle('janela:restaurar', (event) => {
  janelaDoEvento(event)?.unmaximize()
})

ipcMain.handle('janela:definir-tela-cheia', (event, flag: boolean) => {
  janelaDoEvento(event)?.setFullScreen(flag)
})

ipcMain.handle('janela:esta-em-tela-cheia', (event) => {
  return janelaDoEvento(event)?.isFullScreen() ?? false
})

ipcMain.handle('janela:esta-maximizada', (event) => {
  return janelaDoEvento(event)?.isMaximized() ?? false
})

function criarJanela() {
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
