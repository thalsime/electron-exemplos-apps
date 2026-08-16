import type { RecursosDaPlataforma } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// As quatro operações devolvem promessa porque as quatro atravessam o IPC: nenhuma API
// de ícone existe no renderizador. O contrato deixa isso explícito antes de o aluno
// procurar `app.dock` na página e não encontrar.
export interface ApiIcone {
  recursos: () => Promise<RecursosDaPlataforma>
  definirContador: (quantidade: number) => Promise<void>
  limparContador: () => Promise<void>
  trocarIcone: (nome: string) => Promise<void>
}

declare global {
  interface Window {
    apiIcone: ApiIcone
  }
}
