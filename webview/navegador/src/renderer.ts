import './browser.css';
import type { WebviewTag } from 'electron';

// Este exemplo roda inteiro no renderizador: a tag <webview> é um elemento de
// página, e sua API não passa pelo processo principal. Por isso não há preload
// nem IPC aqui, ao contrário da maioria dos outros exemplos do acervo.
//
// SETE APIS MUDARAM DE NOME OU DE FORMA desde a versão original, e o efeito
// disso era invisível: o código antigo protegia o bloco de zoom e busca com
// `typeof(webview.setZoom) == "function"`. Como o método não existe mais, a
// guarda passava a ser falsa e os dois recursos ficavam DESLIGADOS em silêncio,
// com os botões escondidos por CSS. O exemplo parecia íntegro e rodava com
// metade das funções inertes.
//
//   setZoom(f)              -> setZoomFactor(f)
//   getZoom(callback)       -> getZoomFactor(), agora síncrono
//   find(texto, opções)     -> findInPage(texto, opções)
//   stopFinding('activate') -> stopFindInPage('activateSelection')
//   evento findupdate       -> evento found-in-page, com os dados em event.result
//   evento did-get-redirect-request -> removido
//   evento close            -> crashed e render-process-gone

const NIVEIS_DE_ZOOM = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];
const ZOOM_MINIMO = 0.25;
const ZOOM_MAXIMO = 5;
const PAGINA_INICIAL = 'https://github.com/';

let carregando = false;
let considerarMaiusculas = false;

