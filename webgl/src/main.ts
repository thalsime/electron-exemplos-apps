import { app, BrowserWindow } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

// O Chromium bloqueia certas GPUs por causa de defeitos conhecidos. Se o WebGL não
// aparecer, esta opção contorna a lista - ao custo de deixar o Electron menos
// estável. O nome mudou de blacklist para blocklist, e appendSwitch recebe a opção
// sem os hifens iniciais.
app.commandLine.appendSwitch('ignore-gpu-blocklist')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
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
  app.quit()
})
