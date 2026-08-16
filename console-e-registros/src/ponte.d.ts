// O contrato da ponte fica num arquivo só dele: o preload implementa, o renderizador
// consome, e é contra esta mesma descrição que o compilador confere os dois.
//
// Repare que `emitirNoPreload` devolve `void` e os outros dois devolvem `Promise<void>`.
// Não é detalhe de estilo: os dois que retornam promessa atravessam o IPC, que é sempre
// assíncrono; o que devolve `void` executa ali mesmo, no processo do renderizador. O
// contrato conta essa diferença antes de o aluno abrir o preload.
export interface ApiRegistros {
  emitirNoMain: () => Promise<void>
  emitirNoPreload: () => void
  abrirDevTools: () => Promise<void>
}

declare global {
  interface Window {
    apiRegistros: ApiRegistros
  }
}
