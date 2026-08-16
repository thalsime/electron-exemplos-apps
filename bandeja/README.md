# Bandeja

Um aplicativo que vive inteiro na **bandeja do sistema** - a área de ícones ao lado do relógio.
Nenhuma janela é exibida: só o ícone e o menu que abre ao clicar nele.

É o exemplo mais curto do acervo depois do `ola-mundo`, e o que melhor mostra que um
aplicativo Electron não precisa de janela para existir.

## O que este exemplo demonstra

- `Tray`, o ícone na bandeja, e `setToolTip`
- Um menu com os tipos disponíveis: item comum, seleção exclusiva (`radio`) e submenu
- `webContents.toggleDevTools`, para abrir as ferramentas de desenvolvimento
- Um aplicativo que **sobrevive sem janela visível**

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

**Nenhuma janela abre** - isso é o esperado. Procure o ícone na bandeja do sistema: no macOS,
na barra superior à direita; no Windows, perto do relógio. Clique nele para abrir o menu.

Para encerrar, use o item Encerrar do próprio menu. Fechar o terminal também serve, mas o item
é o caminho previsto.

## Pontos de atenção

**Este exemplo não registra `window-all-closed`, e isso é deliberado.** Nos exemplos com
janela, o acervo encerra o aplicativo quando a última fecha. Aqui seria fatal: o aplicativo
morreria antes mesmo de aparecer. Um aplicativo de bandeja precisa continuar vivo sem janela
nenhuma - é a razão de ele existir.

**Existe uma janela, e ela está escondida.** A `BrowserWindow({ show: false })` criada no
início serve a dois propósitos: manter o processo com algo a fazer e hospedar as DevTools que
o item de menu abre. Ela nunca carrega página alguma.

**O ícone não passa pelo Vite.** O `icon.png` fica na raiz do exemplo e é lido pelo processo
principal por caminho de arquivo, não importado pelo renderizador - por isso não vai para
`public/` como os assets dos outros exemplos. O `__dirname` aponta para `dist-electron/`, daí o
`..` no caminho.

**Não há renderizador neste exemplo.** Não existe `renderer.ts`, e o `index.html` está vazio.
Todo o código vive no processo principal, porque `Tray` e `Menu` são APIs dele.

**`role: 'quit'` substituiu um seletor do Objective-C.** O exemplo original usava
`selector: 'terminate:'`, que a API de menus não expõe mais. O papel nativo faz o mesmo, e
funciona nas três plataformas.
