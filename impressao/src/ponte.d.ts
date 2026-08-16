import type { OpcoesDeImpressao } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Três das quatro operações devolvem `Promise<string>`, e a string é sempre uma
// mensagem para o registro na tela - inclusive quando deu errado. Quem trata o erro é o
// processo principal, que é onde ele acontece; a página só exibe o que recebe.
export interface ApiImpressao {
  abrirPrevia: () => Promise<void>
  imprimir: () => Promise<string>
  salvarPDF: (opcoes: OpcoesDeImpressao) => Promise<string>
  abrirPDF: () => Promise<string>
}

declare global {
  interface Window {
    apiImpressao: ApiImpressao
  }
}
