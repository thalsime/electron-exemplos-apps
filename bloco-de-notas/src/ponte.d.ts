import type { ComandoDoMenu, Nota, NotaNova } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Repare no que NÃO está aqui: nada de menu de contexto. Ele é montado inteiro no
// processo principal, a partir do evento nativo do webContents - justamente para não
// competir com o corretor ortográfico. Ver o README.
//
// `criar` recebe `NotaNova` e `atualizar` recebe `Nota`: quem atribui o id é o banco,
// como no exemplo `sqlite`. E `aoReceberComando` é o único caminho de mão inversa, do
// menu de aplicação para a página - que é quem sabe qual nota está aberta.
export interface ApiNotas {
  listar: () => Promise<Nota[]>
  criar: (nota: NotaNova) => Promise<number>
  atualizar: (nota: Nota) => Promise<void>
  remover: (id: number) => Promise<void>
  exportar: (nota: Nota) => Promise<string | null>
  salvarPDF: () => Promise<string | null>
  aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void) => void
}

declare global {
  interface Window {
    apiNotas: ApiNotas
  }
}
