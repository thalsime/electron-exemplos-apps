import { app, BrowserWindow, Menu, Tray, ipcMain, powerSaveBlocker } from 'electron'
import path from 'path'

// O estado que as duas janelas precisam enxergar igual. Ele vive aqui, no
// processo principal, e não em nenhuma das duas: o painel manda mudar, a janela
// de conteúdo é avisada do resultado.
export interface EstadoDaApresentacao {
  emApresentacao: boolean
  slide: number
  totalDeSlides: number
}

const TOTAL_DE_SLIDES = 5

const estado: EstadoDaApresentacao = {
  emApresentacao: false,
  slide: 1,
  totalDeSlides: TOTAL_DE_SLIDES,
}

let janelaDeConteudo: BrowserWindow | null = null
let painel: BrowserWindow | null = null
let iconeDaBandeja: Tray | null = null

// O identificador devolvido por start() pode ser zero, então a comparação com
// null é obrigatória - um `if (idDoBloqueio)` daria falso no primeiro bloqueio.
let idDoBloqueio: number | null = null

function paginaDaJanela(janela: BrowserWindow, arquivo: string): void {
  if (process.env.VITE_DEV_SERVER_URL) {
    janela.loadURL(`${process.env.VITE_DEV_SERVER_URL}${arquivo}`)
  } else {
    janela.loadFile(path.join(__dirname, '../dist', arquivo))
  }
}

function criarJanelaDeConteudo(): void {
  janelaDeConteudo = new BrowserWindow({
    width: 820,
    height: 560,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  paginaDaJanela(janelaDeConteudo, 'index.html')

  janelaDeConteudo.on('closed', () => {
    janelaDeConteudo = null
  })
}

function criarPainel(): void {
  painel = new BrowserWindow({
    width: 300,
    height: 190,
    x: 60,
    y: 90,
    // Sem moldura: a barra de título é desenhada pela própria página, e o
    // arraste vem do CSS `-webkit-app-region: drag`.
    frame: false,
    // Fica por cima de tudo, que é o ponto de um painel de controle: ele
    // precisa continuar acessível com a apresentação em primeiro plano.
    alwaysOnTop: true,
    resizable: false,
    // Sem entrada na barra de tarefas: é um acessório, não um aplicativo.
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  paginaDaJanela(painel, 'painel.html')

  painel.on('closed', () => {
    painel = null
  })
}

// Um lugar só para avisar quem precisa saber. As duas janelas recebem o mesmo
// estado, e nenhuma delas calcula nada por conta própria - é o que impede as
// duas telas de discordarem.
function anunciarEstado(): void {
  for (const janela of [janelaDeConteudo, painel]) {
    janela?.webContents.send('painel:estado', estado)
  }
  atualizarMenuDaBandeja()
}

function alternarApresentacao(ligar: boolean): void {
  estado.emApresentacao = ligar

  if (ligar && idDoBloqueio === null) {
    // 'prevent-display-sleep' impede a tela de apagar. É mais forte do que
    // 'prevent-app-suspension', que só evita a suspensão do processo - numa
    // apresentação, a tela apagando já estraga tudo.
    idDoBloqueio = powerSaveBlocker.start('prevent-display-sleep')
    console.log(`Bloqueio de suspensão ligado, id ${idDoBloqueio}`)
  }

  if (!ligar && idDoBloqueio !== null) {
    powerSaveBlocker.stop(idDoBloqueio)
    console.log(`Bloqueio de suspensão desligado, id ${idDoBloqueio}`)
    idDoBloqueio = null
  }

  anunciarEstado()
}

// O painel manda a INTENÇÃO ("avance"), e não o número calculado. A diferença
// importa: o IPC é assíncrono, e dois cliques rápidos no painel usariam o mesmo
// estado desatualizado, perdendo um passo. Quem sabe o número certo é quem
// guarda o estado - o processo principal.
function moverSlide(passo: number): void {
  estado.slide = Math.min(Math.max(estado.slide + passo, 1), TOTAL_DE_SLIDES)
  anunciarEstado()
}

function alternarPainel(): void {
  if (!painel) {
    criarPainel()
    return
  }

  if (painel.isVisible()) {
    painel.hide()
  } else {
    painel.show()
  }

  atualizarMenuDaBandeja()
}

function atualizarMenuDaBandeja(): void {
  iconeDaBandeja?.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: painel?.isVisible() ? 'Ocultar o painel' : 'Mostrar o painel',
        click: alternarPainel,
      },
      {
        label: estado.emApresentacao ? 'Sair do modo apresentação' : 'Entrar no modo apresentação',
        click: () => alternarApresentacao(!estado.emApresentacao),
      },
      { type: 'separator' },
      {
        label: 'Reabrir a janela de conteúdo',
        enabled: janelaDeConteudo === null,
        click: criarJanelaDeConteudo,
      },
      { type: 'separator' },
      { label: 'Encerrar', role: 'quit' },
    ]),
  )

  iconeDaBandeja?.setToolTip(
    estado.emApresentacao ? 'Em apresentação - a tela não vai apagar' : 'Painel flutuante',
  )
}

ipcMain.handle('painel:estado-atual', (): EstadoDaApresentacao => estado)

ipcMain.on('painel:alternar-apresentacao', (): void => {
  alternarApresentacao(!estado.emApresentacao)
})

ipcMain.on('painel:mover-slide', (_evento, passo: number): void => {
  moverSlide(passo)
})

// O painel não tem barra de título, então os controles de janela precisam
// existir em código - é o mesmo problema do exemplo `janela-sem-moldura`.
ipcMain.on('painel:ocultar', (): void => {
  painel?.hide()
  atualizarMenuDaBandeja()
})

app.whenReady().then(() => {
  iconeDaBandeja = new Tray(path.join(__dirname, '..', 'icone-bandeja.png'))
  criarJanelaDeConteudo()
  criarPainel()
  atualizarMenuDaBandeja()
})

// ATENÇÃO: este exemplo NÃO registra `window-all-closed`, e isso contraria o
// resto do acervo de propósito. Aqui o aplicativo continua vivo na bandeja
// depois que as janelas fecham, e é de lá que se reabre a janela de conteúdo ou
// se encerra. Registrar o `app.quit()` habitual mataria o aplicativo ao fechar
// a última janela, e a bandeja perderia a razão de existir.
