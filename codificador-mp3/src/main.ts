import { app, BrowserWindow, ipcMain } from 'electron'
import { spawn } from 'node:child_process'
import { chmodSync, existsSync } from 'node:fs'
import path from 'path'

export interface PedidoDeCodificacao {
  origem: string
  taxaDeBits: number
}

export interface LinhaDeRegistro {
  texto: string
  tipo: 'info' | 'sucesso' | 'erro'
}

let janelaPrincipal: BrowserWindow | null = null

// O binário do shineenc acompanha o exemplo, um por plataforma. É ele que dá
// sentido ao exemplo: demonstrar a execução de um processo externo a partir de
// um aplicativo Electron.
function caminhoDoCodificador(): string | null {
  const base = path.join(__dirname, '..', 'vendor', 'bin')
  if (process.platform === 'darwin') return path.join(base, 'osx', 'shineenc')
  if (process.platform === 'win32') return path.join(base, 'win32', 'shineenc.exe')
  return null
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 700,
    height: 520,
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

function registrar(texto: string, tipo: LinhaDeRegistro['tipo'] = 'info'): void {
  janelaPrincipal?.webContents.send('mp3:registro', { texto, tipo } satisfies LinhaDeRegistro)
}

// `child_process.spawn` rodava no renderizador, o que só era possível com
// nodeIntegration ligado. Agora vive aqui, e a página acompanha o andamento
// pelas mensagens enviadas de volta.
ipcMain.handle('mp3:codificar', (_evento, pedido: PedidoDeCodificacao): void => {
  const codificador = caminhoDoCodificador()
  if (!codificador) {
    registrar(`Sem binário do shineenc para ${process.platform}.`, 'erro')
    return
  }
  if (!existsSync(pedido.origem)) {
    registrar(`Arquivo não encontrado: ${pedido.origem}`, 'erro')
    return
  }

  // O bit de execução se perde quando o repositório é baixado como zip. Repor
  // antes de cada execução é mais barato que descobrir isso na hora do erro.
  try {
    chmodSync(codificador, 0o755)
  } catch {
    registrar('Não foi possível marcar o codificador como executável.', 'erro')
    return
  }

  const destino = pedido.origem.replace(/\.wave?$/i, '.mp3')
  const alvo = destino === pedido.origem ? `${pedido.origem}.mp3` : destino

  registrar(`Codificando para ${alvo}`)

  const processo = spawn(codificador, ['-b', String(pedido.taxaDeBits), pedido.origem, alvo])

  processo.stdout.on('data', (dados: Buffer) => registrar(dados.toString()))
  processo.stderr.on('data', (dados: Buffer) => registrar(dados.toString(), 'erro'))
  processo.on('error', (erro) => registrar(`Falha ao executar: ${erro.message}`, 'erro'))
  processo.on('exit', (codigo) => {
    registrar(`Processo encerrado com código ${codigo}`, codigo === 0 ? 'sucesso' : 'erro')
  })
})

app.whenReady().then(criarJanela)

app.on('window-all-closed', () => {
  app.quit()
})
