import './style.css'
import { BarraDeEndereco } from './barra-de-endereco'
import { ListaDeArquivos } from './lista-de-arquivos'
import type { EntradaDePasta } from './main'

// Quem descreve `window.arquivosApi` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. `ConteudoDePasta` saiu dos imports daqui: o tipo de `conteudo`
// chega por inferência do contrato.

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

let barra: BarraDeEndereco
let lista: ListaDeArquivos

async function navegarPara(caminho: string): Promise<void> {
  try {
    const conteudo = await window.arquivosApi.listar(caminho)
    lista.mostrar(conteudo.entradas)
    barra.definir(conteudo.caminho)
  } catch (erro) {
    window.alert(`Não foi possível abrir a pasta:\n${String(erro)}`)
  }
}

async function abrirEntrada(entrada: EntradaDePasta): Promise<void> {
  if (entrada.type === 'folder') {
    await navegarPara(entrada.path)
    return
  }
  const erro = await window.arquivosApi.abrir(entrada.path)
  if (erro) window.alert(`Não foi possível abrir o arquivo:\n${erro}`)
}

window.addEventListener('DOMContentLoaded', () => {
  lista = new ListaDeArquivos(elemento('#arquivos'), (entrada) => void abrirEntrada(entrada))
  barra = new BarraDeEndereco(elemento('#caminho'), (caminho) => void navegarPara(caminho))

  // Os atalhos da barra lateral guardam o caminho no próprio HTML, como no
  // original - só o atributo mudou de nw-path para data-path.
  document.querySelectorAll<HTMLElement>('[data-path]').forEach((atalho) => {
    atalho.addEventListener('click', (evento) => {
      evento.preventDefault()
      document.querySelectorAll('#barra-lateral li').forEach((li) => li.classList.remove('ativo'))
      atalho.closest('li')?.classList.add('ativo')
      void navegarPara(atalho.dataset.path ?? '~')
    })
  })

  elemento('#sobre').addEventListener('click', (evento) => {
    evento.preventDefault()
    void window.arquivosApi.sobre()
  })

  void window.arquivosApi.inicio().then((inicio) => navegarPara(inicio))
})

export {}
