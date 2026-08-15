import type { OpcoesDeImpressao } from './main'

declare global {
  interface Window {
    printingApi: {
      abrirPrevia: () => Promise<void>
      imprimir: () => Promise<string>
      salvarPDF: (opcoes: OpcoesDeImpressao) => Promise<string>
      abrirPDF: () => Promise<string>
    }
  }
}

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

// Lê o formulário e monta as opções no formato que a API espera hoje. O select
// de margens já guarda os valores atuais ('default', 'none', 'printableArea'),
// no lugar dos inteiros 0, 1 e 2 do antigo marginsType.
function opcoesDoFormulario(): OpcoesDeImpressao {
  return {
    landscape: elemento<HTMLSelectElement>('#layout-settings').value === 'Landscape',
    pageSize: elemento<HTMLSelectElement>('#page-size-settings')
      .value as OpcoesDeImpressao['pageSize'],
    marginType: elemento<HTMLSelectElement>('#margin-settings')
      .value as OpcoesDeImpressao['marginType'],
    printBackground: elemento<HTMLInputElement>('#print-background').checked,
  }
}

function registrar(mensagem: string): void {
  const log = elemento('#output-log')
  const linha = document.createElement('p')
  linha.textContent = mensagem
  log.replaceChildren(linha)
}

window.addEventListener('DOMContentLoaded', () => {
  elemento('#print_button').addEventListener('click', () => {
    void window.printingApi.imprimir().then(registrar)
  })

  elemento('#save_pdf_button').addEventListener('click', () => {
    void window.printingApi.salvarPDF(opcoesDoFormulario()).then(registrar)
  })

  elemento('#view_pdf_button').addEventListener('click', () => {
    void window.printingApi.abrirPDF().then(registrar)
  })

  elemento('#preview_button').addEventListener('click', () => {
    void window.printingApi.abrirPrevia()
  })
})

export {}
