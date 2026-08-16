# Impressão

Imprime um documento e gera PDF a partir dele. São duas janelas: a de **opções**, com o
formulário, e a de **prévia**, que mostra o documento que será impresso.

## O que este exemplo demonstra

- `webContents.print`, que envia para a impressora do sistema
- `webContents.printToPDF`, que devolve o PDF como `Buffer`
- `dialog.showSaveDialog`, para escolher onde gravar
- `shell.openPath`, para abrir o arquivo no aplicativo padrão do sistema
- Uma **segunda janela** criada e controlada pelo processo principal

## Pré-requisitos

- Node.js 24 ou superior
- Uma impressora configurada, para testar o botão Imprimir (o PDF funciona sem nenhuma)

## Como executar

As dependências ficam na raiz do repositório, que usa npm workspaces:

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Duas janelas abrem juntas. Na de opções, escolha orientação, tamanho e margens, e use:

| Botão | O que faz |
|---|---|
| Abrir prévia | traz de volta a janela do documento, se ela foi fechada |
| Imprimir | envia a janela de prévia para a impressora |
| Salvar como PDF | pergunta o destino e grava o PDF com as opções escolhidas |
| Ver PDF | abre o último PDF gravado no aplicativo padrão |

## Pontos de atenção

**A janela de prévia mudou de dono na conversão.** No exemplo original ela era criada pelo
**renderizador**, com `new remote.BrowserWindow(...)`, e a referência ficava numa variável da
página. Sem o módulo `remote` isso é impossível: `BrowserWindow` só existe no processo
principal. Hoje a janela nasce e vive lá, e a página apenas pede operações sobre ela por IPC.

**`print` é a única API deste acervo que ainda usa callback.** Todas as outras viraram
Promise, mas `webContents.print(opcoes, callback)` não. O `main.ts` a envolve em uma Promise
para dar ao renderizador uma interface uniforme - o que **não** significa que a API tenha
mudado.

**`shell.openPath` inverte a intuição.** Ela resolve com **string vazia** quando dá certo, e
com a mensagem de erro quando falha. Tratar o retorno como "se veio algo, deu certo" produz
exatamente o comportamento oposto do esperado. Substituiu a antiga `shell.openItem`.

**Duas opções do exemplo original não existem mais.** `marginsType`, um inteiro, deu lugar ao
objeto `margins`; e `printSelectionOnly` foi removida sem substituta, por isso o campo
correspondente saiu do formulário.

**Os valores do formulário são de dois tipos.** `A4`, `Letter`, `default`, `printableArea` são
**valores da API** e ficam em inglês; o que está traduzido é o texto exibido ao lado deles. A
orientação é caso próprio: ali o `value` também foi traduzido (`retrato`/`paisagem`), porque
quem o interpreta é o código deste exemplo, não a API.

**O documento de prévia não foi traduzido.** `public/print.html` são 38 KB de amostra de
tipografia gerada a partir de um markdown de terceiros. É o **conteúdo a imprimir**, não a
interface do exemplo, e vale para ele a mesma regra das bibliotecas vendorizadas.

**Confira o tamanho do papel do PDF gerado.** O padrão do formulário é A4, mas vale conferir:

```bash
pdfinfo documento.pdf | grep "Page size"     # esperado: 595 x 842 pts
```

Sem o `pdfinfo` instalado, no macOS: `mdls -name kMDItemPageWidth -name kMDItemPageHeight`.
