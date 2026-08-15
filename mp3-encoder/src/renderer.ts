import './app.css'
import type { LinhaDeLog, PedidoDeCodificacao } from './main'

declare global {
  interface Window {
    mp3Api: {
      caminhoDoArquivo: (arquivo: File) => string
      codificar: (pedido: PedidoDeCodificacao) => Promise<void>
      aoReceberLog: (ouvinte: (linha: LinhaDeLog) => void) => void
    }
  }
}

// O formulário era uma Backbone.View montada com jQuery. Aqui é HTML no próprio
// index.html e DOM nativo: o exemplo trata de executar um processo externo, e as
// três bibliotecas que carregava (jquery, backbone e underscore) não ajudavam a
// mostrar isso.

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

function registrar(linha: LinhaDeLog): void {
  const destino = elemento('#logs')
  const item = document.createElement('div')
  item.className = linha.tipo
  // textContent, e não innerHTML: o texto vem da saída de um processo externo.
  item.textContent = linha.texto.trimEnd()
  destino.appendChild(item)
  destino.scrollTop = destino.scrollHeight
}

window.addEventListener('DOMContentLoaded', () => {
  window.mp3Api.aoReceberLog(registrar)

  elemento('#form').addEventListener('submit', (evento) => {
    evento.preventDefault()

    const campo = elemento<HTMLInputElement>('#arquivo')
    const arquivo = campo.files?.[0]
    if (!arquivo) {
      registrar({ texto: 'Escolha um arquivo .wav primeiro.', tipo: 'error' })
      return
    }

    const origem = window.mp3Api.caminhoDoArquivo(arquivo)
    if (!origem) {
      registrar({ texto: 'Não foi possível obter o caminho do arquivo.', tipo: 'error' })
      return
    }

    const bitrate = Number(elemento<HTMLInputElement>('#bitrate').value) || 128
    void window.mp3Api.codificar({ origem, bitrate })
  })
})

export {}
