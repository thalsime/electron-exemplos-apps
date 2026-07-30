import { app, BrowserWindow } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

// A janela nasce sem nenhuma permissão extra. O original ligava nodeIntegration
// sem que uma linha sequer do renderizador usasse Node - aqui vale o padrão da
// stack da turma: contexto isolado e Node desligado no renderizador.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
