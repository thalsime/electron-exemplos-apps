import type { ConteudoDePasta } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Nenhuma destas cinco assinaturas menciona `fs`. É o ponto do exemplo: todo o acesso
// ao disco fica do lado do processo principal, e a página troca caminhos por listas
// prontas. O exemplo original dava à página o `fs` inteiro pelo módulo `remote`.
export interface ArquivosApi {
  listar: (diretorio: string) => Promise<ConteudoDePasta>
  ehPasta: (caminho: string) => Promise<boolean>
  abrir: (caminho: string) => Promise<string>
  inicio: () => Promise<string>
  sobre: () => Promise<void>
}

declare global {
  interface Window {
    arquivosApi: ArquivosApi
  }
}
