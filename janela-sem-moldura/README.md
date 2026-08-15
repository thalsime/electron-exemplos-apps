# Janela sem moldura

Cria a janela com `frame: false` e deixa a página desenhar a própria barra de título - em
cima, embaixo, à esquerda ou à direita, à escolha.

## O que este exemplo demonstra

- `frame: false`, que remove a moldura desenhada pelo sistema operacional
- A propriedade CSS `-webkit-app-region`, que define quais áreas arrastam a janela
- Controle da janela **por IPC**: fechar, minimizar, maximizar, restaurar e alternar tela
  cheia, cada operação em um canal próprio
- Barras de título construídas em tempo de execução pelo próprio renderizador

## Pré-requisitos

- Node.js 24 ou superior

## Como executar

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Marque as caixas para acrescentar barras de título. Só as barras arrastam a janela: o resto
da área é conteúdo comum, e é essa a distinção que o exemplo existe para mostrar.

## Pontos de atenção

**Sem moldura, a janela não se move sozinha.** Quem informa ao sistema qual região é
"arrastável" é a propriedade `-webkit-app-region: drag`, aplicada às barras. O padrão de uma
janela sem moldura é **não** arrastar em lugar nenhum - por isso, esquecer essa propriedade
resulta numa janela que não pode ser reposicionada.

**Cada controle de janela é um canal de IPC.** O exemplo original chamava
`remote.BrowserWindow.getFocusedWindow()` de dentro da página e operava a janela direto.
Sem o módulo `remote`, a janela é descoberta no processo principal a partir do `webContents`
que originou a chamada - o que dá o mesmo alvo, sem expor a API à página.

**As duas consultas de estado viraram assíncronas.** `estaEmTelaCheia` e `estaMaximizada`
eram leituras síncronas com o `remote`; hoje são promessas, e por isso os botões que dependem
delas usam `await`.

**As imagens ficam em `public/`.** Elas são referenciadas por string montada em tempo de
execução, e o Vite não enxerga referência dinâmica: em `src/`, não entrariam no build.
