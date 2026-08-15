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
  // no Windows e no Linux o corretor é o do Chromium (Hunspell), e a lista de
  // idiomas abaixo é o que manda. No macOS o Electron delega ao corretor do
  // sistema (NSSpellChecker), e `setSpellCheckerLanguages` vira uma chamada sem
  // efeito - a própria documentação da API registra isso.
  //
  // O que se observa no macOS, medido nesta máquina em 2026-08-15:
  //
  //   - a DETECÇÃO fica multi-idioma e funciona bem: palavras corretas tanto em
  //     português quanto em inglês passam sem sublinhado, no mesmo texto. O
  //     Hunspell do Chromium não faz isso com um idioma só configurado;
  //   - as SUGESTÕES, porém, saem do dicionário inglês. Digitar "erru" num texto
  //     em português sugere "err", e não "erro".
  //
  // Não é configuração faltando nesta máquina: `app.getLocale()`,
  // `app.getPreferredSystemLanguages()` e `getSpellCheckerLanguages()` devolvem
  // todos `pt-BR`, e o dicionário português do sistema TEM as sugestões certas
  // (consultado direto, `NSSpellChecker` responde "erro, erre, erra, errou" para
  // "erru"). O que não repassa essas sugestões é a ponte entre o Chromium e o
  // corretor do macOS.
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
