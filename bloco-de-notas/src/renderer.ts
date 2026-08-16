import './estilo.css'
import type { ComandoDoMenu, Nota } from './main'

// Quem descreve `window.apiNotas` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. Os dois tipos continuam importados porque `notaAberta`, `abrirNota`
// e o mapa de ações do menu os usam - o import não era só para a declaração.

// As duas telas vivem na mesma janela, e a troca é por `location.hash` - o
// mesmo mecanismo do exemplo `telas-no-mesmo-renderizador`.
const TELAS = ['lista', 'editor'] as const
type Tela = (typeof TELAS)[number]

let notaAberta: Nota | null = null

const campoTitulo = document.getElementById('campo-titulo') as HTMLInputElement
const campoTexto = document.getElementById('campo-texto') as HTMLTextAreaElement

function anunciar(mensagem: string): void {
  const area = document.getElementById('situacao')
  if (area) {
    area.textContent = mensagem
  }
}

function mostrarTela(tela: Tela): void {
  for (const nome of TELAS) {
    document.getElementById(`tela-${nome}`)?.classList.toggle('ativa', nome === tela)
  }
}

function telaDoEndereco(): Tela {
  const nome = location.hash.replace(/^#/, '')
  return (TELAS as readonly string[]).includes(nome) ? (nome as Tela) : 'lista'
}

window.addEventListener('hashchange', () => mostrarTela(telaDoEndereco()))

// ---------------------------------------------------------------------------
// Lista
// ---------------------------------------------------------------------------

async function recarregarLista(): Promise<void> {
  const notas = await window.apiNotas.listar()
  const lista = document.getElementById('lista-de-notas')

  if (!lista) {
    return
  }

  lista.replaceChildren()

  for (const nota of notas) {
    const cartao = document.createElement('article')
    cartao.className = 'cartao'

    const titulo = document.createElement('h3')
    titulo.textContent = nota.titulo

    const previa = document.createElement('p')
    previa.textContent = nota.texto.slice(0, 120) || '(vazia)'

    const data = document.createElement('span')
    data.className = 'data'
    data.textContent = new Date(nota.atualizadaEm).toLocaleString()

    const abrir = document.createElement('button')
    abrir.textContent = 'Abrir'
    abrir.addEventListener('click', () => abrirNota(nota))

    const remover = document.createElement('button')
    remover.textContent = 'Remover'
    remover.className = 'perigo'
    remover.addEventListener('click', async () => {
      await window.apiNotas.remover(nota.id)
      anunciar(`Nota ${nota.id} removida do banco.`)
      await recarregarLista()
    })

    const acoes = document.createElement('div')
    acoes.className = 'acoes'
    acoes.append(abrir, remover)

    cartao.append(titulo, previa, data, acoes)
    lista.appendChild(cartao)
  }

  const contagem = document.getElementById('contagem')
  if (contagem) {
    contagem.textContent = String(notas.length)
  }
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function abrirNota(nota: Nota): void {
  notaAberta = nota
  campoTitulo.value = nota.titulo
  campoTexto.value = nota.texto
  location.hash = '#editor'
  anunciar(`Editando a nota ${nota.id}.`)
}

async function novaNota(): Promise<void> {
  const id = await window.apiNotas.criar({ titulo: 'Sem título', texto: '' })
  const notas = await window.apiNotas.listar()
  const criada = notas.find((nota) => nota.id === id)

  if (criada) {
    abrirNota(criada)
    anunciar(`Nota ${id} criada. Escreva e salve.`)
  }
}

async function salvarNota(): Promise<void> {
  if (!notaAberta) {
    anunciar('Nenhuma nota aberta para salvar.')
    return
  }

  notaAberta = {
    ...notaAberta,
    titulo: campoTitulo.value.trim() || 'Sem título',
    texto: campoTexto.value,
  }

  await window.apiNotas.atualizar(notaAberta)
  await recarregarLista()
  anunciar(`Nota ${notaAberta.id} salva no banco.`)
}

async function exportarNota(): Promise<void> {
  if (!notaAberta) {
    return
  }

  const caminho = await window.apiNotas.exportar(notaAberta)
  anunciar(caminho ? `Exportada para ${caminho}` : 'Exportação cancelada.')
}

async function salvarPDF(): Promise<void> {
  const caminho = await window.apiNotas.salvarPDF()
  anunciar(caminho ? `PDF salvo em ${caminho}` : 'Geração de PDF cancelada.')
}

document.getElementById('botao-nova')?.addEventListener('click', () => void novaNota())
document.getElementById('botao-salvar')?.addEventListener('click', () => void salvarNota())
document.getElementById('botao-exportar')?.addEventListener('click', () => void exportarNota())
document.getElementById('botao-pdf')?.addEventListener('click', () => void salvarPDF())

// Os itens do menu de aplicação chegam por aqui. O menu vive no processo
// principal, mas quem sabe qual nota está aberta é esta página.
window.apiNotas.aoReceberComando((comando) => {
  const acoes: Record<ComandoDoMenu, () => void> = {
    nova: () => void novaNota(),
    salvar: () => void salvarNota(),
    exportar: () => void exportarNota(),
    pdf: () => void salvarPDF(),
  }

  acoes[comando]()
})

mostrarTela(telaDoEndereco())
void recarregarLista()

export {}
