import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

// Os dois papéis. O nome de cada janela viaja na consulta do endereço
// (`?papel=azul`), e é por ele que a página sabe quem ela é.
const PAPEIS = ['azul', 'verde'] as const
type Papel = (typeof PAPEIS)[number]

// O formato do que trafega no canal. Declarado aqui e reimportado com
// `import type` no preload e no renderizador, para que as três pontas
// concordem sobre o formato - e o compilador reclame quando não concordarem.
export interface MensagemRecebida {
  texto: string
  de: Papel | 'desconhecida'
}

// O processo principal precisa saber quem é quem para conseguir entregar a
// mensagem à janela certa. Sem este registro ele teria a mensagem em mãos e
// nenhum destinatário.
const janelas = new Map<Papel, BrowserWindow>()

function criarJanela(papel: Papel, posicaoX: number): BrowserWindow {
  const janela = new BrowserWindow({
    width: 520,
    height: 560,
    x: posicaoX,
    y: 120,
    title: `Janela ${papel}`,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // As duas janelas carregam A MESMA página, com o mesmo preload. O que as
  // diferencia é só o papel que chega pela consulta do endereço.
  if (process.env.VITE_DEV_SERVER_URL) {
    janela.loadURL(`${process.env.VITE_DEV_SERVER_URL}?papel=${papel}`)
  } else {
    janela.loadFile(path.join(__dirname, '../dist/index.html'), { query: { papel } })
  }

  janela.on('closed', () => {
    janelas.delete(papel)
  })

  return janela
}

// O coração do exemplo. A mensagem sobe do renderizador para cá, e é AQUI que
// se decide para onde ela vai. As janelas nunca se falam diretamente.
ipcMain.on('janelas:enviar', (evento, texto: string) => {
  const remetente = BrowserWindow.fromWebContents(evento.sender)

  for (const janela of janelas.values()) {
    // Sem esta comparação a mensagem voltaria para quem a enviou, e a tela do
    // remetente mostraria a própria mensagem como se fosse recebida.
    if (janela === remetente) {
      continue
    }

    janela.webContents.send('janelas:receber', {
      texto,
      // O destinatário quer saber de quem veio, e quem sabe isso é o
      // intermediário: o remetente não se identifica na mensagem.
      de: papelDaJanela(remetente),
    })
  }
})

function papelDaJanela(janela: BrowserWindow | null): Papel | 'desconhecida' {
  for (const [papel, candidata] of janelas) {
    if (candidata === janela) {
      return papel
    }
  }
  return 'desconhecida'
}

app.whenReady().then(() => {
  // Posições diferentes de propósito: as duas precisam estar visíveis ao mesmo
  // tempo para o exemplo fazer sentido.
  janelas.set('azul', criarJanela('azul', 80))
  janelas.set('verde', criarJanela('verde', 640))
})

app.on('window-all-closed', () => {
  app.quit()
})
