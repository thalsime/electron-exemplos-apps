import type { ResumoDeCookie } from './main';

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// A ponte é deliberadamente estreita: a página nunca alcança `session.cookies`, só
// recebe `ResumoDeCookie[]` e devolve um deles para remover. É a troca do antigo
// `remote.getCurrentWebContents().session`, e o contrato é onde isso fica evidente.
export interface CookiesApi {
  listar: () => Promise<ResumoDeCookie[]>;
  remover: (cookie: ResumoDeCookie) => Promise<void>;
}

declare global {
  interface Window {
    cookiesApi: CookiesApi;
  }
}