// Esta função é a razão de este arquivo não ter um único `as` nem um único `!` em 343
// linhas, sendo o maior renderizador do acervo. Ela pede o tipo esperado, devolve esse
// tipo, e falha alto quando o elemento não existe - em vez de afirmar ao compilador algo
// que ninguém verificou.
//
// O contraste está no `janela-sem-moldura`, que faz o mesmo trabalho com nove
// `getElementById(...)!` e cinco `as HTMLInputElement`. Os dois exemplos ficaram como
// estão de propósito: trocar um pelo outro seria refatorar, não tipar. Compare os dois
// arquivos - a diferença de leitura é o argumento.
function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor);
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`);
  return alvo;
}

const webview = (): WebviewTag => elemento<WebviewTag>('webview');
const campoBusca = (): HTMLInputElement => elemento<HTMLInputElement>('#texto-busca');
const campoZoom = (): HTMLInputElement => elemento<HTMLInputElement>('#texto-zoom');

// --- disposição na tela -----------------------------------------------------

function ajustarLayout(): void {
  const controles = elemento('#controles');
  const largura = document.documentElement.clientWidth;
  const altura = document.documentElement.clientHeight - controles.offsetHeight;

  const alvo = webview();
  alvo.style.width = `${largura}px`;
  alvo.style.height = `${altura}px`;

  const triste = elemento('#webview-triste');
  triste.style.width = `${largura}px`;
  triste.style.height = `${(altura * 2) / 3}px`;
  triste.style.paddingTop = `${altura / 3}px`;
}

// --- estado de falha da página ---------------------------------------------

function limparEstadoDeFalha(): void {
  document.body.classList.remove('encerrou', 'travou', 'morto');
}

function marcarFalha(classe: 'travou' | 'morto'): void {
  document.body.classList.add('encerrou', classe);
}

// --- navegação --------------------------------------------------------------

function navegarPara(url: string): void {
  limparEstadoDeFalha();
  webview().src = url;
}

// --- zoom -------------------------------------------------------------------

function vizinhosDeZoom(fator: number): { menor: number; maior: number } {
  let baixo = 0;
  let alto = NIVEIS_DE_ZOOM.length - 1;
  while (alto - baixo > 1) {
    const meio = Math.floor((alto + baixo) / 2);
    if (NIVEIS_DE_ZOOM[meio] < fator) {
      baixo = meio;
    } else if (NIVEIS_DE_ZOOM[meio] > fator) {
      alto = meio;
    } else {
      return { menor: NIVEIS_DE_ZOOM[meio - 1], maior: NIVEIS_DE_ZOOM[meio + 1] };
    }
  }
  return { menor: NIVEIS_DE_ZOOM[baixo], maior: NIVEIS_DE_ZOOM[alto] };
}

// getZoomFactor deixou de receber callback e passou a devolver o valor direto,
// o que simplificou estas três funções.
function aplicarZoom(fator: number): void {
  webview().setZoomFactor(fator);
  campoZoom().value = fator.toString();
}

function aumentarZoom(): void {
  aplicarZoom(vizinhosDeZoom(webview().getZoomFactor()).maior);
}

function diminuirZoom(): void {
  aplicarZoom(vizinhosDeZoom(webview().getZoomFactor()).menor);
}

function abrirCaixaDeZoom(): void {
  const campo = campoZoom();
  campo.value = Number(webview().getZoomFactor().toFixed(6)).toString();
  elemento('#caixa-zoom').style.display = 'flex';
  campo.select();
}

function fecharCaixaDeZoom(): void {
  elemento('#caixa-zoom').style.display = 'none';
}

// --- busca na página --------------------------------------------------------

function buscar(opcoes: { forward?: boolean } = {}): void {
  const texto = campoBusca().value;
  if (texto === '') {
    webview().stopFindInPage('clearSelection');
    elemento('#resultados-busca').textContent = '';
    return;
  }
  webview().findInPage(texto, { matchCase: considerarMaiusculas, ...opcoes });
}

function abrirCaixaDeBusca(): void {
  elemento('#caixa-busca').style.display = 'block';
  campoBusca().select();
}

function fecharCaixaDeBusca(): void {
  const caixa = elemento('#caixa-busca');
  caixa.style.display = 'none';
  caixa.style.left = '';
  caixa.style.opacity = '';
  elemento('#resultados-busca').textContent = '';
}

function fecharCaixas(): void {
  fecharCaixaDeZoom();
  fecharCaixaDeBusca();
}

function caixaCobreOcorrencia(caixa: DOMRect, ocorrencia: Electron.Rectangle): boolean {
  return (
    caixa.left < ocorrencia.x + ocorrencia.width &&
    caixa.right > ocorrencia.x &&
    caixa.top < ocorrencia.y + ocorrencia.height &&
    caixa.bottom > ocorrencia.y
  );
}

// O evento `findupdate` foi substituído por `found-in-page`, e os dados que
// antes vinham soltos no evento agora ficam agrupados em `event.result`.
function aoEncontrarNaPagina(evento: Electron.FoundInPageEvent): void {
  const resultado = evento.result;
  elemento('#resultados-busca').textContent =
    `${resultado.activeMatchOrdinal} de ${resultado.matches}`;

  if (!resultado.finalUpdate || !resultado.selectionArea) return;

  const caixa = elemento('#caixa-busca');
  caixa.style.left = '';
  caixa.style.opacity = '';

  // Tira a caixa da frente da ocorrência ativa, ou a deixa translúcida se não
  // houver espaço na tela.
  if (caixaCobreOcorrencia(caixa.getBoundingClientRect(), resultado.selectionArea)) {
    const esquerda = resultado.selectionArea.x - caixa.getBoundingClientRect().width - 10;
    if (esquerda >= 5) {
      caixa.style.left = `${esquerda}px`;
    } else {
      caixa.style.opacity = '0.5';
    }
  }
}

// --- eventos de carregamento ------------------------------------------------

function aoTerminarCarga(): void {
  limparEstadoDeFalha();
  const alvo = webview();
  elemento<HTMLInputElement>('#endereco').value = alvo.getURL();
  elemento<HTMLButtonElement>('#voltar').disabled = !alvo.canGoBack();
  elemento<HTMLButtonElement>('#avancar').disabled = !alvo.canGoForward();
  fecharCaixas();
}

function aoIniciarCarga(): void {
  document.body.classList.add('carregando');
  carregando = true;
  limparEstadoDeFalha();
}

function aoPararCarga(): void {
  // A classe não sai aqui: a animação do indicador termina sozinha, e removê-la
  // agora faria o giro saltar de volta ao início.
  carregando = false;
}

function aoFalharCarga(evento: Electron.DidFailLoadEvent): void {
  console.log(`Falha ao carregar: ${evento.validatedURL} (${evento.errorDescription})`);
}

// --- teclado ----------------------------------------------------------------

// LIMITE CONHECIDO, e o mesmo do exemplo original: estes atalhos só respondem
// quando o foco está FORA do <webview> - na barra de endereço, por exemplo.
//
// O motivo é a arquitetura: o conteúdo do webview roda em outro processo, e as
// teclas digitadas ali são entregues a ele, não à janela que o hospeda. Este
// listener vive no renderizador de fora e nunca vê esses eventos.
//
// Na prática o zoom por teclado funciona mesmo assim, porque o Chromium tem os
// próprios atalhos dentro do webview (inclusive Cmd+0, que este código não
// implementa). Já o Cmd+F não tem equivalente nativo que abra a nossa caixa de
// busca, então é o único que aparenta estar quebrado.
//
// Para capturá-los com o foco dentro do webview seria preciso interceptar em
// `webContents.on('before-input-event')` no processo principal e avisar o
// renderizador por IPC - o que acrescentaria preload e ponte a um exemplo que
// hoje não precisa de nenhum dos dois.
function aoTeclar(evento: KeyboardEvent): void {
  const modificador = evento.ctrlKey || evento.metaKey;
  if (!modificador) return;

  if (evento.key === 'f') {
    evento.preventDefault();
    abrirCaixaDeBusca();
  } else if (evento.key === '+' || evento.key === '=') {
    evento.preventDefault();
    aumentarZoom();
  } else if (evento.key === '-') {
    evento.preventDefault();
    diminuirZoom();
  }
}

// --- ligação -----------------------------------------------------------------

window.addEventListener('resize', ajustarLayout);

window.addEventListener('DOMContentLoaded', () => {
  const alvo = webview();
  ajustarLayout();

  elemento('#voltar').addEventListener('click', () => alvo.goBack());
  elemento('#avancar').addEventListener('click', () => alvo.goForward());
  elemento('#inicio').addEventListener('click', () => navegarPara(PAGINA_INICIAL));
  elemento('#recarregar').addEventListener('click', () => {
    if (carregando) alvo.stop();
    else alvo.reload();
  });
  elemento('#recarregar').addEventListener('animationiteration', () => {
    if (!carregando) document.body.classList.remove('carregando');
  });

  elemento('#formulario-endereco').addEventListener('submit', (evento) => {
    evento.preventDefault();
    navegarPara(elemento<HTMLInputElement>('#endereco').value);
  });

  alvo.addEventListener('did-start-loading', aoIniciarCarga);
  alvo.addEventListener('did-stop-loading', aoPararCarga);
  alvo.addEventListener('did-finish-load', aoTerminarCarga);
  alvo.addEventListener('did-fail-load', aoFalharCarga);
  alvo.addEventListener('found-in-page', aoEncontrarNaPagina);

  // `close` com tipo 'abnormal' ou 'killed' deu lugar a dois eventos próprios.
  alvo.addEventListener('crashed', () => marcarFalha('travou'));
  alvo.addEventListener('render-process-gone', () => marcarFalha('morto'));

  elemento('#zoom').addEventListener('click', () => {
    if (elemento('#caixa-zoom').style.display === 'flex') fecharCaixaDeZoom();
    else abrirCaixaDeZoom();
  });

  elemento('#formulario-zoom').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const fator = Math.min(ZOOM_MAXIMO, Math.max(ZOOM_MINIMO, Number(campoZoom().value)));
    aplicarZoom(fator);
  });

  elemento('#aumentar-zoom').addEventListener('click', (evento) => {
    evento.preventDefault();
    aumentarZoom();
  });
  elemento('#diminuir-zoom').addEventListener('click', (evento) => {
    evento.preventDefault();
    diminuirZoom();
  });

  elemento('#buscar').addEventListener('click', () => {
    if (elemento('#caixa-busca').style.display === 'block') {
      alvo.stopFindInPage('clearSelection');
      fecharCaixaDeBusca();
    } else {
      abrirCaixaDeBusca();
    }
  });

  campoBusca().addEventListener('input', () => buscar());
  campoBusca().addEventListener('keydown', (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'Enter') {
      evento.preventDefault();
      // 'activate' virou 'activateSelection'.
      alvo.stopFindInPage('activateSelection');
      fecharCaixaDeBusca();
    }
  });

  elemento('#diferenciar-maiusculas').addEventListener('click', (evento) => {
    evento.preventDefault();
    considerarMaiusculas = !considerarMaiusculas;
    const botao = elemento('#diferenciar-maiusculas');
    botao.style.color = considerarMaiusculas ? 'blue' : 'black';
    botao.style.fontWeight = considerarMaiusculas ? 'bold' : '';
    buscar();
  });

  elemento('#buscar-anterior').addEventListener('click', (evento) => {
    evento.preventDefault();
    buscar({ forward: false });
  });
  elemento('#buscar-proximo').addEventListener('click', (evento) => {
    evento.preventDefault();
    buscar({ forward: true });
  });

  elemento('#formulario-busca').addEventListener('submit', (evento) => {
    evento.preventDefault();
    buscar();
  });

  window.addEventListener('keydown', aoTeclar);
});
