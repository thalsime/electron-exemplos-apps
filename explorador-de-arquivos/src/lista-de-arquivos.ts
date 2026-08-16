import type { EntradaDePasta } from './main';

// Grade de arquivos da pasta atual. Era o módulo `folder_view` dentro de
// `node_modules/`, com jQuery para os eventos e jade para o HTML de cada item.
//
// A seleção usava delegação de evento do jQuery; aqui cada item registra o
// próprio ouvinte, e o clique no vazio limpa a seleção.

export class ListaDeArquivos {
  constructor(
    private readonly elemento: HTMLElement,
    private readonly aoAbrir: (entrada: EntradaDePasta) => void,
  ) {
    this.elemento.parentElement?.addEventListener('click', () => this.limparSelecao());
  }

  private limparSelecao(): void {
    this.elemento.querySelectorAll('.focus').forEach((item) => item.classList.remove('focus'));
  }

  mostrar(entradas: EntradaDePasta[]): void {
    this.elemento.replaceChildren();

    for (const entrada of entradas) {
      const item = document.createElement('li');
      item.className = 'file';
      item.dataset.path = entrada.path;
      item.title = entrada.name;

      const icone = document.createElement('div');
      icone.className = 'icon';
      const imagem = document.createElement('img');
      imagem.src = `icons/${entrada.type}.png`;
      imagem.alt = entrada.type;
      icone.appendChild(imagem);

      const nome = document.createElement('div');
      nome.className = 'name';
      nome.textContent = entrada.name;

      item.append(icone, nome);

      item.addEventListener('click', (evento) => {
        evento.stopPropagation();
        this.limparSelecao();
        item.classList.add('focus');
      });
      item.addEventListener('dblclick', () => this.aoAbrir(entrada));

      this.elemento.appendChild(item);
    }
  }
}
