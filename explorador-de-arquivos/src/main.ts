import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'path'

/** Categorias que têm ícone em `icons/`. O nome do tipo é o nome do arquivo PNG. */
const TIPOS_POR_EXTENSAO: Record<string, string> = {
  compressed: 'zip rar gz 7z',
  text: 'txt md',
  image: 'jpg jpeg png gif bmp',
  pdf: 'pdf',
  css: 'css',
  html: 'html',
  word: 'doc docx',
  powerpoint: 'ppt pptx',
  excel: 'xls xlsx',
  movie: 'mkv avi rmvb mp4 mov',
  music: 'mp3 wav flac aac',
}

export interface EntradaDePasta {
  name: string
  path: string
  /** Nome do ícone em `icons/`, sem a extensão. */
  type: string
}

// O que o handler `arquivos:listar` devolve. Esta interface morava no preload, e por
// isso o handler que MONTA o objeto não podia usá-la: importá-la de lá criaria um ciclo
// `main` <-> `preload`. Declarada aqui, onde o dado nasce, o ciclo some e o retorno do
// handler passa a ser conferido contra o que o preload promete.
export interface ConteudoDePasta {
  caminho: string
  entradas: EntradaDePasta[]
}

let janelaPrincipal: BrowserWindow | null = null
let janelaSobre: BrowserWindow | null = null

// O mapa extensão -> tipo era percorrido com `_.include` do underscore. Hoje
// `Array.includes` resolve, e o underscore saiu do exemplo por isso.
function tipoPorExtensao(nome: string): string {
  const extensao = path.extname(nome).slice(1).toLowerCase()
  if (!extensao) return 'text'

  for (const [tipo, extensoes] of Object.entries(TIPOS_POR_EXTENSAO)) {
    if (extensoes.split(' ').includes(extensao)) return tipo
  }
  return 'blank'
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 900,
    height: 600,
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

// O acesso ao disco vivia no renderizador, com `fs.readdir` e `fs.statSync`
// chamados direto da página. Agora fica aqui, e o renderizador recebe a lista
// pronta - já com o tipo resolvido para escolher o ícone.
ipcMain.handle(
  'arquivos:listar',
  async (_evento, diretorio: string): Promise<ConteudoDePasta> => {
    const alvo = diretorio.startsWith('~')
      ? path.join(os.homedir(), diretorio.slice(1))
      : diretorio

    const nomes = await fs.readdir(alvo)
    const entradas: EntradaDePasta[] = []

    for (const nome of nomes) {
      const completo = path.join(alvo, nome)
      try {
        const informacao = await fs.stat(completo)
        entradas.push({
          name: nome,
          path: completo,
          type: informacao.isDirectory() ? 'folder' : tipoPorExtensao(nome),
        })
      } catch {
        // Link quebrado ou permissão negada: entra na lista, sem ícone próprio.
        entradas.push({ name: nome, path: completo, type: 'blank' })
      }
    }

    // Pastas primeiro, depois arquivos, cada grupo em ordem alfabética.
    entradas.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })

    return { caminho: alvo, entradas }
  },
)

ipcMain.handle('arquivos:e-pasta', async (_evento, caminho: string): Promise<boolean> => {
  try {
    return (await fs.stat(caminho)).isDirectory()
  } catch {
    return false
  }
})

// `shell.openItem` foi removida; `shell.openPath` é a substituta, e resolve com
// string vazia quando dá certo.
ipcMain.handle('arquivos:abrir', async (_evento, caminho: string): Promise<string> => {
  return shell.openPath(caminho)
})

ipcMain.handle('arquivos:inicio', (): string => os.homedir())

ipcMain.handle('arquivos:sobre', (): void => {
  if (janelaSobre && !janelaSobre.isDestroyed()) {
    janelaSobre.focus()
    return
  }

  janelaSobre = new BrowserWindow({
    width: 400,
    height: 150,
    resizable: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  })

  // Sem isto, o link com target="_blank" abriria mais uma janela do Electron
  // dentro do aplicativo. O handler intercepta o pedido, manda o endereço para o
  // navegador do sistema e nega a abertura interna.
  //
  // No exemplo original o mesmo efeito vinha de um `require('shell')` no HTML,
  // que só funcionava com nodeIntegration ligado - e que abria um endereço fixo,
  // ignorando o href do link.
  janelaSobre.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    janelaSobre.loadURL(new URL('about.html', process.env.VITE_DEV_SERVER_URL).toString())
  } else {
    janelaSobre.loadFile(path.join(__dirname, '../dist/about.html'))
  }

  janelaSobre.on('closed', () => {
    janelaSobre = null
  })
})

app.whenReady().then(() => {
  // O menu padrão do macOS antes vinha de `Menu.createMacBuiltin`, chamado pelo
  // renderizador via remote. Hoje o Electron já monta um menu padrão sozinho.
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.getApplicationMenu())
  }
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
