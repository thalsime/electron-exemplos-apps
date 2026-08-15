import { app, BrowserWindow, desktopCapturer, ipcMain, session } from 'electron'
import type { DesktopCapturerSource } from 'electron'
import path from 'path'

export interface FonteDeCaptura {
  id: string
  name: string
  /** Miniatura já em data URL, pronta para o atributo src de uma <img>. */
  thumbnail: string
}

let janelaPrincipal: BrowserWindow | null = null

// As fontes ficam guardadas aqui entre a listagem e a escolha. O handler de
// getDisplayMedia precisa devolver o objeto original do desktopCapturer, e não
// apenas o id - por isso o renderizador informa qual escolheu e o main recupera
// o objeto correspondente.
let fontesConhecidas: DesktopCapturerSource[] = []
let fonteEscolhida: DesktopCapturerSource | null = null

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 700,
    height: 640,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
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

// `desktopCapturer.getSources` saiu do renderizador e hoje só existe no processo
// principal - no exemplo original ele era chamado direto da página.
ipcMain.handle('captura:listar-fontes', async (): Promise<FonteDeCaptura[]> => {
  fontesConhecidas = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 320, height: 180 },
  })

  return fontesConhecidas.map((fonte) => ({
    id: fonte.id,
    name: fonte.name,
    thumbnail: fonte.thumbnail.toDataURL(),
  }))
})

ipcMain.handle('captura:escolher-fonte', (_evento, id: string): boolean => {
  fonteEscolhida = fontesConhecidas.find((fonte) => fonte.id === id) ?? null
  return fonteEscolhida !== null
})

app.whenReady().then(() => {
  // Esta é a peça que substitui o antigo `chromeMediaSource: 'desktop'`.
  //
  // O renderizador chama `navigator.mediaDevices.getDisplayMedia()`, que é API
  // WEB PADRÃO - a mesma de qualquer navegador. O Electron intercepta o pedido
  // aqui e decide qual fonte entregar. Antes disso, a página precisava montar
  // um objeto `mandatory` não padronizado, com o id da fonte embutido, através
  // de `webkitGetUserMedia` - função que hoje nem existe mais.
  session.defaultSession.setDisplayMediaRequestHandler((_pedido, responder) => {
    if (fonteEscolhida) {
      responder({ video: fonteEscolhida })
    } else {
      // Sem escolha registrada não há o que entregar. Responder com objeto
      // vazio faz o getDisplayMedia rejeitar no renderizador, que trata o erro.
      responder({})
    }
  })

  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
