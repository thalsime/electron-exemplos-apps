import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import path from 'path'

// O que cada plataforma sabe fazer. A página monta a interface a partir disto,
// em vez de esconder o que não funciona: o aluno vê o que existe e por que não
// está disponível aqui.
export interface RecursosDaPlataforma {
  plataforma: NodeJS.Platform
  temDock: boolean
  temContadorNoDock: boolean
  temSobreposicaoNaBarra: boolean
}

let janelaPrincipal: BrowserWindow | null = null

// Os ícones estão em `public/`, que o Vite copia para `dist/` no build. O
// processo principal precisa do caminho no DISCO, e não de uma URL, então o
// lugar do arquivo muda entre desenvolvimento e produção - é a mesma condição
// que decide como a página é carregada.
function caminhoDoIcone(nome: string): string {
  const pasta = process.env.VITE_DEV_SERVER_URL ? '../public' : '../dist'
  return path.join(__dirname, pasta, nome)
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 860,
    height: 700,
    // No Windows e no Linux este é o ícone da janela e da barra de tarefas. No
    // macOS ele é ignorado: lá o ícone vem do pacote do aplicativo, e durante o
    // desenvolvimento quem manda é o Electron.app - por isso o Dock aparece com
    // o átomo até o `app.dock.setIcon` abaixo entrar em ação.
    icon: caminhoDoIcone('icone.png'),
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

ipcMain.handle('icone:recursos', (): RecursosDaPlataforma => {
  return {
    plataforma: process.platform,
    // `app.dock` é tipado como `Dock | undefined`, e não por capricho: fora do
    // macOS ele não existe. O TypeScript estrito obriga a tratar isso, o que
    // transforma a diferença de plataforma em código visível.
    temDock: app.dock !== undefined,
    temContadorNoDock: process.platform === 'darwin' || process.platform === 'linux',
    temSobreposicaoNaBarra: process.platform === 'win32',
  }
})

ipcMain.handle('icone:definir-contador', (_evento, quantidade: number) => {
  // Caminho portátil: funciona no macOS e no Linux, e é ignorado no Windows.
  app.setBadgeCount(quantidade)

  // Caminho específico do macOS, que aceita texto livre no lugar do número.
  app.dock?.setBadge(String(quantidade))

  // No Windows o equivalente é uma imagem sobreposta ao ícone da barra de
  // tarefas. Sem uma imagem pronta por número, o exemplo apenas mostra a
  // chamada e reaproveita o ícone de alerta.
  if (process.platform === 'win32' && janelaPrincipal) {
    const sobreposicao = nativeImage.createFromPath(caminhoDoIcone('alerta.png'))
    janelaPrincipal.setOverlayIcon(sobreposicao, `${quantidade} pendências`)
  }
})

ipcMain.handle('icone:limpar-contador', () => {
  app.setBadgeCount(0)
  app.dock?.setBadge('')

  // `null` é o valor que remove a sobreposição - não existe um "removeOverlay".
  if (process.platform === 'win32' && janelaPrincipal) {
    janelaPrincipal.setOverlayIcon(null, '')
  }
})

ipcMain.handle('icone:trocar-icone', (_evento, nome: string) => {
  // `setIcon` aceita caminho ou NativeImage. Aqui vai a imagem, para deixar
  // claro que ela pode vir de qualquer lugar - inclusive desenhada em runtime.
  const imagem = nativeImage.createFromPath(caminhoDoIcone(nome))
  app.dock?.setIcon(imagem)

  // Fora do macOS, o que muda é o ícone da janela.
  janelaPrincipal?.setIcon(imagem)
})

app.whenReady().then(() => {
  // No macOS, esta é a linha que troca o ícone do Dock durante o
  // desenvolvimento. Sem ela, o Dock mostra o ícone do próprio Electron.
  app.dock?.setIcon(nativeImage.createFromPath(caminhoDoIcone('icone.png')))
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
