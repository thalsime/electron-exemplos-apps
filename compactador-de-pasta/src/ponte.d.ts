import type { LinhaDeSaida, ResultadoDaCompactacao } from './main';

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Reunidas, as quatro assinaturas mostram os DOIS formatos de comunicação que este
// exemplo faz conviver. As três primeiras devolvem promessa - pergunta e resposta. A
// última recebe um ouvinte e devolve `void`: é um fluxo que chega ao longo do tempo, e
// não tem um valor de retorno para esperar. Um processo externo produz os dois.
export interface ApiCompactador {
  escolherPasta: () => Promise<string | null>;
  compactar: (pasta: string) => Promise<ResultadoDaCompactacao>;
  revelar: (arquivo: string) => Promise<void>;
  aoReceberLinha: (ouvinte: (linha: LinhaDeSaida) => void) => void;
}

declare global {
  interface Window {
    apiCompactador: ApiCompactador;
  }
}
