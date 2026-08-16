[Português (Brasil)](README.md) | **English**

# Electron Sample Apps

Twenty sample applications demonstrating the
[Electron APIs](https://www.electronjs.org/docs/latest/api/app), one topic each. All of them in
Portuguese, written in TypeScript on Vite, running on current Electron.

This is a teaching fork of
[hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps), prepared for
students of a Brazilian technical course in systems development. The original 2017 collection
was fully modernized: APIs removed from Electron were rewritten with their current
equivalents, the `remote` module gave way to preload with `contextBridge` and IPC, and the
decade-old UI libraries were replaced with plain HTML, CSS and DOM.

**Note on language:** the samples themselves - folder names, identifiers, interface text and
per-sample READMEs - are in Brazilian Portuguese, by design. This page exists so English
readers can find their way around.

The samples originally came from [nw-sample-apps](https://github.com/zcbenz/nw-sample-apps),
[chrome-app-samples](https://github.com/GoogleChrome/chrome-app-samples) and the
[Chrome extensions samples](https://github.com/GoogleChrome/chrome-extensions-samples).

## Where to start

Start with **[`ola-mundo`](ola-mundo/)** ("hello world"). It is the smallest possible Electron
app, and its README explains the two-process architecture that every other sample builds on.
Then move to **[`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/)**, which adds
the bridge between the two processes.

## The samples

The collection has **26** samples. The first two are the foundation for all the others; the
rest are in alphabetical order.

| Sample | Topic |
|---|---|
| [`ola-mundo`](ola-mundo/) | the minimal app: one window, one page |
| [`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/) | preload, `contextBridge` and IPC |
| [`bandeja`](bandeja/) | system tray icon and menu |
| [`bloqueio-de-suspensao`](bloqueio-de-suspensao/) | keeping the computer awake |
| [`camera`](camera/) | video capture with `getUserMedia` |
| [`captura-de-tela`](captura-de-tela/) | screen capture with `getDisplayMedia` |
| [`certificado-cliente`](certificado-cliente/) | TLS client certificate authentication |
| [`codificador-mp3`](codificador-mp3/) | running an external program with `spawn` |
| [`comunicacao-entre-janelas`](comunicacao-entre-janelas/) | two windows talking through the main process |
| [`console-e-registros`](console-e-registros/) | where each console message actually shows up |
| [`cookies`](cookies/) | reading, writing and removing session cookies |
| [`corretor-ortografico`](corretor-ortografico/) | native spell checker and context-menu suggestions |
| [`explorador-de-arquivos`](explorador-de-arquivos/) | browsing the file system |
| [`icone-do-aplicativo`](icone-do-aplicativo/) | replacing the default icon, with badge and variants |
| [`impressao`](impressao/) | printing and PDF generation |
| [`janela-sem-moldura`](janela-sem-moldura/) | frameless window with custom controls |
| [`menus`](menus/) | application menu and context menus |
| [`mini-editor-de-codigo`](mini-editor-de-codigo/) | code editor with syntax highlighting and file access |
| [`notificacoes`](notificacoes/) | operating system notifications |
| [`painel-flutuante`](painel-flutuante/) | frameless always-on-top panel driving another window |
| [`relatorio-de-falha`](relatorio-de-falha/) | `crashReporter` and crash reports |
| [`service-worker/resposta-simulada`](service-worker/resposta-simulada/) | intercepting requests with a Service Worker |
| [`sqlite`](sqlite/) | local CRUD with `node:sqlite`, no dependency |
| [`telas-no-mesmo-renderizador`](telas-no-mesmo-renderizador/) | several screens in a single window, no router |
| [`webgl`](webgl/) | 3D model with WebGL and three.js |
| [`webview/navegador`](webview/navegador/) | mini browser built on the `<webview>` tag |

## How to run

The repository uses **npm workspaces**: Electron, TypeScript and Vite are declared once, at the
root, and serve every sample. Nothing needs to be installed globally, and there is no
folder-by-folder install.

```bash
# once, at the repository root
npm install

# every run, inside the sample folder
cd ola-mundo
npm run dev
```

`npm run dev` starts the Vite dev server, builds the main process and opens the window. Editing
a renderer file refreshes the window without a restart.

To produce a production build of a sample, run `npm run build` inside its folder.

> **Note:** running `electron .` directly does not work. The binary lives at the repository
> root, and only `npm` finds it by walking up the folder tree.

## Anatomy of a sample

```
<sample>/
|-- index.html          the page
|-- package.json        main points to dist-electron/main.js
|-- tsconfig.json
|-- vite.config.mts     the .mts extension marks the file as an ES module
+-- src/
    |-- main.ts         main process
    |-- preload.ts      the bridge, when the sample needs one
    +-- renderer.ts     page code
```

The three file names `main.ts`, `preload.ts` and `renderer.ts` are the vocabulary of the
official Electron documentation, and were deliberately **not** translated.

## Requirements

- Node.js 24 or later
- macOS, Windows or Linux. **The collection has only been validated on macOS** - two samples
  have platform limitations documented in their own READMEs

## License

`electron-sample-apps` is published under the Apache v2 license. See the `LICENSE` file for
details. This fork preserves the license and the credits of the original project.

## Donation

Credit for this work belongs to the author of the original repository. If the project was
useful to you, consider buying them a coffee:

[![paypal](https://img.shields.io/badge/donate-paypal-brightgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZVNVLSK6P6JRG)
