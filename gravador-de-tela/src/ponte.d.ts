import type { ArquivoGravado, FonteDeCaptura } from './main';

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// Duas assinaturas contam o desenho deste exemplo. `salvar` recebe `ArrayBuffer`, e não
// o `Blob` que o MediaRecorder produz: `Blob` não atravessa o IPC, então a conversão
// acontece na página, antes da chamada. E `aoPedirAlternancia` inverte o sentido
// habitual do acervo - é a bandeja pedindo à página, porque o MediaRecorder só existe
// no renderizador.
export interface ApiGravador {
  listarFontes: () => Promise<FonteDeCaptura[]>;
  escolherFonte: (id: string) => Promise<boolean>;
  marcarGravacao: (ativa: boolean) => void;
  salvar: (dados: ArrayBuffer) => Promise<ArquivoGravado | null>;
  aoPedirAlternancia: (ouvinte: () => void) => void;
}

declare global {
  interface Window {
    apiGravador: ApiGravador;
  }
}
