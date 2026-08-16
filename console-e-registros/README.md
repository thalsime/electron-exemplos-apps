# Console e registros

As mesmas cinco mensagens de `console`, emitidas de três lugares diferentes do aplicativo. O
exemplo existe para responder a uma pergunta que atrapalha muita depuração em Electron: **onde
essa mensagem foi parar?**

Num aplicativo web há um console só. Aqui há dois destinos - o terminal e o DevTools - e cada
camada do aplicativo fala com um deles.

## O que este exemplo demonstra

- Os cinco níveis: `console.log`, `info`, `warn`, `error` e `debug`
- Que o `main.ts` escreve no **terminal**, e nunca no DevTools da janela
- Que o `preload.ts` escreve no **DevTools**, e não no terminal - apesar de rodar antes da
  página e ter acesso ao Node
- Que `ELECTRON_ENABLE_LOGGING=1` espelha o console do renderizador no terminal
- Que `console.debug` **desaparece** no DevTools até o nível Verbose ser ligado
- `webContents.openDevTools`, para abrir as ferramentas sem depender de atalho

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

## Roteiro de observação

Faça na ordem, com o terminal visível ao lado da janela.

**1. Antes de clicar em nada, olhe o terminal.** Já há três linhas lá:

```
[main] processo principal iniciando - esta linha nasce antes da janela
[main] app.whenReady - a partir daqui já dá para criar janela
```

A primeira foi escrita antes de a janela existir. Nenhum DevTools poderia tê-la mostrado.

**2. Clique em "Emitir no processo principal".** As cinco linhas aparecem no **terminal**,
marcadas com `[main]`. Nada aparece na janela.

**3. Abra o DevTools** pelo botão da própria página. Repare que ele já traz duas linhas de
quando a janela carregou:

```
[preload] preload carregado - roda antes do código da página
[renderizador] código da página carregado - repare que o preload veio antes
```

A ordem entre as duas não é acidente: o preload sempre roda primeiro.

**4. Clique em "Emitir no preload" e depois em "Emitir na página".** Os dois grupos aparecem no
**DevTools**, e nenhum deles no terminal.

**5. Procure o `console.debug` no DevTools.** Ele não está lá. No seletor de níveis do console
(o menu que costuma mostrar "Default levels"), ligue **Verbose** e emita de novo. Agora aparece.

**6. Feche o aplicativo e suba de novo com a variável ligada:**

```bash
ELECTRON_ENABLE_LOGGING=1 npm run dev
```

Repita os passos 2 e 4. Agora as mensagens do preload e da página **também** saem no terminal,
com um prefixo do Chromium indicando arquivo e linha de origem.

## Pontos de atenção

**O preload não escreve no terminal, e isso surpreende.** Ele roda antes da página, importa
módulos do Electron e enxerga o Node - tudo parece indicar que pertence ao processo principal.
Não pertence: o preload roda **dentro do processo do renderizador**, com privilégios maiores.
Por isso o console dele sai junto com o da página.

**`ELECTRON_ENABLE_LOGGING=1` não muda o seu código.** A variável liga um espelho interno do
Chromium, que copia o console do renderizador para o `stderr` do processo. É por isso que ela
funciona sem nenhuma alteração no aplicativo - e é exatamente esse o mecanismo que o aparato de
validação deste repositório usa para conferir um exemplo sem abrir o DevTools na mão.

**`console.debug` filtrado não é `console.debug` perdido.** O DevTools esconde o nível Verbose
por padrão. Quem não sabe disso conclui que a linha não foi executada e vai depurar o lugar
errado. No terminal, com a variável ligada, ele aparece normalmente.

**`console.error` vai para o `stderr`, não para o `stdout`.** No terminal os dois se misturam na
tela, mas são fluxos diferentes. Isso importa ao redirecionar a saída para um arquivo: um
`npm run dev > registro.txt` deixa os erros de fora, porque só captura o `stdout`.

**O renderizador não alcança o terminal por conta própria.** Ele não tem `stdout`. Quando a
página precisa registrar algo no terminal - num log de arquivo, por exemplo - o caminho é pedir
ao processo principal por IPC, que é o que o botão "Emitir no processo principal" faz.

## Diferenças de plataforma

O comportamento é o mesmo nos três sistemas. O que muda é o atalho de teclado do DevTools
(`Cmd+Option+I` no macOS, `Ctrl+Shift+I` no Windows e no Linux) - motivo pelo qual o exemplo
oferece um botão em vez de pedir o atalho.

No Windows, para ver a saída do processo principal é preciso rodar de um terminal; um
executável iniciado por duplo clique não tem console ligado.
