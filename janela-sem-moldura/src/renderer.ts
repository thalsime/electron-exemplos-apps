import './style.css'
import { adicionarBarra, focarBarras, removerBarra, ajustarConteudo } from './barra-de-titulo'

// Quem descreve `window.janelaApi` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere.

function atualizarCaixas(): void {
  var top_checkbox = document.getElementById("caixa-superior") as HTMLInputElement;
  var bottom_checkbox = document.getElementById("caixa-inferior") as HTMLInputElement;
  var left_checkbox = document.getElementById("caixa-esquerda") as HTMLInputElement;
  var right_checkbox = document.getElementById("caixa-direita") as HTMLInputElement;
  if (top_checkbox.checked || bottom_checkbox.checked) {
    left_checkbox.disabled = true;
    right_checkbox.disabled = true;
  } else if (left_checkbox.checked || right_checkbox.checked) {
    top_checkbox.disabled = true;
    bottom_checkbox.disabled = true;
  } else {
    left_checkbox.disabled = false;
    right_checkbox.disabled = false;
    top_checkbox.disabled = false;
    bottom_checkbox.disabled = false;
  }
}

function configurarCaixa(checkboxId: string, titlebar_name: string, titlebar_icon_url: string, titlebar_text: string): void {
  var elem = document.getElementById(checkboxId);
  if (!elem)
    return;
  elem.onclick = function() {
    if ((document.getElementById(checkboxId) as HTMLInputElement).checked)
      adicionarBarra(titlebar_name, titlebar_icon_url, titlebar_text);
    else
      removerBarra(titlebar_name);
    focarBarras(true);

    ajustarConteudo();
    atualizarCaixas();
  }
}

window.onfocus = function() {
  console.log("janela em foco");
  focarBarras(true);
}

window.onblur = function() {
  console.log("janela sem foco");
  focarBarras(false);
}

window.onresize = function() {
  ajustarConteudo();
}

window.onload = function() {
  configurarCaixa("caixa-superior", "barra-superior", "barra-superior.png", "Barra superior");
  configurarCaixa("caixa-inferior", "barra-inferior", "barra-inferior.png", "Barra inferior");
  configurarCaixa("caixa-esquerda", "barra-esquerda", "barra-esquerda.png", "Barra à esquerda");
  configurarCaixa("caixa-direita", "barra-direita", "barra-direita.png", "Barra à direita");

  // Cada botão fala com o processo principal pela ponte exposta no preload. As
  // duas consultas de estado eram síncronas com o remote e agora são aguardadas.
  document.getElementById("botao-fechar-janela")!.onclick = function() {
    window.janelaApi.close();
  }
  document.getElementById("botao-minimizar-janela")!.onclick = function() {
    window.janelaApi.minimizar();
  }
  document.getElementById("botao-maximizar-janela")!.onclick = function() {
    window.janelaApi.maximizar();
  }
  document.getElementById("unbotao-maximizar-janela")!.onclick = function() {
    window.janelaApi.restaurar();
  }
  document.getElementById("botao-tela-cheia")!.onclick = async function() {
    window.janelaApi.definirTelaCheia(!(await window.janelaApi.estaEmTelaCheia()));
  }
  document.getElementById("botao-alternar-maximizada")!.onclick = async function() {
    (await window.janelaApi.estaMaximizada()) ? window.janelaApi.restaurar() : window.janelaApi.maximizar();
  }

  document.getElementById("min")!.onclick = function() {
    window.janelaApi.minimizar();
  }
  document.getElementById("max")!.onclick = async function() {
    (await window.janelaApi.estaMaximizada()) ? window.janelaApi.restaurar() : window.janelaApi.maximizar();
  }
  document.getElementById("exit")!.onclick = function() {
    window.janelaApi.close();
  }

  ajustarConteudo();
}
