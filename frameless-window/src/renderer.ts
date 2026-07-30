import './style.css'
import { addTitlebar, focusTitlebars, removeTitlebar, updateContentStyle } from './titlebar'

declare global {
  interface Window {
    windowApi: {
      close: () => Promise<void>
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      unmaximize: () => Promise<void>
      setFullScreen: (flag: boolean) => Promise<void>
      isFullScreen: () => Promise<boolean>
      isMaximized: () => Promise<boolean>
    }
  }
}

function updateCheckbox(): void {
  var top_checkbox = document.getElementById("top-box") as HTMLInputElement;
  var bottom_checkbox = document.getElementById("bottom-box") as HTMLInputElement;
  var left_checkbox = document.getElementById("left-box") as HTMLInputElement;
  var right_checkbox = document.getElementById("right-box") as HTMLInputElement;
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

function initCheckbox(checkboxId: string, titlebar_name: string, titlebar_icon_url: string, titlebar_text: string): void {
  var elem = document.getElementById(checkboxId);
  if (!elem)
    return;
  elem.onclick = function() {
    if ((document.getElementById(checkboxId) as HTMLInputElement).checked)
      addTitlebar(titlebar_name, titlebar_icon_url, titlebar_text);
    else
      removeTitlebar(titlebar_name);
    focusTitlebars(true);

    updateContentStyle();
    updateCheckbox();
  }
}

window.onfocus = function() {
  console.log("focus");
  focusTitlebars(true);
}

window.onblur = function() {
  console.log("blur");
  focusTitlebars(false);
}

window.onresize = function() {
  updateContentStyle();
}

window.onload = function() {
  initCheckbox("top-box", "top-titlebar", "top-titlebar.png", "Top Titlebar");
  initCheckbox("bottom-box", "bottom-titlebar", "bottom-titlebar.png", "Bottom Titlebar");
  initCheckbox("left-box", "left-titlebar", "left-titlebar.png", "Left Titlebar");
  initCheckbox("right-box", "right-titlebar", "right-titlebar.png", "Right Titlebar");

  // Cada botão fala com o processo principal pela ponte exposta no preload. As
  // duas consultas de estado eram síncronas com o remote e agora são aguardadas.
  document.getElementById("close-window-button")!.onclick = function() {
    window.windowApi.close();
  }
  document.getElementById("minimize-window-button")!.onclick = function() {
    window.windowApi.minimize();
  }
  document.getElementById("maximize-window-button")!.onclick = function() {
    window.windowApi.maximize();
  }
  document.getElementById("unmaximize-window-button")!.onclick = function() {
    window.windowApi.unmaximize();
  }
  document.getElementById("toggle-window-button")!.onclick = async function() {
    window.windowApi.setFullScreen(!(await window.windowApi.isFullScreen()));
  }
  document.getElementById("maxmin-window-button")!.onclick = async function() {
    (await window.windowApi.isMaximized()) ? window.windowApi.unmaximize() : window.windowApi.maximize();
  }

  document.getElementById("min")!.onclick = function() {
    window.windowApi.minimize();
  }
  document.getElementById("max")!.onclick = async function() {
    (await window.windowApi.isMaximized()) ? window.windowApi.unmaximize() : window.windowApi.maximize();
  }
  document.getElementById("exit")!.onclick = function() {
    window.windowApi.close();
  }

  updateContentStyle();
}
