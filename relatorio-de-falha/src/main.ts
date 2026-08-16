import { app, BrowserWindow, crashReporter, ipcMain } from 'electron'
import http from 'node:http'
import path from 'path'

const PORTA_COLETOR = 9999
const URL_COLETOR = `http://127.0.0.1:${PORTA_COLETOR}`

// O contrato do que trafega no canal é declarado aqui, e não no preload, porque é
// aqui que o dado nasce: quem monta cada relatório é o handler lá embaixo. O preload
// e a página importam este mesmo tipo, então mudar um campo quebra os três de uma vez.
export interface RelatorioDeFalha {
  id: string
  data: string
}

// O crashReporter é iniciado UMA vez, e só aqui. No exemplo original ele também
// era iniciado no renderizador; hoje isso é desnecessário, porque a configuração
// feita no processo principal já vale para os renderizadores que ele cria.
//
// `companyName` continua aceito, mas é apelido depreciado para uma entrada em
// `globalExtra`. Usar a forma atual evita depender de um alias que já está
// marcado para sair.
crashReporter.start({
  submitURL: URL_COLETOR,
  uploadToServer: true,
  globalExtra: { _companyName: 'sample' },
})

let janelaPrincipal: BrowserWindow | null = null

// Servidor que recebe o relatório de falha. Num aplicativo real isto seria um
// serviço remoto; aqui roda em localhost para o exemplo ser autocontido.
//
// A resposta precisa ser o identificador do relatório: é esse texto que aparece
// depois na coluna ID da tabela.
function criarColetor(): http.Server {
  return http.createServer((_req, res) => {
    const identificador = Math.floor(1000 + Math.random() * 9000).toString()
    console.log(`Relatório de falha recebido. ID atribuído: ${identificador}`)
    res.end(identificador)
  })
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
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

// A lista de relatórios só existe no processo principal. O renderizador pede por
// IPC em vez de alcançar a API direto, que é a troca do antigo módulo remote.
ipcMain.handle('crash-report:listar-relatorios', (): RelatorioDeFalha[] => {
  return crashReporter.getUploadedReports().map((relatorio) => ({
    id: relatorio.id,
    // Date não atravessa o IPC preservando o tipo: vai como texto já formatado.
    data: relatorio.date.toLocaleString(),
  }))
})

app.whenReady().then(() => {
  criarColetor().listen(PORTA_COLETOR, '127.0.0.1', () => {
    console.log(`Coletor de relatórios ouvindo em ${URL_COLETOR}`)
    criarJanela()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
