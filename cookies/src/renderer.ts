import './manager.css'
import type { ResumoDeCookie } from './main'

declare global {
  interface Window {
    cookiesApi: {
      listar: () => Promise<ResumoDeCookie[]>
      remover: (cookie: ResumoDeCookie) => Promise<void>
    }
  }
}

const TECLA_ESC = 'Escape'

// Cache dos cookies agrupados por domínio. Existe para a tabela e o filtro não
// precisarem consultar o processo principal a cada digitação.
const porDominio = new Map<string, ResumoDeCookie[]>()

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

function reconstruirCache(cookies: ResumoDeCookie[]): void {
  porDominio.clear()
  for (const cookie of cookies) {
    const lista = porDominio.get(cookie.domain) ?? []
    lista.push(cookie)
    porDominio.set(cookie.domain, lista)
  }
}

function dominios(filtro: string): string[] {
  return [...porDominio.keys()]
    .filter((dominio) => !filtro || dominio.includes(filtro))
    .sort()
}

async function removerDominio(dominio: string): Promise<void> {
  for (const cookie of porDominio.get(dominio) ?? []) {
    await window.cookiesApi.remover(cookie)
  }
  await recarregar()
}

async function removerTudo(): Promise<void> {
  // Uma cópia da lista antes de remover: iterar sobre o cache enquanto ele é
  // alterado foi um dos defeitos do exemplo original.
  const todos = [...porDominio.values()].flat()
  for (const cookie of todos) {
    await window.cookiesApi.remover(cookie)
  }
  await recarregar()
}

function montarTabela(): void {
  const filtro = elemento<HTMLInputElement>('#filtro').value
  const listados = dominios(filtro)

  elemento('#contagem-filtrada').textContent = String(listados.length)
  elemento('#contagem-total').textContent = String(porDominio.size)

  const acao = elemento('#acao-em-massa')
  acao.replaceChildren()
  if (listados.length > 0) {
    const botao = document.createElement('button')
    botao.textContent = `apagar os ${listados.length} listados`
    botao.addEventListener('click', () => {
      void Promise.all(listados.map(removerDominio))
    })
    acao.appendChild(botao)
  }

  const tabela = elemento<HTMLTableElement>('#tabela-cookies')
  while (tabela.rows.length > 1) {
    tabela.deleteRow(tabela.rows.length - 1)
  }

  for (const dominio of listados) {
    const cookies = porDominio.get(dominio) ?? []
    const linha = tabela.insertRow(-1)

    linha.insertCell(-1).textContent = dominio

    const contagem = linha.insertCell(-1)
    contagem.textContent = String(cookies.length)
    contagem.className = 'contagem'

    // Os nomes tornam o exemplo legível: sem eles a tabela mostra só números.
    linha.insertCell(-1).textContent = cookies.map((c) => c.name).join(', ')

    const botao = document.createElement('button')
    botao.textContent = 'apagar'
    botao.addEventListener('click', () => {
      void removerDominio(dominio)
    })
    const celula = linha.insertCell(-1)
    celula.appendChild(botao)
    celula.className = 'button'
  }
}

async function recarregar(): Promise<void> {
  reconstruirCache(await window.cookiesApi.listar())
  montarTabela()
}

function limparFiltro(): void {
  const filtro = elemento<HTMLInputElement>('#filtro')
  filtro.focus()
  if (filtro.value.length > 0) {
    filtro.value = ''
    montarTabela()
  }
}

window.addEventListener('DOMContentLoaded', () => {
  void recarregar()

  elemento('#filtro').focus()
  elemento('#remover-tudo').addEventListener('click', () => void removerTudo())
  elemento('#filtro').addEventListener('input', montarTabela)
  elemento('#area-filtro button').addEventListener('click', limparFiltro)

  window.addEventListener('keydown', (evento) => {
    if (evento.key === TECLA_ESC) limparFiltro()
  })
})
