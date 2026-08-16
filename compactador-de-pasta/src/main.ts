import { app, BrowserWindow, Notification, dialog, ipcMain, shell } from 'electron'
import { spawn } from 'node:child_process'
import path from 'path'

// Cada linha que o programa externo escreve vira uma destas. O tipo diz de qual
// fluxo ela veio, e é o que decide a cor na tela.
export interface LinhaDeSaida {
  texto: string
  fluxo: 'saida' | 'erro' | 'sistema'
}

export interface ResultadoDaCompactacao {
  sucesso: boolean
  arquivo: string
  codigo: number
}

let janelaPrincipal: BrowserWindow | null = null

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 920,
    height: 700,
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

// Cada linha vai para TRÊS destinos ao mesmo tempo: a janela, o terminal e - se
// o DevTools estiver aberto - o console do renderizador, por tabela. É o
// assunto do exemplo `console-e-registros` aplicado a conteúdo real.
function registrar(texto: string, fluxo: LinhaDeSaida['fluxo'] = 'saida'): void {
  // O pedaço que chega de um fluxo NÃO respeita fronteira de linha: ele é o que
  // coube no buffer naquele instante, e costuma trazer várias linhas juntas -
  // às vezes até uma linha partida ao meio. Tratar o pedaço como se fosse uma
  // linha só empilha tudo num bloco na tela. Separar é responsabilidade de quem
  // recebe.
  for (const linha of texto.split('\n')) {
    const limpa = linha.replace(/\s+$/, '')
    if (!limpa) {
      continue
    }

    if (fluxo === 'erro') {
      console.error(`[tar] ${limpa}`)
    } else {
      console.log(`[tar] ${limpa}`)
    }

    janelaPrincipal?.webContents.send('compactador:linha', {
      texto: limpa,
      fluxo,
    } satisfies LinhaDeSaida)
  }
}

ipcMain.handle('compactador:escolher-pasta', async (): Promise<string | null> => {
  const escolha = await dialog.showOpenDialog({
    title: 'Escolha a pasta a compactar',
    properties: ['openDirectory'],
  })

  return escolha.canceled ? null : escolha.filePaths[0]
})

ipcMain.handle(
  'compactador:compactar',
  async (_evento, pasta: string): Promise<ResultadoDaCompactacao> => {
    const nomeDaPasta = path.basename(pasta)
    const destino = path.join(app.getPath('downloads'), `${nomeDaPasta}.tar.gz`)

    registrar(`Compactando ${pasta}`, 'sistema')
    registrar(`Destino: ${destino}`, 'sistema')

    // `tar` existe no macOS, no Linux e no Windows 10 em diante. Os argumentos
    // vão num array, e não numa string única: assim o sistema não passa pelo
    // shell, e nome de pasta com espaço ou aspas não quebra nada nem vira
    // brecha de injeção de comando.
    //   -c criar   -z comprimir   -v listar cada arquivo   -f arquivo de saída
    //   -C entra na pasta-mãe, para o arquivo não guardar o caminho absoluto
    const processo = spawn('tar', [
      '-czvf',
      destino,
      '-C',
      path.dirname(pasta),
      nomeDaPasta,
    ])

    // A saída chega em PEDAÇOS, ao longo do tempo - não é um valor de retorno.
    // Por isso o IPC aqui é `send`, um fluxo, e não a resposta de um `invoke`.
    processo.stdout.on('data', (dados: Buffer) => registrar(dados.toString()))

    // O `tar -v` escreve a lista de arquivos no stderr, e não no stdout. Isso
    // costuma surpreender: no mundo Unix, stderr é para mensagens ao operador,
    // e o stdout fica livre para o dado em si.
    processo.stderr.on('data', (dados: Buffer) => registrar(dados.toString(), 'erro'))

    // A promessa só resolve quando o processo termina, e é por isso que este
    // handler é `handle`: o renderizador espera pelo RESULTADO, enquanto as
    // linhas já chegaram por outro caminho.
    return new Promise((resolve) => {
      processo.on('close', (codigo) => {
        const sucesso = codigo === 0
        registrar(`Processo terminou com código ${codigo}`, 'sistema')

        new Notification({
          title: sucesso ? 'Compactação concluída' : 'A compactação falhou',
          body: sucesso ? path.basename(destino) : `O tar terminou com código ${codigo}`,
        }).show()

        resolve({ sucesso, arquivo: destino, codigo: codigo ?? -1 })
      })

      processo.on('error', (erro) => {
        registrar(`Não foi possível executar o tar: ${erro.message}`, 'erro')
        resolve({ sucesso: false, arquivo: destino, codigo: -1 })
      })
    })
  },
)

ipcMain.handle('compactador:revelar', (_evento, arquivo: string): void => {
  // `showItemInFolder` abre a pasta e deixa o arquivo selecionado - melhor do
  // que `openPath`, que abriria o arquivo no aplicativo padrão.
  shell.showItemInFolder(arquivo)
})

app.whenReady().then(criarJanela)

app.on('window-all-closed', () => {
  app.quit()
})
