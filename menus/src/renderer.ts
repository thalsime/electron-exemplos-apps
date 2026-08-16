import type { TipoDeMenu } from './main';

// Quem descreve `window.apiMenus` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere.

// Cada área da janela pede um menu diferente. O clique com o botão direito só
// informa qual menu quer; quem monta e exibe é o processo principal.
const AREAS: Array<{ id: string; tipo: TipoDeMenu }> = [
  { id: 'area-1', tipo: 'itens' },
  { id: 'area-2', tipo: 'frutas' },
  { id: 'area-3', tipo: 'cores' },
];

function registrarArea(id: string, tipo: TipoDeMenu): void {
  const area = document.getElementById(id);
  if (!area) return;

  area.addEventListener('contextmenu', async (evento) => {
    evento.preventDefault();
    const escolha = await window.apiMenus.abrirContexto(tipo);
    if (escolha === null) return;

    // O efeito da escolha acontece aqui, no renderizador: o processo principal
    // devolve o que foi escolhido e não toca no DOM.
    if (tipo === 'cores') {
      area.style.backgroundColor = escolha;
    } else {
      const saida = document.getElementById('saida');
      if (saida) saida.textContent = `Escolhido: ${escolha}`;
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  for (const { id, tipo } of AREAS) {
    registrarArea(id, tipo);
  }
});

export {};
