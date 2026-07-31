import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

// O original chamava remote.BrowserWindow.getFocusedWindow() de dentro da página.
// Sem o módulo remote, cada operação vira um canal: a janela é descoberta a partir
// do webContents que originou a chamada, o que dá o mesmo alvo do código antigo.
function windowOf(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

ipcMain.handle('window:close', (event) => {
  windowOf(event)?.close()
})

ipcMain.handle('window:minimize', (event) => {
  windowOf(event)?.minimize()
})

ipcMain.handle('window:maximize', (event) => {
  windowOf(event)?.maximize()
})

ipcMain.handle('window:unmaximize', (event) => {
  windowOf(event)?.unmaximize()
})

ipcMain.handle('window:set-full-screen', (event, flag: boolean) => {
  windowOf(event)?.setFullScreen(flag)
})

ipcMain.handle('window:is-full-screen', (event) => {
  return windowOf(event)?.isFullScreen() ?? false
})

ipcMain.handle('window:is-maximized', (event) => {
  return windowOf(event)?.isMaximized() ?? false
})

function createWindow() {
  mainWindow = new BrowserWindow({
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
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
