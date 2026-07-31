import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

declare global {
  var sharedObj: { myvar: string }
}

global.sharedObj = { myvar: "hellofrommainjs" }

let mainWindow: BrowserWindow | null = null

// O objeto continua vivendo no processo principal, como no original. O que mudou
// é o caminho até ele: o renderizador não alcança mais o Main por conta própria,
// então o valor é entregue por um canal declarado aqui e exposto pelo preload.
ipcMain.handle('sharedobj:get-myvar', () => {
  return global.sharedObj.myvar
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
}

app.whenReady().then(createWindow)

// O original não registrava este handler, e sem ele o Electron encerra sozinho
// quando a última janela fecha. Declarar o encerramento de forma explícita
// preserva esse comportamento e deixa a intenção visível no código.
app.on('window-all-closed', () => {
  app.quit()
})
