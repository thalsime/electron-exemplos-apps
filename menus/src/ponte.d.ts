import type { TipoDeMenu } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// A ponte tem uma operação só, e ela devolve `string | null`: `null` é o menu fechado
// sem escolha, que também precisa de resposta - senão a página espera para sempre.
export interface ApiMenus {
  abrirContexto: (tipo: TipoDeMenu) => Promise<string | null>
}

declare global {
  interface Window {
    apiMenus: ApiMenus
  }
}
