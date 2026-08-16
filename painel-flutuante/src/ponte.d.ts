import type { EstadoDaApresentacao } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, as páginas
// consomem, e é contra esta mesma descrição que o compilador confere todos.
//
// Aqui o arquivo próprio rende o triplo. São DUAS páginas - o painel e a janela de
// conteúdo - servidas por um preload só. Antes, cada uma reescrevia estas cinco
// assinaturas por conta própria, e nenhuma das três cópias era comparada com as outras.
//
// Só `estadoAtual` devolve promessa. As outras quatro usam `send`, que não espera
// resposta: o painel manda a INTENÇÃO, o processo principal calcula, e o resultado
// volta pelo `aoMudarEstado` - para as duas janelas ao mesmo tempo.
export interface ApiPainel {
  estadoAtual: () => Promise<EstadoDaApresentacao>
  alternarApresentacao: () => void
  moverSlide: (passo: number) => void
  ocultarPainel: () => void
  aoMudarEstado: (ouvinte: (estado: EstadoDaApresentacao) => void) => void
}

declare global {
  interface Window {
    apiPainel: ApiPainel
  }
}
