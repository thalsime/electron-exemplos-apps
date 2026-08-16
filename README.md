**Português (Brasil)** | [English](README.en.md)

# Exemplos de aplicativos Electron

Vinte aplicativos de exemplo que demonstram as
[APIs do Electron](https://www.electronjs.org/docs/latest/api/app), um por assunto. Todos em
português, em TypeScript sobre Vite, rodando no Electron atual.

Este é um fork didático de
[hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps), preparado para
alunos do Técnico em Desenvolvimento de Sistemas. O acervo original, de 2017, foi inteiramente
modernizado: as APIs removidas do Electron foram reescritas com as equivalentes atuais, o
módulo `remote` deu lugar a preload com `contextBridge` e IPC, e as bibliotecas de interface
de uma década atrás foram substituídas por HTML, CSS e DOM nativo.

Os exemplos vieram originalmente de [nw-sample-apps](https://github.com/zcbenz/nw-sample-apps),
[chrome-app-samples](https://github.com/GoogleChrome/chrome-app-samples) e dos
[exemplos de extensões do Chrome](https://github.com/GoogleChrome/chrome-extensions-samples).

## Por onde começar

Comece pelo **[`ola-mundo`](ola-mundo/)**. Ele é o menor aplicativo Electron possível, e o
README dele explica a arquitetura de dois processos - a base para entender todos os outros.
Depois siga para o **[`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/)**, que
acrescenta a ponte entre os dois processos.

Cada pasta tem README próprio, com o que o exemplo demonstra, como executar e as armadilhas de
cada API.

## Os exemplos

O acervo tem **21** exemplos. Os dois primeiros são a base de todos os outros; os demais estão
em ordem alfabética.

| Exemplo | Assunto |
|---|---|
| [`ola-mundo`](ola-mundo/) | o aplicativo mínimo: uma janela e uma página |
| [`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/) | preload, `contextBridge` e IPC |
| [`bandeja`](bandeja/) | ícone e menu na bandeja do sistema |
| [`bloqueio-de-suspensao`](bloqueio-de-suspensao/) | impedir que o computador durma |
| [`camera`](camera/) | captura de vídeo com `getUserMedia` |
| [`captura-de-tela`](captura-de-tela/) | gravar a tela com `getDisplayMedia` |
| [`certificado-cliente`](certificado-cliente/) | autenticação TLS com certificado |
| [`codificador-mp3`](codificador-mp3/) | executar um programa externo com `spawn` |
| [`cookies`](cookies/) | ler, gravar e remover cookies da sessão |
| [`corretor-ortografico`](corretor-ortografico/) | corretor nativo e sugestões no menu |
| [`explorador-de-arquivos`](explorador-de-arquivos/) | navegar pelo sistema de arquivos |
| [`impressao`](impressao/) | imprimir e gerar PDF |
| [`janela-sem-moldura`](janela-sem-moldura/) | janela sem barra de título, com controles próprios |
| [`menus`](menus/) | menu de aplicação e menus de contexto |
| [`mini-editor-de-codigo`](mini-editor-de-codigo/) | editor com destaque de sintaxe e arquivos |
| [`notificacoes`](notificacoes/) | notificações do sistema operacional |
| [`relatorio-de-falha`](relatorio-de-falha/) | `crashReporter` e relatório de falha |
| [`service-worker/resposta-simulada`](service-worker/resposta-simulada/) | interceptar requisições com Service Worker |
| [`telas-no-mesmo-renderizador`](telas-no-mesmo-renderizador/) | várias telas numa janela só, sem roteador |
| [`webgl`](webgl/) | modelo 3D com WebGL e three.js |
| [`webview/navegador`](webview/navegador/) | navegador em miniatura com a tag `<webview>` |

## Como executar

O repositório usa **npm workspaces**: o Electron, o TypeScript e o Vite são declarados uma vez
só, na raiz, e atendem a todos os exemplos. Não é preciso instalar nada globalmente nem
instalar dependências pasta por pasta.

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, dentro da pasta do exemplo
cd ola-mundo
npm run dev
```

O `npm run dev` sobe o servidor de desenvolvimento do Vite, compila o processo principal e abre
a janela. Editar um arquivo do renderizador atualiza a janela sem reiniciar.

Para gerar a versão de produção de um exemplo, use `npm run build` dentro da pasta dele.

> **Atenção:** digitar `electron .` direto no terminal não funciona. O binário está instalado na
> raiz do repositório, e apenas o `npm` o localiza, subindo pelas pastas.

## Estrutura de um exemplo

```
<exemplo>/
|-- index.html          a página
|-- package.json        main aponta para dist-electron/main.js
|-- tsconfig.json
|-- vite.config.mts     a extensão .mts declara o arquivo como módulo ES
+-- src/
    |-- main.ts         processo principal
    |-- preload.ts      a ponte, quando o exemplo precisa de uma
    +-- renderer.ts     código da página
```

Os três nomes `main.ts`, `preload.ts` e `renderer.ts` são o vocabulário da documentação oficial
do Electron, e por isso **não foram traduzidos** - é por eles que se procura ajuda.

## Convenções de tradução

- **Pastas** foram traduzidas, exceto quando o nome é o da API demonstrada: `cookies`, `webgl`,
  `webview` e `service-worker` ficam como estão, porque é por eles que se procura documentação.
  `camera` e `menus` já são palavras portuguesas.
- **Identificadores** estão em português e em ASCII puro, sem acento nem cedilha. Isso vale
  para canais IPC, APIs expostas pelo preload, IDs do HTML e classes do CSS.
- **Não se traduzem**: palavras-chave da linguagem, APIs do runtime e de bibliotecas, campos
  exigidos por manifesto, URLs, e caminhos reais do sistema de arquivos - as pastas pessoais do
  macOS se chamam `Documents` e `Pictures` no disco, mesmo que o Finder as exiba traduzidas.
- **Bibliotecas de terceiros** não são traduzidas, nem em código nem em prosa.

## Requisitos

- Node.js 24 ou superior
- macOS, Windows ou Linux. **O acervo foi validado apenas no macOS** - dois exemplos têm
  limitações de plataforma documentadas nos READMEs deles

## Licença

O `electron-sample-apps` é publicado sob a licença Apache v2. Veja o arquivo `LICENSE` para os
detalhes. Este fork preserva a licença e os créditos do projeto original.

## Doação

Os créditos deste trabalho pertencem ao autor do repositório original. Se o projeto foi útil
para você, considere pagar um café para ele:

[![paypal](https://img.shields.io/badge/donate-paypal-brightgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZVNVLSK6P6JRG)
