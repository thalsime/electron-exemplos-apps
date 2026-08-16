import type { AvisoDeOutraJanela, RelatorioDeFalha, ResumoDeCookie } from './main';

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Este é o exemplo mais denso do acervo, e as cinco assinaturas resumem os assuntos que
// ele junta: cookies da sessão, relatórios de falha e a conversa entre janelas. A
// `<webview>` não aparece aqui, e é o detalhe que importa - ela é um elemento do DOM,
// vive inteira no renderizador e não precisa de ponte nenhuma.
export interface ApiNavegador {
  listarCookies: () => Promise<ResumoDeCookie[]>;
  limparCookies: () => Promise<void>;
  listarRelatorios: () => Promise<RelatorioDeFalha[]>;
  abrirEmNovaJanela: (endereco: string) => void;
  aoReceberAviso: (ouvinte: (aviso: AvisoDeOutraJanela) => void) => void;
}

declare global {
  interface Window {
    apiNavegador: ApiNavegador;
  }
}
