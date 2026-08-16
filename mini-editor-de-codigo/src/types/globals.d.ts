// Declaração mínima do CodeMirror 5, que este exemplo congela na versão
// vendorizada. Ele é carregado por tags <script> a partir de public/, e não por
// import: a versão 5 declara `var CodeMirror` em script clássico, forma que só
// produz variável global fora de módulo ES.
//
// Ao contrário das outras bibliotecas que saíram do acervo, o CodeMirror FICA:
// ele não é acessório de interface, é o objeto do exemplo. Sem ele não há
// editor de código para demonstrar.

interface CodeMirrorEditor {
  setOption(nome: string, valor: unknown): void;
  setValue(texto: string): void;
  getValue(): string;
  getSelection(): string;
  replaceSelection(texto: string): void;
  refresh(): void;
  getScrollerElement(): HTMLElement;
  focus(): void;
}

declare function CodeMirror(
  elemento: HTMLElement,
  opcoes: Record<string, unknown>,
): CodeMirrorEditor
