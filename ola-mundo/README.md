# Olá, Mundo

O menor aplicativo Electron possível: o processo principal abre uma janela e carrega uma
página HTML dentro dela. São 38 linhas de TypeScript, e mais nada.

É o ponto de partida do acervo. Todos os outros exemplos são este aqui **mais alguma coisa** -
um preload, um canal de IPC, uma API do sistema operacional. Se a estrutura desta pasta
estiver clara, o resto é acréscimo.

## O que este exemplo demonstra

- Os **dois processos** do Electron: o principal (`src/main.ts`), que roda sobre Node e é dono
  das janelas, e o renderizador (`index.html`), que roda sobre Chromium e desenha a tela
- `app.whenReady()`, o primeiro momento seguro para criar uma janela
- `BrowserWindow` e o par `contextIsolation` / `nodeIntegration`, que decide o que a página pode
- O ciclo de vida: o evento `closed` na janela e o `window-all-closed` no aplicativo

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

## Pontos de atenção

**O campo `main` aponta para um arquivo que ainda não existe.** O `package.json` declara
`dist-electron/main.js`, mas no disco só existe `src/main.ts`. Quem gera o primeiro a partir do
segundo é o `vite-plugin-electron`, no `npm run dev` ou no `npm run build`. Antes da primeira
execução aquele caminho está mesmo vazio, e isso é o esperado.

**A mesma página vem de dois lugares diferentes.** Em desenvolvimento ela é servida pelo Vite,
e o `main.ts` a carrega por `loadURL` a partir da variável `VITE_DEV_SERVER_URL` - é o que dá
recarregamento automático ao salvar. No build não há servidor: a página é um arquivo, e entra
por `loadFile`. O `if` no meio do `criarJanela` é o que escolhe entre os dois.

**A janela é criada sem nenhuma permissão extra.** `contextIsolation: true` e
`nodeIntegration: false` são o padrão de todo o acervo. Uma página estática como esta não tem
o que fazer com acesso ao Node, e conceder o que não se usa é aumentar a superfície de ataque
de graça.

**A referência da janela fica fora da função de propósito.** Se `janelaPrincipal` fosse uma
variável local de `criarJanela`, ela deixaria de existir assim que a função terminasse, e o
coletor de lixo poderia recolher o objeto com a janela ainda aberta na tela. Manter a
referência em escopo de módulo é o que impede a janela de fechar sozinha - é um tropeço
clássico de quem está começando.

**Este exemplo encerra no macOS, e a documentação oficial diz o contrário.** No padrão do
Electron, fechar a última janela no macOS não encerra o aplicativo: ele continua vivo no Dock,
e o evento `activate` recria a janela quando o ícone é clicado. Aqui não há `activate`, então
manter o processo vivo deixaria apenas um ícone inerte, sem jeito de trazer a janela de volta.
Por isso o `app.quit()` é incondicional. O exemplo `tray` faz o oposto justamente porque
precisa: ele existe para seguir funcionando sem janela nenhuma.
