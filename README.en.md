[Português (Brasil)](README.md) | **English**

# Electron Sample Apps

Thirty sample applications demonstrating the
[Electron APIs](https://github.com/electron/electron/blob/v42.6.0/docs/api/app.md), one topic
each - plus five that combine several. All of them in Portuguese, written in TypeScript on
Vite, running on Electron 42.6.0.

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

These two first. They are the foundation for all the others.

| Sample | Topic |
|---|---|
| [`ola-mundo`](ola-mundo/) | the minimal app: one window, one page |
| [`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/) | preload, `contextBridge` and IPC |

The rest are grouped by **level of understanding**, from the simplest to the densest, and in
alphabetical order within each level. What moves a sample up a level is not how much code it
has: it is how much API it asks you to hold at once.

### Level 1 - a single topic, entirely inside the page

| Sample | Topic |
|---|---|
| [`camera`](camera/) | video capture with `getUserMedia` |

### Level 2 - one Electron API, small surface

| Sample | Topic |
|---|---|
| [`bandeja`](bandeja/) | system tray icon and menu |
| [`bloqueio-de-suspensao`](bloqueio-de-suspensao/) | keeping the computer awake |
| [`certificado-cliente`](certificado-cliente/) | TLS client certificate authentication |
| [`console-e-registros`](console-e-registros/) | where each console message actually shows up |
| [`notificacoes`](notificacoes/) | operating system notifications |
| [`service-worker/resposta-simulada`](service-worker/resposta-simulada/) | intercepting requests with a Service Worker |
| [`telas-no-mesmo-renderizador`](telas-no-mesmo-renderizador/) | several screens in a single window, no router |

### Level 3 - an IPC bridge with several verbs, or an external library

| Sample | Topic |
|---|---|
| [`comunicacao-entre-janelas`](comunicacao-entre-janelas/) | two windows talking through the main process |
| [`icone-do-aplicativo`](icone-do-aplicativo/) | replacing the default icon, with badge and variants |
| [`menus`](menus/) | application menu and context menus |
| [`relatorio-de-falha`](relatorio-de-falha/) | `crashReporter` and crash reports |
| [`webgl`](webgl/) | 3D model with WebGL and three.js |

### Level 4 - structured data crossing the bridge, or several APIs at once

| Sample | Topic |
|---|---|
| [`cookies`](cookies/) | reading, writing and removing session cookies |
| [`corretor-ortografico`](corretor-ortografico/) | native spell checker and context-menu suggestions |
| [`impressao`](impressao/) | printing and PDF generation |
| [`janela-sem-moldura`](janela-sem-moldura/) | frameless window with custom controls |
| [`sqlite`](sqlite/) | local CRUD with `node:sqlite`, no dependency |
| [`webview/navegador`](webview/navegador/) | mini browser built on the `<webview>` tag |

### Level 5 - work outside the browser: external process, disk, media

| Sample | Topic |
|---|---|
| [`captura-de-tela`](captura-de-tela/) | screen capture with `getDisplayMedia` |
| [`codificador-mp3`](codificador-mp3/) | running an external program with `spawn` |
| [`explorador-de-arquivos`](explorador-de-arquivos/) | browsing the file system |
| [`mini-editor-de-codigo`](mini-editor-de-codigo/) | code editor with syntax highlighting and file access |

### Combined samples

Five applications that integrate four to six topics into one coherent program. They come after
the single-topic ones: each assumes what it combines.

| Sample | Topic | Brings together |
|---|---|---|
| [`bloco-de-notas`](bloco-de-notas/) | notes in SQLite, with spell check, menus and PDF | `sqlite`, `telas-no-mesmo-renderizador`, `corretor-ortografico`, `menus`, `impressao`, files |
| [`compactador-de-pasta`](compactador-de-pasta/) | running `tar` and streaming its output live | `spawn`, file dialogs, streaming IPC, `notificacoes` |
| [`gravador-de-tela`](gravador-de-tela/) | recording the screen or camera to a file | `captura-de-tela`, `camera`, `bloqueio-de-suspensao`, `bandeja`, `icone-do-aplicativo`, files |
| [`navegador-com-sessao`](navegador-com-sessao/) | `<webview>`, cookies, Service Worker and crash reports | `webview/navegador`, `cookies`, `service-worker`, `relatorio-de-falha`, two windows |
| [`painel-flutuante`](painel-flutuante/) | frameless always-on-top panel driving another window | `janela-sem-moldura`, `bandeja`, `bloqueio-de-suspensao`, `comunicacao-entre-janelas` |

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
    |-- ponte.d.ts      the bridge contract, when there is a bridge
    +-- renderer.ts     page code
```

The three file names `main.ts`, `preload.ts` and `renderer.ts` are the vocabulary of the
official Electron documentation, and were deliberately **not** translated.

## Typing conventions

All 30 samples compile under `strict`, and even so Electron's IPC is a hole in the type
system. The package's own declarations read:

```ts
ipcMain.handle(channel: string, listener: (event, ...args: any[]) => (Promise<any>) | (any))
ipcRenderer.invoke(channel: string, ...args: any[]): Promise<any>
contextBridge.exposeInMainWorld(apiKey: string, api: any): void
```

That is: everything crossing IPC arrives as `any`, and the object handed to `contextBridge`
is checked against nothing at all. Not because anyone wrote `any` - there is not a single one
in the collection - but because that is how the API is shaped. The rules below exist to
rebuild the type exactly at the boundary where it is lost.

**What gets annotated**

1. **The return type of every named top-level function**, including `ipcMain.handle` and
   `ipcMain.on` handlers. A handler's return value is what the other process receives.
2. **The bridge contract**, as a named interface in `src/ponte.d.ts`, which also declares
   `window`. The `preload.ts` imports that type and applies it to the object before exposing
   it; the renderer just uses `window.<api>`. Writing the shape twice - once in the preload,
   once in a `declare global` - produces two descriptions the compiler never compares.
3. **Every structured IPC payload**, as an interface declared where the data is produced,
   usually `main.ts`, and imported by both sides with `import type`. A channel name is a
   string the compiler does not check; the shared type is the only real link.
4. **Values whose inferred type is wider than their use**: a union such as `'a' | 'b'` that
   the other side would receive as `string`, or a collection initialised empty. `string`
   accepts the typo that the union rejects.
5. **`import type` on imports used only as types.** It makes explicit that the line vanishes
   at compile time and creates no runtime dependency.
6. A genuinely unknown type becomes `unknown`, narrowed before use. `any` does not enter.

**What does not get annotated**

1. Obvious literal initialisation: `const limite = 5` is not improved by `: number`.
2. Parameters already typed by context - including the handlers' `event`, which Electron does
   type. It is the `...args` it leaves open.
3. Generics, utility types or conditional types beyond what the rules above require.
4. Renaming, refactoring or reorganising under the pretext of typing.
5. Replacing `!` or `as` with a runtime check: that is a change of logic, not of typing.

Rule of thumb: an annotation that neither changes the inferred type **nor** communicates a
contract to the reader is noise, and stays out.

**Where these rules come from.** The TypeScript Handbook argues against excess - "try using
fewer type annotations than you think" - and treats explicit return types as optional; the
Google TypeScript Style Guide says annotating returns "is up to the code author". On the
other side, typescript-eslint's `explicit-function-return-type` requires it on every
function. This collection sits in between, at the position of the
`explicit-module-boundary-types` rule: annotate **at the boundary** - and an IPC handler and
the `contextBridge` are exactly that. The `declare global` pattern comes from Electron's
Context Isolation page; the IPC tutorial, for its part, never mentions typing at all.

Type names follow the collection's translation conventions - Portuguese, plain ASCII - in
PascalCase. The bridge type's name derives from the key already exposed, without renaming it:
`apiNotas` becomes `ApiNotas`.

## Requirements

- Node.js 24 or later
- macOS, Windows or Linux. **The collection has only been validated on macOS.** Samples whose
  behaviour changes from one system to another carry a `Diferenças de plataforma` section in
  their own README; `notificacoes` and `corretor-ortografico` document real macOS limitations
  that should not be "fixed" in code

The stack is pinned and declared once, at the root: **Electron 42.6.0**, TypeScript 7.0.2 and
Vite 8. Links to the Electron documentation in this repository point at the **`v42.6.0` tag**
on GitHub rather than the official site: `electronjs.org` publishes only the latest release,
which over time stops matching what the collection actually uses.

## License

`electron-sample-apps` is published under the Apache v2 license. See the `LICENSE` file for
details. This fork preserves the license and the credits of the original project.

## Donation

Credit for this work belongs to the author of the original repository. If the project was
useful to you, consider buying them a coffee:

[![paypal](https://img.shields.io/badge/donate-paypal-brightgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZVNVLSK6P6JRG)
