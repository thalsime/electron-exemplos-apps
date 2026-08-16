# Mini editor de código

Um editor de texto com destaque de sintaxe, que abre e salva arquivos do disco. É o exemplo
mais completo do acervo: o único que junta biblioteca de terceiros, sistema de arquivos, menu
de aplicação, menu de contexto e área de transferência no mesmo aplicativo.

## O que este exemplo demonstra

- Uma **biblioteca de terceiros** integrada ao Electron - aqui o CodeMirror 5
- Leitura e escrita de arquivos com `fs`, sempre no processo principal
- `dialog.showOpenDialog` e `dialog.showSaveDialog`, os seletores de arquivo do sistema
- Menu de aplicação com aceleradores, mandando comandos para a página por IPC
- Menu de contexto montado sob demanda, com itens habilitados conforme a seleção
- `clipboard`, a área de transferência do Electron, exposta pelo preload
- Várias janelas no mesmo aplicativo, criadas pelo processo principal

## Pré-requisitos

- Node.js 24 ou superior

## Como executar

As dependências ficam na raiz do repositório, que usa npm workspaces:

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Para gerar o build de produção:

```bash
npm run build
```

Na janela: os quatro botões no topo (Novo, Abrir, Salvar, Salvar como), o editor no meio, e
embaixo o nome do arquivo e o modo de sintaxe em uso. As mesmas ações estão no menu Arquivo,
com atalhos. O botão direito sobre o editor abre Copiar, Recortar e Colar.

O modo de sintaxe é escolhido pela **extensão** do arquivo aberto: `.js`, `.json`, `.html` e
`.css` são reconhecidos; qualquer outra recai em JavaScript.

## Pontos de atenção

**O CodeMirror ficou, e é exceção deliberada.** A política do acervo manda substituir
biblioteca de terceiros por HTML, CSS e DOM nativo - foi o que aconteceu com jQuery, Backbone
e companhia nos outros exemplos. Aqui não: sem o CodeMirror não há editor de código, e o
exemplo perde o que demonstra. A cópia vendorizada vive em `public/cm/`, congelada na versão
original, e **não é traduzida** - é prosa de terceiros, sob licença própria.

**A biblioteca entra por tag `<script>`, não por `import`.** O CodeMirror 5 declara
`var CodeMirror` em script clássico, forma que só cria variável global fora de módulo ES. Por
isso os arquivos ficam em `public/`, servidos sem processamento pelo Vite, e o HTML os carrega
com `<script src>`. Como não há pacote npm envolvido, também não há tipos: a declaração mínima
que faz o TypeScript aceitar a variável global está em `src/types/globals.d.ts`, escrita à mão
e cobrindo só os métodos que este exemplo usa.

**Ler e escrever arquivo é sempre no processo principal.** O renderizador não tem `fs`, e não
deveria ter: ele pede pelo canal `editor:abrir` ou `editor:salvar` e recebe o conteúdo de
volta. O exemplo original alcançava o `fs` direto da página, pelo módulo `remote`, que foi
removido do Electron.

**O menu manda comando, não executa ação.** Clicar em Salvar no menu de aplicação não salva
nada por si: o processo principal envia `editor:comando` para a janela em foco, e o
renderizador decide o que fazer - porque é ele quem sabe o conteúdo do editor e se já existe
arquivo associado. O caminho de volta é o oposto do resto do exemplo, e usa `webContents.send`
em vez de `invoke`.

**Salvar como** é acréscimo desta versão. No exemplo original a ação não existia: o diálogo de
destino só aparecia quando o Salvar encontrava um documento ainda sem arquivo. Agora ela está
no botão e no menu, e sempre pergunta o destino.

**A janela nova vem do processo principal.** O botão Novo abria outra janela com
`window.open('file://...')`, caminho que deixou de funcionar com `contextIsolation` ligado.
Hoje o pedido vai por IPC e quem cria a janela é o Main, que mantém o conjunto delas em um
`Set`.
