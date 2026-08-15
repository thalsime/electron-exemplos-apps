import { app, BrowserWindow, Menu, MenuItem } from 'electron'
import path from 'path'

// Idiomas do corretor. O Electron baixa os dicionários sob demanda, na primeira
// verificação, e mantém em cache - por isso a primeira execução pode levar um
// instante a mais para sublinhar as palavras.
const IDIOMAS = ['pt-BR', 'en-US']

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

  // O corretor é nativo do Electron desde a versão 8. O exemplo original usava
  // `webFrame.setSpellCheckProvider` com o módulo `spellchecker`, um pacote
  // nativo que precisaria ser recompilado a cada versão do Electron. Nada disso
  // é necessário hoje.
  //
  // ATENÇÃO A UMA DIFERENÇA DE PLATAFORMA que muda o resultado do exemplo:
  // no Windows e no Linux o corretor é o do Chromium, e a lista de idiomas
  // abaixo é o que manda. No macOS o Electron delega ao corretor do sistema
  // (NSSpellChecker), que detecta o idioma sozinho - e `setSpellCheckerLanguages`
  // vira uma chamada sem efeito, como a própria documentação registra.
  //
  // A consequência prática no macOS: a detecção do erro funciona, mas as
  // SUGESTÕES saem no idioma que o sistema tem ativo em Ajustes do Sistema >
  // Teclado > Texto, e não no que este código pede.
  const sessao = janelaPrincipal.webContents.session
  sessao.setSpellCheckerEnabled(true)
  sessao.setSpellCheckerLanguages(IDIOMAS)

  // Imprime o que valeu de fato, que nem sempre é o que foi pedido. No macOS
  // desta validação, pedir ['pt-BR', 'en-US'] resultou em apenas ['pt-BR'] - o
  // idioma do sistema. A linha existe para tornar essa diferença visível ao
  // aluno em vez de deixá-la como surpresa.
  const emVigor = sessao.getSpellCheckerLanguages()
  console.log(`Idiomas pedidos:   ${IDIOMAS.join(', ')}`)
  console.log(`Idiomas em vigor:  ${emVigor.join(', ') || '(nenhum)'}`)

  // Sublinhar a palavra é só metade do recurso. A outra metade é oferecer as
  // sugestões, e elas chegam prontas no evento `context-menu`: o Chromium já
  // resolveu qual palavra está sob o cursor e o que sugerir para ela.
  //
  // Repare que este handler vive no processo principal e não precisa de preload
  // nem de IPC: o evento nasce aqui, com os dados já resolvidos.
  janelaPrincipal.webContents.on('context-menu', (_evento, parametros) => {
    const menu = new Menu()

    for (const sugestao of parametros.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: sugestao,
        click: () => janelaPrincipal?.webContents.replaceMisspelling(sugestao),
      }))
    }

    // Sem palavra errada sob o cursor não há o que sugerir, e um menu vazio
    // confundiria mais do que ajudaria.
    if (parametros.misspelledWord) {
      if (parametros.dictionarySuggestions.length === 0) {
        menu.append(new MenuItem({ label: 'Nenhuma sugestão', enabled: false }))
      }
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({
        label: `Aprender "${parametros.misspelledWord}"`,
        click: () => sessao.addWordToSpellCheckerDictionary(parametros.misspelledWord),
      }))
    }

    if (menu.items.length > 0) {
      menu.popup({ window: janelaPrincipal! })
    }
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

app.whenReady().then(criarJanela)

app.on('window-all-closed', () => {
  app.quit()
})
