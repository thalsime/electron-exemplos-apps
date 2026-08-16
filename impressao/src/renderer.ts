import type { OpcoesDeImpressao } from './main';

// Quem descreve `window.apiImpressao` é o src/ponte.d.ts, o mesmo arquivo contra o qual
// o preload se confere. `OpcoesDeImpressao` continua importado aqui porque
// `opcoesDoFormulario` o usa no retorno - o import não era só para a declaração.

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor);
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`);
  return alvo;
}

// Lê o formulário e monta as opções no formato que a API espera hoje. O select
// de margens já guarda os valores atuais ('default', 'none', 'printableArea'),
// no lugar dos inteiros 0, 1 e 2 do antigo marginsType.
function opcoesDoFormulario(): OpcoesDeImpressao {
  return {
    paisagem: elemento<HTMLSelectElement>('#orientacao').value === 'paisagem',
    tamanhoDaPagina: elemento<HTMLSelectElement>('#tamanho-da-pagina')
      .value as OpcoesDeImpressao['tamanhoDaPagina'],
    tipoDeMargem: elemento<HTMLSelectElement>('#margens')
      .value as OpcoesDeImpressao['tipoDeMargem'],
    imprimirFundo: elemento<HTMLInputElement>('#imprimir-fundo').checked,
  };
}

function registrar(mensagem: string): void {
  const registro = elemento('#registro');
  const linha = document.createElement('p');
  linha.textContent = mensagem;
  registro.replaceChildren(linha);
}

window.addEventListener('DOMContentLoaded', () => {
  elemento('#botao-imprimir').addEventListener('click', () => {
    void window.apiImpressao.imprimir().then(registrar);
  });

  elemento('#botao-salvar-pdf').addEventListener('click', () => {
    void window.apiImpressao.salvarPDF(opcoesDoFormulario()).then(registrar);
  });

  elemento('#botao-ver-pdf').addEventListener('click', () => {
    void window.apiImpressao.abrirPDF().then(registrar);
  });

  elemento('#botao-previa').addEventListener('click', () => {
    void window.apiImpressao.abrirPrevia();
  });
});

export {};
