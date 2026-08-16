import { BrowserWindow, app, crashReporter, ipcMain, session } from 'electron'
import http from 'node:http'
import path from 'path'

export interface ResumoDeCookie {
  dominio: string
  nome: string
  valor: string
}

export interface RelatorioDeFalha {
  id: string
  data: string
}

// O recado que uma janela manda às outras. Esta interface morava no preload, e por isso
// o ponto que MONTA o objeto - o `webContents.send` lá embaixo - não a usava: era um
// literal anônimo que casava por coincidência. Declarada aqui, onde o recado nasce, o
// `satisfies` do envio passa a conferi-lo.
export interface AvisoDeOutraJanela {
  texto: string
  daPropria: boolean
}

const PORTA_COLETOR = 9998
const URL_COLETOR = `http://127.0.0.1:${PORTA_COLETOR}`

// O crashReporter precisa ser iniciado ANTES de qualquer janela, e uma vez só.
// A configuração feita aqui vale para os renderizadores que o processo
// principal criar depois - inclusive o processo da <webview>.
crashReporter.start({
  submitURL: URL_COLETOR,
  uploadToServer: true,
  globalExtra: { _companyName: 'exemplo' },
})

const janelas = new Set<BrowserWindow>()

function criarColetor(): http.Server {
  return http.createServer((_requisicao, resposta) => {
    const identificador = Math.floor(1000 + Math.random() * 9000).toString()
    console.log(`Relatório de falha recebido. ID atribuído: ${identificador}`)
    resposta.end(identificador)
  })
}

function criarJanela(enderecoInicial?: string): BrowserWindow {
  const janela = new BrowserWindow({
    width: 1000,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Sem isto a tag <webview> simplesmente não existe na página.
      webviewTag: true,
    },
  })

  const consulta = enderecoInicial ? `?endereco=${encodeURIComponent(enderecoInicial)}` : ''

  if (process.env.VITE_DEV_SERVER_URL) {
    janela.loadURL(`${process.env.VITE_DEV_SERVER_URL}${consulta}`)
  } else {
    janela.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: enderecoInicial ? { endereco: enderecoInicial } : {},
    })
  }

  janelas.add(janela)

  janela.on('closed', () => {
    janelas.delete(janela)
  })

  return janela
}

// Semeia dois cookies para a lista não abrir vazia, do mesmo jeito que o
// exemplo `cookies` faz. Navegar de verdade acrescenta os outros.
async function semearCookies(): Promise<void> {
  await session.defaultSession.cookies.set({
    url: 'https://exemplo.senac.br',
    name: 'sessao_do_aluno',
    value: 'uc5-2026',
  })

  await session.defaultSession.cookies.set({
    url: 'https://exemplo.senac.br',
    name: 'tema',
    value: 'claro',
  })
}

ipcMain.handle('navegador:listar-cookies', async (): Promise<ResumoDeCookie[]> => {
  const cookies = await session.defaultSession.cookies.get({})

  return cookies.map((cookie) => ({
    dominio: cookie.domain ?? '',
    nome: cookie.name,
    // O valor é cortado de propósito: cookie de sessão costuma ser longo, e o
    // que interessa aqui é ver que ele existe, não ler o conteúdo.
    valor: cookie.value.length > 24 ? `${cookie.value.slice(0, 24)}...` : cookie.value,
  }))
})

ipcMain.handle('navegador:limpar-cookies', async (): Promise<void> => {
  const cookies = await session.defaultSession.cookies.get({})

  for (const cookie of cookies) {
    // `remove` pede a URL, e não o objeto: ela é remontada a partir do domínio
    // e do caminho. O ponto inicial do domínio (`.exemplo.com`) precisa sair.
    const protocolo = cookie.secure ? 'https' : 'http'
    const dominio = cookie.domain?.replace(/^\./, '') ?? ''
    await session.defaultSession.cookies.remove(`${protocolo}://${dominio}${cookie.path}`, cookie.name)
  }
})

ipcMain.handle('navegador:listar-relatorios', (): RelatorioDeFalha[] => {
  return crashReporter.getUploadedReports().map((relatorio) => ({
    id: relatorio.id,
    // Date não atravessa o IPC preservando o tipo: vai como texto já formatado.
    data: relatorio.date.toLocaleString(),
  }))
})

// A segunda janela é o mesmo navegador, com outro endereço. Quem a cria é o
// processo principal, e é ele quem avisa as demais - as janelas não se
// enxergam, como no exemplo `comunicacao-entre-janelas`.
ipcMain.on('navegador:abrir-em-nova-janela', (evento, endereco: string): void => {
  const nova = criarJanela(endereco)
  const remetente = BrowserWindow.fromWebContents(evento.sender)

  for (const janela of janelas) {
    if (janela === nova) {
      continue
    }

    janela.webContents.send('navegador:aviso', {
      texto: `Outra janela abriu ${endereco}`,
      daPropria: janela === remetente,
    } satisfies AvisoDeOutraJanela)
  }
})

app.whenReady().then(async () => {
  criarColetor().listen(PORTA_COLETOR, '127.0.0.1', () => {
    console.log(`Coletor de relatórios ouvindo em ${URL_COLETOR}`)
  })

  await semearCookies()
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
