// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// As sete operações são uma para cada uso que o exemplo original fazia do módulo
// `remote`. Repare que as duas CONSULTAS devolvem `Promise<boolean>`: com o `remote`
// elas eram síncronas, e ler o estado da janela era uma expressão comum. Hoje toda
// resposta atravessa o IPC, então toda leitura é aguardada - e o contrato é onde essa
// mudança fica registrada.
export interface JanelaApi {
  close: () => Promise<void>;
  minimizar: () => Promise<void>;
  maximizar: () => Promise<void>;
  restaurar: () => Promise<void>;
  definirTelaCheia: (flag: boolean) => Promise<void>;
  estaEmTelaCheia: () => Promise<boolean>;
  estaMaximizada: () => Promise<boolean>;
}

declare global {
  interface Window {
    janelaApi: JanelaApi;
  }
}
