// Trilha de navegação (breadcrumb). Era um módulo em `node_modules/`, importado
// por nome com `require('address_bar')` - truque para módulo local que o import
// relativo do TypeScript tornou desnecessário.
//
// O HTML dos itens vinha de templates jade compilados em tempo de execução.
// Agora é DOM nativo: além de dispensar a biblioteca, o nome de cada pasta entra
// por `textContent`, o que impede que um nome com caracteres de marcação vire
// HTML.

export class BarraDeEndereco {
  private caminhoAtual = '';

  constructor(
    private readonly elemento: HTMLElement,
    private readonly aoNavegar: (caminho: string) => void,
  ) {}

  definir(caminho: string): void {
    this.caminhoAtual = caminho;
    this.elemento.replaceChildren();

    const partes = caminho.split('/').filter((parte) => parte !== '');
    const trechos = [{ nome: 'raiz', caminho: '/' }];

    let acumulado = '';
    for (const parte of partes) {
      acumulado += `/${parte}`;
      trechos.push({ nome: parte, caminho: acumulado });
    }

    trechos.forEach((trecho, indice) => {
      const item = document.createElement('li');
      item.dataset.path = trecho.caminho;
      if (indice === trechos.length - 1) item.classList.add('ativo');

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = trecho.nome;
      link.addEventListener('click', (evento) => {
        evento.preventDefault();
        this.aoNavegar(trecho.caminho);
      });

      item.appendChild(link);

      if (indice < trechos.length - 1) {
        const separador = document.createElement('span');
        separador.className = 'divider';
        separador.textContent = '/';
        item.appendChild(separador);
      }

      this.elemento.appendChild(item);
    });
  }

  get caminho(): string {
    return this.caminhoAtual;
  }
}
