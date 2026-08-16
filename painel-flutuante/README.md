# Painel flutuante

Um painel pequeno, sem moldura, que fica por cima de tudo e comanda a janela de conteúdo. É o
"modo apresentação": enquanto ele está ligado, a tela do computador não apaga.

Este é o primeiro exemplo **combinado** do acervo. Ele integra cinco assuntos que já existem
separados, num cenário em que cada um tem motivo para estar.

| Assunto | De onde vem | O que faz aqui |
|---|---|---|
| janela sem moldura | `janela-sem-moldura` | o painel, arrastável pela barra própria |
| bandeja | `bandeja` | mostra e oculta o painel, e reabre a janela de conteúdo |
| bloqueio de suspensão | `bloqueio-de-suspensao` | impede a tela de apagar durante a apresentação |
| ponte IPC | `ola-mundo-objeto-compartilhado` | os comandos do painel |
| duas janelas conversando | `comunicacao-entre-janelas` | o painel comanda, o conteúdo obedece |

## O que este exemplo demonstra

- `BrowserWindow({ frame: false, alwaysOnTop: true, skipTaskbar: true })`, a receita de um painel
  acessório
- `-webkit-app-region: drag`, e o `no-drag` que os botões dentro dele precisam
- `powerSaveBlocker.start('prevent-display-sleep')`, com o `stop` no caminho de volta
- `Tray` com menu que **muda conforme o estado** do aplicativo
- Duas páginas HTML no mesmo projeto Vite, declaradas em `rollupOptions.input`
- Um aplicativo que **não encerra** quando as janelas fecham, de propósito

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

Abrem duas janelas: a de conteúdo, com o slide, e o painel escuro sem moldura.

## Roteiro de teste

1. Clique em **Próximo** no painel. O slide muda **na outra janela** - o painel não mostra o
   conteúdo, só comanda.
2. Arraste o painel pela barra escura escrita "CONTROLE". Ele não tem barra de título do
   sistema: quem arrasta é o CSS.
3. Clique em **Entrar no modo apresentação**. A janela de conteúdo escurece, e o painel muda o
   texto do botão.
4. Com o modo ligado, confira no terminal que a tela não vai apagar:

   ```bash
   pmset -g assertions | grep NoDisplaySleepAssertion
   ```

   Deve aparecer uma linha com `pid <N>(Electron)`. Ao sair do modo, ela some.
5. Clique no **x** do painel para ocultá-lo, e traga-o de volta pelo ícone da bandeja.
6. **Feche as duas janelas.** O aplicativo continua vivo: o ícone segue na bandeja, e de lá dá
   para reabrir a janela de conteúdo ou encerrar.

## Pontos de atenção

**Este exemplo não registra `window-all-closed`, e contraria o resto do acervo.** Nos outros
exemplos com janela, fechar a última encerra o aplicativo. Aqui isso seria fatal: a bandeja
existe justamente para o aplicativo sobreviver sem janela, como no exemplo `bandeja`. Fechar
tudo e ver o programa continuar rodando é o comportamento correto, e não um vazamento.

**O painel não guarda estado, e manda intenção em vez de número.** Os botões enviam "avance um"
e "volte um", não "vá para o slide 3". A diferença apareceu num teste: como o IPC é assíncrono,
dois cliques rápidos usavam o mesmo estado desatualizado e o segundo se perdia. Quem sabe o
número certo é quem guarda o estado - o processo principal. É a regra geral: **o lado que tem o
estado é o lado que faz a conta.**

**Botão dentro de área arrastável precisa de `-webkit-app-region: no-drag`.** Sem isso, o clique
vira arraste e o botão nunca dispara. A barra inteira é `drag`, e o botão de fechar volta a ser
`no-drag` - é a exceção dentro da exceção.

**O identificador do bloqueio pode ser zero.** `powerSaveBlocker.start` devolveu `id 0` na
primeira chamada durante os testes deste exemplo. Escrever `if (idDoBloqueio)` para saber se há
bloqueio ativo daria **falso** justamente no primeiro, e o `stop` nunca seria chamado. Por isso a
comparação é com `null`. É a mesma armadilha documentada no `bloqueio-de-suspensao`.

**Duas janelas com conteúdo diferente exigem declarar as duas páginas no Vite.** Sem a lista em
`build.rollupOptions.input`, o `painel.html` não entra no build - e a falha só aparece em
produção, com a janela do painel em branco. Em desenvolvimento tudo funciona, porque o servidor
do Vite serve qualquer arquivo.

**`alwaysOnTop` é para acessório, não para aplicativo.** Uma janela principal sempre no topo
incomoda o usuário. Aqui faz sentido porque o painel é pequeno, foi pedido explicitamente e pode
ser ocultado a qualquer momento.

## Diferenças de plataforma

- `skipTaskbar` não tem efeito no macOS, onde o Dock mostra o aplicativo e não cada janela.
- O bloqueio de suspensão funciona nos três sistemas, mas só o macOS oferece o `pmset` para
  conferir. No Windows o equivalente é `powercfg /requests`.
- **Validado apenas no macOS**, como todo o acervo.
