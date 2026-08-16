# Bloco de notas

Um caderno de notas que dá para usar: a lista e o editor convivem na mesma janela, as notas ficam
num banco SQLite, o texto passa pelo corretor ortográfico, e cada nota pode virar arquivo ou PDF.

É o último e mais denso exemplo do acervo, e o único que combina **seis** assuntos. Também é o
que contém a armadilha mais interessante do lote: dois padrões corretos isoladamente que brigam
quando colocados juntos.

| Assunto | De onde vem | O que faz aqui |
|---|---|---|
| banco local | `sqlite` | onde as notas vivem |
| telas na mesma janela | `telas-no-mesmo-renderizador` | lista e editor, sem abrir janela |
| corretor ortográfico | `corretor-ortografico` | sublinha e sugere no texto da nota |
| menus | `menus` | menu de aplicação e menu de contexto |
| impressão | `impressao` | salvar a nota em PDF |
| arquivos | `mini-editor-de-codigo` | exportar a nota como `.txt` |

## O que este exemplo demonstra

- `node:sqlite` guardando as notas, com as quatro operações no processo principal
- Navegação entre telas por `location.hash`, sem roteador
- `session.setSpellCheckerLanguages` e `replaceMisspelling`
- **Um único** handler de `context-menu` servindo a dois propósitos
- `editFlags`, que diz o que faz sentido oferecer no ponto clicado
- `Menu.setApplicationMenu` com atalhos, mandando comandos à página por IPC
- `printToPDF` com CSS de impressão escondendo a interface

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

## Roteiro de teste

1. A lista abre com uma nota semeada. Clique em **Abrir**.
2. Escreva um texto com erro proposital - "erru", por exemplo. A palavra é sublinhada.
3. **Clique com o botão direito sobre a palavra sublinhada.** O menu traz as sugestões do
   corretor e a opção de aprender a palavra.
4. **Clique com o botão direito num ponto sem erro.** O mesmo menu agora traz recortar, copiar,
   colar e selecionar tudo - e o que não faz sentido aparece desabilitado.
5. Clique em **Salvar**, volte para **Minhas notas** e veja a nota atualizada na lista.
6. Use **Nota > Salvar como PDF** no menu do aplicativo. O PDF sai sem a interface.
7. Feche e reabra o aplicativo: as notas continuam lá.

## A armadilha central: dois menus de contexto que brigam

Este exemplo junta dois assuntos que, no acervo, resolvem o menu de contexto de formas
**incompatíveis**:

- O `mini-editor-de-codigo` escuta o evento `contextmenu` no DOM, chama `preventDefault()` e
  pede o menu ao processo principal por IPC.
- O `corretor-ortografico` depende do evento nativo `webContents.on('context-menu')`, que traz
  `misspelledWord` e `dictionarySuggestions` já resolvidos pelo Chromium.

O problema é que os dois disputam o mesmo sinal: **suprimir o `contextmenu` do DOM impede o
evento nativo de disparar**. Juntar os dois como estão faz um calar o outro - e sem erro nenhum
no console. O sintoma é o menu de sugestões nunca aparecer, o que parece corretor quebrado.

A saída adotada aqui é **um handler nativo único**, no processo principal, que ramifica:

```
context-menu
  |
  +-- tem params.misspelledWord?  -> sugestões + "Aprender a palavra"
  |
  +-- não tem                     -> recortar / copiar / colar / selecionar tudo
                                     (habilitados conforme params.editFlags)
```

A página não intercepta `contextmenu` em lugar nenhum. Em troca, o menu de contexto deixa de ser
montado sob medida pelo renderizador - o que, neste exemplo, não faz falta.

## Pontos de atenção

**As sugestões do corretor saem em inglês no macOS.** É limitação da ponte entre o Chromium e o
`NSSpellChecker`, já documentada no exemplo `corretor-ortografico`: o dicionário do sistema tem
as sugestões certas, mas elas não chegam ao Electron. O sublinhado funciona normalmente.

**O menu de aplicação vive no processo principal, mas quem sabe o que fazer é a página.** O item
"Salvar" não tem como saber qual nota está aberta - isso é estado do renderizador. Por isso o
menu apenas **envia um comando**, e a página decide o que ele significa.

**O PDF sai da própria janela.** Não há documento separado: o `printToPDF` captura o que está na
tela, e um bloco `@media print` no CSS esconde a navegação e os botões. Sem ele, o PDF sairia
com a interface toda.

**O compilador recusa converter a linha do banco direto para `Nota`.** Mesma fronteira do
exemplo `sqlite`: a função `paraNota` converte campo a campo, e é onde `atualizada_em` vira
`atualizadaEm`.

**A lista é redesenhada inteira a cada mudança, sempre a partir do banco.** É mais simples do que
remendar cartão por cartão, e garante que a tela mostra o que está gravado.

## Diferenças de plataforma

- O menu de aplicação tem um item a mais no macOS (`role: 'appMenu'`), que é onde ficam
  "Sobre" e "Encerrar" naquela plataforma.
- O atalho aparece como `Cmd` no macOS e `Ctrl` nos demais, por causa de `CmdOrCtrl`.
- As sugestões do corretor dependem do dicionário do sistema, e variam por plataforma.
- **Validado apenas no macOS**, como todo o acervo.
