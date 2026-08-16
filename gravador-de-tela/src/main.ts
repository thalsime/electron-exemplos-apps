import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  desktopCapturer,
  dialog,
  ipcMain,
  powerSaveBlocker,
  session,
} from 'electron'
import fs from 'node:fs/promises'
import path from 'path'

export interface FonteDeCaptura {
  id: string
  nome: string
  miniatura: string
}

export interface ArquivoGravado {
  caminho: string
  bytes: number
}

let janelaPrincipal: BrowserWindow | null = null
let iconeDaBandeja: Tray | null = null

let fontesConhecidas: Electron.DesktopCapturerSource[] = []
let fonteEscolhida: Electron.DesktopCapturerSource | null = null

// O identificador pode ser zero, então a comparação é com null.
let idDoBloqueio: number | null = null
let gravando = false

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 960,
    height: 760,
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

function atualizarMenuDaBandeja(): void {
  iconeDaBandeja?.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: gravando ? 'Parar a gravação' : 'Iniciar a gravação',
        // A bandeja não grava por conta própria: quem tem o MediaRecorder é o
        // renderizador. Ela pede, e a página executa.
        click: () => janelaPrincipal?.webContents.send('gravador:alternar'),
      },
      {
        label: 'Mostrar a janela',
        click: () => janelaPrincipal?.show(),
      },
      { type: 'separator' },
      { label: 'Encerrar', role: 'quit' },
    ]),
  )

  iconeDaBandeja?.setToolTip(gravando ? 'Gravando...' : 'Gravador de tela')
}

// O contador no ícone é o único indicador de que a gravação está rolando quando
// a janela está escondida - que é o caso normal ao gravar a tela inteira.
function marcarGravacao(ativa: boolean): void {
  gravando = ativa

  app.setBadgeCount(ativa ? 1 : 0)
  app.dock?.setBadge(ativa ? 'REC' : '')

  if (ativa && idDoBloqueio === null) {
    idDoBloqueio = powerSaveBlocker.start('prevent-display-sleep')
    console.log(`Bloqueio de suspensão ligado, id ${idDoBloqueio}`)
  }

  if (!ativa && idDoBloqueio !== null) {
    powerSaveBlocker.stop(idDoBloqueio)
    console.log(`Bloqueio de suspensão desligado, id ${idDoBloqueio}`)
    idDoBloqueio = null
  }

  atualizarMenuDaBandeja()
}

ipcMain.handle('gravador:listar-fontes', async (): Promise<FonteDeCaptura[]> => {
  fontesConhecidas = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 320, height: 180 },
  })

  return fontesConhecidas.map((fonte) => ({
    id: fonte.id,
    nome: fonte.name,
    miniatura: fonte.thumbnail.toDataURL(),
  }))
})

ipcMain.handle('gravador:escolher-fonte', (_evento, id: string): boolean => {
  fonteEscolhida = fontesConhecidas.find((fonte) => fonte.id === id) ?? null
  return fonteEscolhida !== null
})

ipcMain.on('gravador:marcar', (_evento, ativa: boolean): void => {
  marcarGravacao(ativa)
})

// O vídeo atravessa o IPC UMA vez, no fim - e não pedaço a pedaço. Mandar cada
// fatia pelo canal custaria uma cópia por fatia, várias vezes por segundo. O
// `MediaRecorder` junta tudo no renderizador, e só o resultado viaja.
ipcMain.handle(
  'gravador:salvar',
  async (_evento, dados: ArrayBuffer): Promise<ArquivoGravado | null> => {
    const sugestao = path.join(app.getPath('videos'), `gravacao-${Date.now()}.webm`)

    const escolha = await dialog.showSaveDialog({
      title: 'Salvar a gravação',
      defaultPath: sugestao,
      filters: [{ name: 'Vídeo WebM', extensions: ['webm'] }],
    })

    if (escolha.canceled || !escolha.filePath) {
      return null
    }

    const conteudo = Buffer.from(dados)
    await fs.writeFile(escolha.filePath, conteudo)
    console.log(`Gravação salva em ${escolha.filePath} (${conteudo.length} bytes)`)

    return { caminho: escolha.filePath, bytes: conteudo.length }
  },
)

app.whenReady().then(() => {
  // Substitui o antigo `chromeMediaSource`: a página chama o `getDisplayMedia`
  // padrão, e o Electron decide aqui qual fonte entregar.
  session.defaultSession.setDisplayMediaRequestHandler((_pedido, responder) => {
    if (fonteEscolhida) {
      responder({ video: fonteEscolhida })
    } else {
      responder({})
    }
  })

  iconeDaBandeja = new Tray(path.join(__dirname, '..', 'icone-bandeja.png'))
  criarJanela()
  atualizarMenuDaBandeja()
})

// Como o `painel-flutuante`, este exemplo NÃO registra `window-all-closed`: com
// a bandeja no ar, fechar a janela não deve encerrar uma gravação em curso.
