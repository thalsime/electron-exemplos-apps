import type { AcaoDeEdicao, ArquivoAberto, ComandoDoMenu } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// As duas últimas operações não devolvem promessa, e a diferença importa: a área de
// transferência é lida e escrita pelo `clipboard` do Electron, que roda no próprio
// preload. Tudo o mais atravessa o IPC. Reunidas, as oito assinaturas separam de um
// olhar o que sai deste processo do que não sai.
export interface ApiEditor {
  abrir: () => Promise<ArquivoAberto | null>
  salvar: (caminho: string, conteudo: string) => Promise<void>
  salvarComo: (conteudo: string) => Promise<string | null>
  novaJanela: () => Promise<void>
  menuDeContexto: (temSelecao: boolean) => Promise<AcaoDeEdicao | null>
  aoReceberComando: (ouvinte: (comando: ComandoDoMenu) => void) => void
  lerAreaDeTransferencia: () => string
  escreverNaAreaDeTransferencia: (texto: string) => void
}

declare global {
  interface Window {
    apiEditor: ApiEditor
  }
}
