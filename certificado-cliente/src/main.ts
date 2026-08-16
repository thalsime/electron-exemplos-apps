import { app, BrowserWindow } from 'electron'
import path from 'path'

// Endereço do servidor HTTPS que acompanha o exemplo, em `servidor.mts`.
// Ele exige certificado de cliente e responde "approved" ou "denied".
const SERVIDOR = 'https://localhost:5000'

let janelaPrincipal: BrowserWindow | null = null

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Se o servidor não estiver no ar, cai na página local de instruções em vez de
  // deixar a janela em branco - esquecer de subir o servidor é o erro mais comum
  // ao rodar este exemplo.
  janelaPrincipal.webContents.on('did-fail-load', () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      janelaPrincipal?.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
      janelaPrincipal?.loadFile(path.join(__dirname, '../dist/index.html'))
    }
  })

  janelaPrincipal.loadURL(SERVIDOR)

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

// O ponto do exemplo. Quando o servidor pede um certificado de cliente, o Electron
// emite este evento com a lista do que existe no sistema.
//
// Sem um handler, o Electron escolhe sozinho o primeiro certificado da lista - o
// comportamento que o README original descreve, e que difere do navegador, onde o
// usuário escolhe num diálogo. O handler abaixo faz explicitamente o que ficaria
// implícito, e de quebra mostra no terminal o que estava disponível.
// Nenhum dos cinco parâmetros acima precisa de anotação, e este exemplo não tem
// `src/ponte.d.ts`: `listaCertificados` chega como `Certificate[]` e `callback` como
// `(certificate?: Certificate) => void`, tudo pelo `electron.d.ts`. Evento nativo traz o
// tipo junto - é só no IPC que o Electron declara `...args: any[]` e o contrato se perde.
//
// Vale saber que o `servidor.mts`, na raiz do exemplo, está FORA do `include: ["src"]`
// do tsconfig: ele é um script à parte, rodado direto pelo Node, e não passa pela
// verificação de tipos do exemplo. Nem todo arquivo `.ts` da pasta está sob `strict`.
app.on('select-client-certificate', (evento, _janela, url, listaCertificados, callback) => {
  evento.preventDefault()

  console.log(`Certificado de cliente pedido por ${url}`)
  for (const certificado of listaCertificados) {
    console.log(`  disponível: ${certificado.subjectName} (emissor: ${certificado.issuerName})`)
  }

  const escolhido = listaCertificados[0]
  if (escolhido) {
    console.log(`  escolhido: ${escolhido.subjectName}`)
    callback(escolhido)
  } else {
    // Sem certificado importado no sistema o servidor responde "denied". É o
    // resultado esperado quando o passo 2 do README não foi feito.
    console.log('  nenhum certificado disponível: a resposta será "denied"')
  }
})

app.whenReady().then(criarJanela)

app.on('window-all-closed', () => {
  app.quit()
})
