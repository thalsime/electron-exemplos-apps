import { app, BrowserWindow } from 'electron'
import * as path from 'node:path'

// A referência da janela fica em escopo de módulo de propósito: se ela existisse
// apenas dentro da função, o coletor de lixo poderia descartar a janela ainda em uso.
let janelaPrincipal: BrowserWindow | null = null

// Cria a janela e carrega o HTML. Como esta página é estática, o renderizador não
// precisa de acesso ao Node - por isso nenhuma permissão extra é concedida aqui.
function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600
  })

  // __dirname aponta para dist/, então subimos um nível para achar o index.html
  janelaPrincipal.loadFile(path.join(__dirname, '..', 'index.html'))

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

app.whenReady().then(criarJanela)
