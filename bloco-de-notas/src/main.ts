import {
  BrowserWindow,
  Menu,
  MenuItem,
  app,
  dialog,
  ipcMain,
  shell,
} from 'electron'
import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs/promises'
import path from 'path'

export interface Nota {
  id: number
  titulo: string
  texto: string
  atualizadaEm: string
}

export type NotaNova = Pick<Nota, 'titulo' | 'texto'>

// Os quatro comandos que o menu de aplicação manda à página. Este tipo morava no
// preload, e por isso os quatro `webContents.send` aqui embaixo - que são quem EMITE o
// comando - passavam uma string solta, sem conferência: `send` recebe `...args: any[]`,
// e um comando escrito errado chegaria à página e cairia fora do mapa de ações, em
// silêncio. Declarado aqui, o `satisfies` de cada envio fecha esse caminho.
export type ComandoDoMenu = 'nova' | 'salvar' | 'exportar' | 'pdf'

const IDIOMAS = ['pt-BR']

let janelaPrincipal: BrowserWindow | null = null
let banco: DatabaseSync | null = null

function abrirBanco(): DatabaseSync {
  const arquivo = path.join(app.getPath('userData'), 'notas.db')
  const bd = new DatabaseSync(arquivo)

  console.log(`Banco de notas em ${arquivo}`)

  bd.exec(`
    CREATE TABLE IF NOT EXISTS notas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo        TEXT    NOT NULL,
      texto         TEXT    NOT NULL DEFAULT '',
      atualizada_em TEXT    NOT NULL
    )
  `)

  const total = bd.prepare('SELECT COUNT(*) AS quantidade FROM notas').get()

  if (Number(total?.quantidade ?? 0) === 0) {
    bd.prepare('INSERT INTO notas (titulo, texto, atualizada_em) VALUES (?, ?, ?)').run(
      'Primeira nota',
      'Escreva aqui. O texto passa pelo corretor ortográfico: clique com o botão direito sobre uma palavra sublinhada para ver as sugestões.',
      new Date().toISOString(),
    )
  }

  return bd
}

// A linha do banco chega como Record e o compilador recusa o cast direto - é a
// mesma fronteira do exemplo `sqlite`.
function paraNota(linha: Record<string, unknown>): Nota {
  return {
    id: Number(linha.id),
    titulo: String(linha.titulo),
    texto: String(linha.texto),
    atualizadaEm: String(linha.atualizada_em),
  }
}

// ---------------------------------------------------------------------------
// O menu de contexto, e o conflito que ele resolve
// ---------------------------------------------------------------------------

// Dois exemplos do acervo montam menu de contexto de formas incompatíveis: o
// `mini-editor-de-codigo` escuta `contextmenu` no DOM e chama `preventDefault()`
// antes de pedir o menu por IPC; o `corretor-ortografico` depende do evento
// nativo `webContents.on('context-menu')`, que SÓ dispara se o do DOM não for
// suprimido. Juntar os dois como estão faz um calar o outro, sem erro visível.
//
// A saída aqui é um handler nativo ÚNICO, que ramifica: havendo palavra errada
// sob o cursor, mostra as sugestões; senão, mostra as ações de edição. A página
// não intercepta `contextmenu` em lugar nenhum.
function instalarMenuDeContexto(janela: BrowserWindow): void {
  janela.webContents.on('context-menu', (_evento, parametros) => {
    const menu = new Menu()

    if (parametros.misspelledWord) {
      for (const sugestao of parametros.dictionarySuggestions) {
        menu.append(
          new MenuItem({
            label: sugestao,
            click: () => janela.webContents.replaceMisspelling(sugestao),
          }),
        )
      }

      if (parametros.dictionarySuggestions.length === 0) {
        menu.append(new MenuItem({ label: 'Nenhuma sugestão', enabled: false }))
      }

      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(
        new MenuItem({
          label: `Aprender "${parametros.misspelledWord}"`,
          click: () =>
            janela.webContents.session.addWordToSpellCheckerDictionary(parametros.misspelledWord),
        }),
      )
    } else {
      // `editFlags` diz o que faz sentido oferecer no ponto em que o usuário
      // clicou: sem seleção, copiar e recortar ficam desabilitados.
      menu.append(new MenuItem({ role: 'cut', enabled: parametros.editFlags.canCut }))
      menu.append(new MenuItem({ role: 'copy', enabled: parametros.editFlags.canCopy }))
      menu.append(new MenuItem({ role: 'paste', enabled: parametros.editFlags.canPaste }))
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({ role: 'selectAll' }))
    }

    menu.popup({ window: janela })
  })
}

