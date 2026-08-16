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

O acervo tem **30** exemplos. Os dois primeiros são a base de todos os outros; os demais estão
em ordem alfabética.

| Exemplo | Assunto |
|---|---|
| [`ola-mundo`](ola-mundo/) | o aplicativo mínimo: uma janela e uma página |
| [`ola-mundo-objeto-compartilhado`](ola-mundo-objeto-compartilhado/) | preload, `contextBridge` e IPC |
| [`bandeja`](bandeja/) | ícone e menu na bandeja do sistema |
| [`bloco-de-notas`](bloco-de-notas/) | notas em SQLite, com corretor, menus e PDF |
| [`bloqueio-de-suspensao`](bloqueio-de-suspensao/) | impedir que o computador durma |
| [`camera`](camera/) | captura de vídeo com `getUserMedia` |
| [`captura-de-tela`](captura-de-tela/) | gravar a tela com `getDisplayMedia` |
| [`certificado-cliente`](certificado-cliente/) | autenticação TLS com certificado |
| [`codificador-mp3`](codificador-mp3/) | executar um programa externo com `spawn` |
| [`comunicacao-entre-janelas`](comunicacao-entre-janelas/) | duas janelas conversando pelo processo principal |
| [`compactador-de-pasta`](compactador-de-pasta/) | rodar o `tar` e ver a saída em tempo real |
| [`console-e-registros`](console-e-registros/) | onde cada mensagem de console aparece |
| [`cookies`](cookies/) | ler, gravar e remover cookies da sessão |
| [`corretor-ortografico`](corretor-ortografico/) | corretor nativo e sugestões no menu |
| [`explorador-de-arquivos`](explorador-de-arquivos/) | navegar pelo sistema de arquivos |
| [`gravador-de-tela`](gravador-de-tela/) | gravar a tela ou a câmera e salvar o vídeo |
| [`icone-do-aplicativo`](icone-do-aplicativo/) | trocar o ícone padrão, com contador e variantes |
| [`impressao`](impressao/) | imprimir e gerar PDF |
| [`janela-sem-moldura`](janela-sem-moldura/) | janela sem barra de título, com controles próprios |
| [`menus`](menus/) | menu de aplicação e menus de contexto |
| [`mini-editor-de-codigo`](mini-editor-de-codigo/) | editor com destaque de sintaxe e arquivos |
| [`navegador-com-sessao`](navegador-com-sessao/) | `<webview>`, cookies, Service Worker e relatório de falha |
| [`notificacoes`](notificacoes/) | notificações do sistema operacional |
| [`painel-flutuante`](painel-flutuante/) | painel sem moldura, sempre no topo, comandando outra janela |
| [`relatorio-de-falha`](relatorio-de-falha/) | `crashReporter` e relatório de falha |
| [`service-worker/resposta-simulada`](service-worker/resposta-simulada/) | interceptar requisições com Service Worker |
| [`sqlite`](sqlite/) | CRUD local com `node:sqlite`, sem dependência |
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
    |-- ponte.d.ts      o contrato da ponte, quando ela existe
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

## Convenções de tipagem

Os 30 exemplos compilam sob `strict`, e ainda assim o IPC do Electron é um buraco no sistema
de tipos. As declarações do próprio pacote dizem:

```ts
ipcMain.handle(channel: string, listener: (event, ...args: any[]) => (Promise<any>) | (any))
ipcRenderer.invoke(channel: string, ...args: any[]): Promise<any>
contextBridge.exposeInMainWorld(apiKey: string, api: any): void
```

Ou seja: tudo que atravessa o IPC chega como `any`, e o objeto entregue ao `contextBridge`
não é conferido contra coisa nenhuma. Não porque alguém escreveu `any` - não há um único no
acervo - mas porque a API é assim. As regras abaixo existem para reconstruir o tipo
exatamente na fronteira onde ele se perde.

**O que se anota**

1. **O retorno de toda função nomeada de topo**, inclusive os handlers de `ipcMain.handle` e
   `ipcMain.on`. O retorno do handler é o que o outro processo vai receber.
2. **O contrato da ponte**, numa interface nomeada em `src/ponte.d.ts`, que também declara o
   `window`. O `preload.ts` importa esse tipo e o aplica ao objeto antes de expô-lo; o
   renderizador só usa `window.<api>`. Escrever a forma duas vezes - uma no preload, outra
   num `declare global` - produz duas descrições que o compilador nunca compara entre si.
3. **Todo payload estruturado de IPC**, numa interface declarada onde o dado é produzido, em
   geral o `main.ts`, e importada pelos dois lados com `import type`. O nome do canal é uma
   string que o compilador não confere; o tipo compartilhado é o único vínculo real.
4. **Valor cuja inferência é mais larga que o uso**: uma união como `'a' | 'b'` que o outro
   lado receberia como `string`, ou uma coleção iniciada vazia. `string` aceita o erro de
   digitação que a união recusa.
5. **`import type` na importação usada só como tipo.** Deixa explícito que aquela linha
   desaparece na compilação e não cria dependência em tempo de execução.
6. Tipo mesmo desconhecido vira `unknown`, com estreitamento antes do uso. `any` não entra.

**O que não se anota**

1. Inicialização literal óbvia: `const limite = 5` não melhora com `: number`.
2. Parâmetro já tipado pelo contexto - inclusive o `event` dos handlers, que o Electron tipa.
   São os `...args` que ele deixa em aberto.
3. Genérico, utility type ou tipo condicional além do que as regras acima exigem.
4. Renomear, refatorar ou reorganizar a pretexto de tipagem.
5. Trocar `!` ou `as` por verificação em tempo de execução: isso é mudança de lógica.

A regra de bolso: anotação que não muda o tipo inferido **e** não comunica um contrato a quem
lê é ruído, e não entra.

**De onde vêm estas regras.** O TypeScript Handbook recomenda o oposto do excesso - "try
using fewer type annotations than you think" - e trata o retorno explícito como opcional; o
Google TypeScript Style Guide diz que anotar retorno "is up to the code author". Do outro
lado, a regra `explicit-function-return-type` do typescript-eslint exige em toda função. Este
acervo fica no meio, na posição da regra `explicit-module-boundary-types`: anotar **na
fronteira** - e o handler de IPC e a ponte do `contextBridge` são exatamente isso. O padrão
do `declare global` vem da página Context Isolation do Electron; o tutorial de IPC, esse, não
menciona tipagem em ponto algum.

Nomes de tipos seguem as convenções de tradução acima - português, ASCII puro - em
PascalCase. O nome do tipo da ponte deriva da chave já exposta, sem renomeá-la: `apiNotas`
vira `ApiNotas`.

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
