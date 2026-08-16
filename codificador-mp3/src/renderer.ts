import './app.css';
import type { LinhaDeRegistro } from './main';

// Quem descreve `window.apiMp3` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. `PedidoDeCodificacao` sumiu dos imports daqui junto com a
// declaração duplicada: o objeto montado lá embaixo é conferido pelo contrato.

// O formulário era uma Backbone.View montada com jQuery. Aqui é HTML no próprio
// index.html e DOM nativo: o exemplo trata de executar um processo externo, e as
// três bibliotecas que carregava (jquery, backbone e underscore) não ajudavam a
// mostrar isso.

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor);
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`);
  return alvo;
}

function registrar(linha: LinhaDeRegistro): void {
  const destino = elemento('#registros');
  const item = document.createElement('div');
  item.className = linha.tipo;
  // textContent, e não innerHTML: o texto vem da saída de um processo externo.
  item.textContent = linha.texto.trimEnd();
  destino.appendChild(item);
  destino.scrollTop = destino.scrollHeight;
}

window.addEventListener('DOMContentLoaded', () => {
  window.apiMp3.aoReceberRegistro(registrar);

  elemento('#formulario').addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campo = elemento<HTMLInputElement>('#arquivo');
    const arquivo = campo.files?.[0];
    if (!arquivo) {
      registrar({ texto: 'Escolha um arquivo .wav primeiro.', tipo: 'erro' });
      return;
    }

    const origem = window.apiMp3.caminhoDoArquivo(arquivo);
    if (!origem) {
      registrar({ texto: 'Não foi possível obter o caminho do arquivo.', tipo: 'erro' });
      return;
    }

    const taxaDeBits = Number(elemento<HTMLInputElement>('#taxa-de-bits').value) || 128;
    void window.apiMp3.codificar({ origem, taxaDeBits });
  });
});

export {};
