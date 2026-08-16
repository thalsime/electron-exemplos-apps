import type { RelatorioDeFalha } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// `RelatorioDeFalha` é importado do main.ts, onde o dado nasce. O `import type` some na
// compilação, então esta linha não faz o renderizador carregar nada do main.
export interface CrashReportApi {
  listarRelatorios: () => Promise<RelatorioDeFalha[]>
  provocarFalha: () => void
}

declare global {
  interface Window {
    crashReportApi: CrashReportApi
  }
}
