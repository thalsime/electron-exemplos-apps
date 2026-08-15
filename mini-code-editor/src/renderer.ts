import './style.css'
import type { AcaoDeEdicao, ComandoDoMenu } from './main'

declare global {
  interface Window {
    editorApi: {
      abrir: () => Promise<{ caminho: string; conteudo: string } | null>
      salvar: (caminho: string, conteudo: string) => Promise<void>
      salvarComo: (conteudo: string) => Promise<string | null>
      novaJanela: () => Promise<void>
      menuDeContexto: (temSelecao: boolean) => Promise<AcaoDeEdicao | null>
      aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void) => void
      lerAreaDeTransferencia: () => string
      escreverNaAreaDeTransferencia: (texto: string) => void
    }
  }
}

interface ModoDoEditor {
  modo: unknown
  rotulo: string
}

const MODOS: Record<string, ModoDoEditor> = {
  '.json': { modo: { name: 'javascript', json: true }, rotulo: 'JavaScript (JSON)' },
  '.js': { modo: 'javascript', rotulo: 'JavaScript' },
  '.html': { modo: 'htmlmixed', rotulo: 'HTML' },
  '.css': { modo: 'css', rotulo: 'CSS' },
}

let editor: CodeMirrorEditor
let caminhoAtual: string | null = null

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

const MODO_PADRAO: ModoDoEditor = {
  modo: { name: 'javascript', json: true },
  rotulo: 'JavaScript (JSON)',
}

function aplicarModo(caminho: string | null): void {
  // Sem arquivo carregado o editor continua editável, então o modo também
  // precisa valer: o rótulo vazio dava a impressão de que nada estava ativo.
  if (!caminho) {
    elemento('#title').textContent = '[nenhum documento carregado]'
    document.title = 'Mini Code Editor'
    editor.setOption('mode', MODO_PADRAO.modo)
    elemento('#mode').textContent = MODO_PADRAO.rotulo
    return
  }

  const nome = caminho.split('/').pop() ?? caminho
  elemento('#title').textContent = nome
  document.title = nome

  const extensao = nome.includes('.') ? `.${nome.split('.').pop()}` : ''
  const escolhido = MODOS[extensao] ?? { modo: 'javascript', rotulo: 'JavaScript' }
  editor.setOption('mode', escolhido.modo)
  elemento('#mode').textContent = escolhido.rotulo
}

async function abrirArquivo(): Promise<void> {
  const resultado = await window.editorApi.abrir()
  if (!resultado) return
  caminhoAtual = resultado.caminho
  editor.setValue(resultado.conteudo)
  aplicarModo(caminhoAtual)
}

async function salvarArquivo(): Promise<void> {
  if (caminhoAtual) {
    await window.editorApi.salvar(caminhoAtual, editor.getValue())
    return
  }
  await salvarComo()
}

// "Salvar como" sempre pergunta o destino, mesmo com arquivo já associado. No
// exemplo original isso não existia como ação própria: só acontecia por acaso,
// quando o Save encontrava um documento ainda sem arquivo.
async function salvarComo(): Promise<void> {
  const caminho = await window.editorApi.salvarComo(editor.getValue())
  if (!caminho) return
  caminhoAtual = caminho
  aplicarModo(caminhoAtual)
}

// O menu é construído no processo principal; aqui só chega a ação escolhida, que
// é aplicada sobre a seleção do CodeMirror.
async function aoPedirMenu(evento: MouseEvent): Promise<void> {
  evento.preventDefault()
  const selecao = editor.getSelection()
  const acao = await window.editorApi.menuDeContexto(selecao.length > 0)

  if (acao === 'copiar') {
    window.editorApi.escreverNaAreaDeTransferencia(selecao)
  } else if (acao === 'recortar') {
    window.editorApi.escreverNaAreaDeTransferencia(selecao)
    editor.replaceSelection('')
  } else if (acao === 'colar') {
    editor.replaceSelection(window.editorApi.lerAreaDeTransferencia())
  }
}

function ajustarTamanho(): void {
  const area = elemento('#editor')
  const rolagem = editor.getScrollerElement()
  rolagem.style.width = `${area.offsetWidth}px`
  rolagem.style.height = `${area.offsetHeight}px`
  editor.refresh()
}

window.addEventListener('DOMContentLoaded', () => {
  editor = CodeMirror(elemento('#editor'), {
    mode: { name: 'javascript', json: true },
    lineNumbers: true,
    theme: 'lesser-dark',
    extraKeys: {
      'Cmd-S': () => void salvarArquivo(),
      'Ctrl-S': () => void salvarArquivo(),
    },
  })

  // O botão "novo" abria outra janela com `window.open('file://...')`, caminho
  // que deixou de funcionar com contextIsolation. Agora é o processo principal
  // que cria a janela.
  elemento('#new').addEventListener('click', () => void window.editorApi.novaJanela())
  elemento('#open').addEventListener('click', () => void abrirArquivo())
  elemento('#save').addEventListener('click', () => void salvarArquivo())
  elemento('#save-as').addEventListener('click', () => void salvarComo())

  window.editorApi.aoReceberComando((comando) => {
    if (comando === 'abrir') void abrirArquivo()
    else if (comando === 'salvar') void salvarArquivo()
    else if (comando === 'salvar-como') void salvarComo()
  })

  window.addEventListener('contextmenu', (evento) => void aoPedirMenu(evento))
  window.addEventListener('resize', ajustarTamanho)

  aplicarModo(null)
  ajustarTamanho()
  editor.focus()
})

export {}
