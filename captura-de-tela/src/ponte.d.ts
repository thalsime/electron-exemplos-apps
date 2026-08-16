import type { FonteDeCaptura } from './main';

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Repare no que a ponte NÃO expõe. O `desktopCapturer` e o objeto original de cada
// fonte ficam do lado do processo principal; a página só recebe `FonteDeCaptura`, que é
// texto e data URL. É o contrato que torna esse limite visível de uma olhada.
export interface CapturaApi {
  listarFontes: () => Promise<FonteDeCaptura[]>;
  escolherFonte: (id: string) => Promise<boolean>;
}

declare global {
  interface Window {
    capturaApi: CapturaApi;
  }
}