// ---------------------------------------------------------------------------
// Menu de aplicação
// ---------------------------------------------------------------------------

function instalarMenuDeAplicacao(): void {
  const menu = Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),
    {
      label: 'Nota',
      submenu: [
        {
          label: 'Nova nota',
          accelerator: 'CmdOrCtrl+N',
          click: () => janelaPrincipal?.webContents.send('notas:comando', 'nova' satisfies ComandoDoMenu),
        },
        {
          label: 'Salvar',
          accelerator: 'CmdOrCtrl+S',
          click: () => janelaPrincipal?.webContents.send('notas:comando', 'salvar' satisfies ComandoDoMenu),
        },
        { type: 'separator' },
        {
          label: 'Exportar como texto...',
          click: () => janelaPrincipal?.webContents.send('notas:comando', 'exportar' satisfies ComandoDoMenu),
        },
        {
          label: 'Salvar como PDF...',
          accelerator: 'CmdOrCtrl+P',
          click: () => janelaPrincipal?.webContents.send('notas:comando', 'pdf' satisfies ComandoDoMenu),
        },
      ],
    },
    { role: 'editMenu' },
  ])

  Menu.setApplicationMenu(menu)
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const sessao = janelaPrincipal.webContents.session
  sessao.setSpellCheckerEnabled(true)
  sessao.setSpellCheckerLanguages(IDIOMAS)
  console.log(`Idiomas do corretor em vigor: ${sessao.getSpellCheckerLanguages().join(', ')}`)

  instalarMenuDeContexto(janelaPrincipal)

  if (process.env.VITE_DEV_SERVER_URL) {
    janelaPrincipal.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    janelaPrincipal.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

// ---------------------------------------------------------------------------
// Banco: as quatro operações, todas no processo principal
// ---------------------------------------------------------------------------

ipcMain.handle('notas:listar', (): Nota[] => {
  const linhas = banco!
    .prepare('SELECT id, titulo, texto, atualizada_em FROM notas ORDER BY atualizada_em DESC')
    .all()

  return linhas.map(paraNota)
})

ipcMain.handle('notas:criar', (_evento, nota: NotaNova): number => {
  const resultado = banco!
    .prepare('INSERT INTO notas (titulo, texto, atualizada_em) VALUES (?, ?, ?)')
    .run(nota.titulo, nota.texto, new Date().toISOString())

  return Number(resultado.lastInsertRowid)
})

ipcMain.handle('notas:atualizar', (_evento, nota: Nota): void => {
  banco!
    .prepare('UPDATE notas SET titulo = ?, texto = ?, atualizada_em = ? WHERE id = ?')
    .run(nota.titulo, nota.texto, new Date().toISOString(), nota.id)
})

ipcMain.handle('notas:remover', (_evento, id: number): void => {
  banco!.prepare('DELETE FROM notas WHERE id = ?').run(id)
})

// ---------------------------------------------------------------------------
// Exportar e imprimir
// ---------------------------------------------------------------------------

ipcMain.handle('notas:exportar', async (_evento, nota: Nota): Promise<string | null> => {
  const escolha = await dialog.showSaveDialog({
    title: 'Exportar a nota',
    defaultPath: path.join(app.getPath('documents'), `${nota.titulo}.txt`),
    filters: [{ name: 'Texto', extensions: ['txt'] }],
  })

  if (escolha.canceled || !escolha.filePath) {
    return null
  }

  await fs.writeFile(escolha.filePath, `${nota.titulo}\n\n${nota.texto}\n`, 'utf-8')
  return escolha.filePath
})

ipcMain.handle('notas:salvar-pdf', async (): Promise<string | null> => {
  if (!janelaPrincipal) {
    return null
  }

  const escolha = await dialog.showSaveDialog({
    title: 'Salvar a nota em PDF',
    defaultPath: path.join(app.getPath('documents'), 'nota.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (escolha.canceled || !escolha.filePath) {
    return null
  }

  // O PDF sai da própria janela, com o CSS de impressão aplicado - o mesmo
  // caminho do exemplo `impressao`.
  const pdf = await janelaPrincipal.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: false,
  })

  await fs.writeFile(escolha.filePath, pdf)
  await shell.openPath(escolha.filePath)

  return escolha.filePath
})

app.whenReady().then(() => {
  banco = abrirBanco()
  instalarMenuDeAplicacao()
  criarJanela()
})

app.on('window-all-closed', () => {
  banco?.close()
  app.quit()
})
