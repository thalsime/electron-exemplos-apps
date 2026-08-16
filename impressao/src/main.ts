import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'path'

export interface OpcoesDeImpressao {
  paisagem: boolean
  tamanhoDaPagina: 'A3' | 'A4' | 'Legal' | 'Letter' | 'Tabloid'
  tipoDeMargem: 'default' | 'none' | 'printableArea'
  imprimirFundo: boolean
}

let janelaPrincipal: BrowserWindow | null = null

// A janela que exibe o documento a ser impresso. No exemplo original ela era
// criada pelo RENDERIZADOR, com `new remote.BrowserWindow(...)`, e a referência
// ficava numa variável da página. Sem o módulo remote isso deixou de ser
// possível: BrowserWindow só existe aqui, então a janela nasce e vive no
// processo principal, e a página apenas pede operações sobre ela.
let janelaDeImpressao: BrowserWindow | null = null

// Caminho do último PDF gravado, para o botão de visualizar.
let ultimoPDF: string | null = null

function urlDaPrevia(): { url?: string; arquivo?: string } {
  if (process.env.VITE_DEV_SERVER_URL) {
    return { url: new URL('print.html', process.env.VITE_DEV_SERVER_URL).toString() }
  }
  return { arquivo: path.join(__dirname, '../dist/print.html') }
}

function abrirPrevia(): void {
  if (janelaDeImpressao && !janelaDeImpressao.isDestroyed()) {
    janelaDeImpressao.focus()
    return
  }

  janelaDeImpressao = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  })

  const destino = urlDaPrevia()
  if (destino.url) janelaDeImpressao.loadURL(destino.url)
  else janelaDeImpressao.loadFile(destino.arquivo!)

  janelaDeImpressao.on('closed', () => {
    janelaDeImpressao = null
  })
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 500,
    height: 560,
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

ipcMain.handle('impressao:abrir-previa', () => {
  abrirPrevia()
})

// `webContents.print` é a ÚNICA das APIs deste exemplo que continua com
// callback: ela não virou Promise. Envolvê-la aqui é o que dá ao renderizador
// uma interface uniforme.
ipcMain.handle('impressao:imprimir', async (): Promise<string> => {
  if (!janelaDeImpressao || janelaDeImpressao.isDestroyed()) {
    return 'A janela de impressão não está aberta.'
  }
  return new Promise((resolve) => {
    janelaDeImpressao!.webContents.print({}, (sucesso, motivo) => {
      resolve(sucesso ? 'Enviado para a impressora.' : `Impressão não concluída: ${motivo}`)
    })
  })
})

ipcMain.handle(
  'impressao:salvar-pdf',
  async (_evento, opcoes: OpcoesDeImpressao): Promise<string> => {
    if (!janelaDeImpressao || janelaDeImpressao.isDestroyed()) {
      return 'A janela de impressão não está aberta.'
    }

    // showSaveDialog passou de callback para Promise, e o retorno virou um
    // objeto com `canceled` e `filePath` no lugar do caminho solto.
    const escolha = await dialog.showSaveDialog(janelaDeImpressao, {
      defaultPath: 'documento.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })
    if (escolha.canceled || !escolha.filePath) return 'Salvamento cancelado.'

    try {
      // printToPDF também virou Promise, e devolve o Buffer direto.
      //
      // Duas opções do exemplo original não existem mais: `marginsType`, que deu
      // lugar ao objeto `margins`, e `printSelectionOnly`, que foi removida sem
      // substituta - por isso o campo correspondente saiu da interface.
      const pdf = await janelaDeImpressao.webContents.printToPDF({
        landscape: opcoes.paisagem,
        pageSize: opcoes.tamanhoDaPagina,
        margins: { marginType: opcoes.tipoDeMargem },
        printBackground: opcoes.imprimirFundo,
      })

      await fs.writeFile(escolha.filePath, pdf)
      ultimoPDF = escolha.filePath
      return `PDF gravado em ${escolha.filePath}`
    } catch (erro) {
      return `Falha ao gerar o PDF: ${String(erro)}`
    }
  },
)

ipcMain.handle('impressao:abrir-pdf', async (): Promise<string> => {
  if (!ultimoPDF) return 'Salve o PDF antes de visualizá-lo.'

  // `shell.openItem` foi removida. A substituta, `openPath`, é uma Promise que
  // resolve com uma string VAZIA em caso de sucesso - e com a mensagem de erro
  // quando falha, o que inverte a intuição de quem lê o retorno.
  const erro = await shell.openPath(ultimoPDF)
  return erro === '' ? `Abrindo ${ultimoPDF}` : `Não foi possível abrir: ${erro}`
})

app.whenReady().then(() => {
  criarJanela()
  abrirPrevia()
})

app.on('window-all-closed', () => {
  app.quit()
})
