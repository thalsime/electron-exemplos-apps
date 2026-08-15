import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem } from 'electron'
import fs from 'node:fs/promises'
import path from 'path'

export type AcaoDeEdicao = 'copiar' | 'recortar' | 'colar'

const janelas = new Set<BrowserWindow>()

function criarJanela(): BrowserWindow {
  const janela = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    janela.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    janela.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  janelas.add(janela)
  janela.on('closed', () => janelas.delete(janela))
  return janela
}

function janelaDoEvento(evento: Electron.IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(evento.sender)
}

// showOpenDialog e showSaveDialog passaram de callback para Promise, e o retorno
// virou um objeto com `canceled` e o caminho - no lugar do caminho solto que o
// exemplo original recebia.
ipcMain.handle('editor:abrir', async (evento): Promise<{ caminho: string; conteudo: string } | null> => {
  const janela = janelaDoEvento(evento)
  const escolha = janela
    ? await dialog.showOpenDialog(janela, { properties: ['openFile'] })
    : await dialog.showOpenDialog({ properties: ['openFile'] })

  const caminho = escolha.filePaths[0]
  if (escolha.canceled || !caminho) return null

  return { caminho, conteudo: await fs.readFile(caminho, 'utf8') }
})

ipcMain.handle('editor:salvar-como', async (evento, conteudo: string): Promise<string | null> => {
  const janela = janelaDoEvento(evento)
  const escolha = janela
    ? await dialog.showSaveDialog(janela, {})
    : await dialog.showSaveDialog({})

  if (escolha.canceled || !escolha.filePath) return null

  await fs.writeFile(escolha.filePath, conteudo, 'utf8')
  return escolha.filePath
})

ipcMain.handle('editor:salvar', async (_evento, caminho: string, conteudo: string): Promise<void> => {
  await fs.writeFile(caminho, conteudo, 'utf8')
})

ipcMain.handle('editor:nova-janela', () => {
  criarJanela()
})

// Menu e MenuItem só existem no processo principal. A página informa se há texto
// selecionado, recebe de volta a ação escolhida e a executa sobre o editor - que
// é onde o CodeMirror vive.
ipcMain.handle('editor:menu-de-contexto', (evento, temSelecao: boolean): Promise<AcaoDeEdicao | null> => {
  return new Promise((resolver) => {
    const janela = janelaDoEvento(evento)
    if (!janela) {
      resolver(null)
      return
    }

    let escolha: AcaoDeEdicao | null = null
    const menu = new Menu()

    menu.append(new MenuItem({
      label: 'Copiar',
      enabled: temSelecao,
      click: () => { escolha = 'copiar' },
    }))
    menu.append(new MenuItem({
      label: 'Recortar',
      enabled: temSelecao,
      click: () => { escolha = 'recortar' },
    }))
    menu.append(new MenuItem({
      label: 'Colar',
      click: () => { escolha = 'colar' },
    }))

    menu.popup({ window: janela, callback: () => resolver(escolha) })
  })
})

export type ComandoDoMenu = 'novo' | 'abrir' | 'salvar' | 'salvar-como'

// O exemplo original não tinha menu de aplicação: as três ações viviam só nos
// botões, e "salvar como" não existia como opção - ficava escondida dentro do
// Save, que abria o diálogo apenas quando ainda não havia arquivo.
//
// O menu envia o comando ao renderizador, e não executa nada por conta própria:
// quem sabe o conteúdo do editor e se há arquivo associado é a página.
function criarMenuDaAplicacao(): void {
  const arquivo: Electron.MenuItemConstructorOptions = {
    label: 'Arquivo',
    submenu: [
      { label: 'Novo', accelerator: 'CmdOrCtrl+N', click: () => criarJanela() },
      { type: 'separator' },
      { label: 'Abrir...', accelerator: 'CmdOrCtrl+O', click: () => enviarComando('abrir') },
      { label: 'Salvar', accelerator: 'CmdOrCtrl+S', click: () => enviarComando('salvar') },
      {
        label: 'Salvar como...',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => enviarComando('salvar-como'),
      },
      { type: 'separator' },
      { role: process.platform === 'darwin' ? 'close' : 'quit' },
    ],
  }

  const modelo: Electron.MenuItemConstructorOptions[] = [arquivo, { role: 'editMenu' }]

  if (process.platform === 'darwin') {
    modelo.unshift({ role: 'appMenu' })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(modelo))
}

function enviarComando(comando: ComandoDoMenu): void {
  BrowserWindow.getFocusedWindow()?.webContents.send('editor:comando', comando)
}

app.whenReady().then(() => {
  criarMenuDaAplicacao()
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
