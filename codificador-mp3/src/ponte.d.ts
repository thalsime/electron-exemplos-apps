import type { LinhaDeRegistro, PedidoDeCodificacao } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// `caminhoDoArquivo` devolve `string` e não `Promise<string>`: ela não atravessa o IPC,
// roda no próprio preload, que é o único lado com acesso ao `webUtils`.
export interface ApiMp3 {
  caminhoDoArquivo: (arquivo: File) => string
  codificar: (pedido: PedidoDeCodificacao) => Promise<void>
  aoReceberRegistro: (ouvinte: (linha: LinhaDeRegistro) => void) => void
}

declare global {
  interface Window {
    apiMp3: ApiMp3
  }
}
