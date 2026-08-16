// O contrato da ponte mora num arquivo só dele, e não no preload nem no renderizador,
// porque não pertence a nenhum dos dois: um implementa, o outro consome. Escrito uma
// vez, é contra esta mesma descrição que o compilador confere os dois lados.
export interface ApiObjetoCompartilhado {
  obterMinhaVariavel: () => Promise<string>;
}

declare global {
  interface Window {
    apiObjetoCompartilhado: ApiObjetoCompartilhado;
  }
}
