// Barra de título desenhada pela própria página, já que a janela é criada com
// frame: false. Os PNGs são referenciados por string montada em tempo de execução,
// então moram em public/ - o Vite não enxerga referências dinâmicas e não as
// incluiria no build se estivessem em src/.

function fecharJanela(): void {
  window.close();
}

function atualizarImagem(image_id: string, new_image_url: string): void {
  var image = document.getElementById(image_id);
  if (image instanceof HTMLImageElement)
    image.src = new_image_url;
}

function criarImagem(image_id: string, image_url: string): HTMLImageElement {
  var image = document.createElement("img");
  image.setAttribute("id", image_id);
  image.src = image_url;
  return image;
}

function criarBotao(button_id: string, button_name: string, normal_image_url: string,
                       hover_image_url: string, click_func: () => void): HTMLDivElement {
  var button = document.createElement("div");
  button.setAttribute("class", button_name);
  var button_img = criarImagem(button_id, normal_image_url);
  button.appendChild(button_img);
  button.onmouseover = function() {
    atualizarImagem(button_id, hover_image_url);
  };
  button.onmouseout = function() {
    atualizarImagem(button_id, normal_image_url);
  };
  button.onclick = click_func;
  return button;
}

export function focarBarras(focus: boolean): void {
  var bg_color = focus ? "#3a3d3d" : "#7a7c7c";

  var titlebar = document.getElementById("barra-superior");
  if (titlebar)
    titlebar.style.backgroundColor = bg_color;
  titlebar = document.getElementById("barra-inferior");
  if (titlebar)
    titlebar.style.backgroundColor = bg_color;
  titlebar = document.getElementById("barra-esquerda");
  if (titlebar)
    titlebar.style.backgroundColor = bg_color;
  titlebar = document.getElementById("barra-direita");
  if (titlebar)
    titlebar.style.backgroundColor = bg_color;
}

export function adicionarBarra(titlebar_name: string, titlebar_icon_url: string, titlebar_text: string): void {
  var titlebar = document.createElement("div");
  titlebar.setAttribute("id", titlebar_name);
  titlebar.setAttribute("class", titlebar_name);

  var icon = document.createElement("div");
  icon.setAttribute("class", titlebar_name + "-icon");
  icon.appendChild(criarImagem(titlebar_name + "icon", titlebar_icon_url));
  titlebar.appendChild(icon);

  var title = document.createElement("div");
  title.setAttribute("class", titlebar_name + "-text");
  title.innerText = titlebar_text;
  titlebar.appendChild(title);

  var closeButton = criarBotao(titlebar_name + "-close-button",
                                 titlebar_name + "-close-button",
                                 "botao-fechar.png",
                                 "botao-fechar-destaque.png",
                                 fecharJanela);
  titlebar.appendChild(closeButton);

  var divider = document.createElement("div");
  divider.setAttribute("class", titlebar_name + "-divider");
  titlebar.appendChild(divider);

  document.body.appendChild(titlebar);
}

export function removerBarra(titlebar_name: string): void {
  var titlebar = document.getElementById(titlebar_name);
  if (titlebar)
    document.body.removeChild(titlebar);
}

export function ajustarConteudo(): void {
  var content = document.getElementById("content");
  if (!content)
    return;

  var left = 0;
  var top = 0;
  var width = window.outerWidth;
  var height = window.outerHeight;

  var titlebar = document.getElementById("barra-superior");
  if (titlebar) {
    height -= titlebar.offsetHeight;
    top += titlebar.offsetHeight;
  }
  titlebar = document.getElementById("barra-inferior");
  if (titlebar) {
    height -= titlebar.offsetHeight;
  }
  titlebar = document.getElementById("barra-esquerda");
  if (titlebar) {
    width -= titlebar.offsetWidth;
    left += titlebar.offsetWidth;
  }
  titlebar = document.getElementById("barra-direita");
  if (titlebar) {
    width -= titlebar.offsetWidth;
  }

  var contentStyle = "position: absolute; ";
  contentStyle += "left: " + left + "px; ";
  contentStyle += "top: " + top + "px; ";
  contentStyle += "width: " + width + "px; ";
  contentStyle += "height: " + height + "px; ";
  content.setAttribute("style", contentStyle);
}
