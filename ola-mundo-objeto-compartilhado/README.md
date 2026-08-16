# Olá, Mundo com objeto compartilhado

Um dado nasce no processo principal e precisa aparecer na página. É o problema mais comum de
um aplicativo Electron, e este exemplo é a menor versão dele.

É o `ola-mundo` mais uma peça: a **ponte**. Se a arquitetura de dois processos ainda não está
clara, comece pelo README de lá - aqui ela é pressuposta.

## O que este exemplo demonstra

- `preload.ts`, o único arquivo que enxerga os dois lados
- `contextBridge.exposeInMainWorld`, que publica uma função em `window` sem abrir o resto
- O par `ipcMain.handle` / `ipcRenderer.invoke`, que é a forma atual de pedir um valor ao
  processo principal e receber a resposta
- Uma leitura que virou **assíncrona**, e o que isso muda no código do renderizador

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

A janela deve mostrar o título e, logo abaixo, um parágrafo com o valor que veio do
`main.ts`. Se o parágrafo não aparecer, é o canal que não fechou - veja o primeiro ponto de
atenção.

## O caminho do valor

```
main.ts                     preload.ts                    renderer.ts
global.objetoCompartilhado
  .minhaVariavel
        |                        |                             |
        |  ipcMain.handle(canal) |                             |
        +<-----------------------+  ipcRenderer.invoke(canal)  |
                                 +<----------------------------+ window.apiObjetoCompartilhado
                                                                   .obterMinhaVariavel()
```

Três nomes precisam concordar: o **canal** entre `main.ts` e `preload.ts`, e a **ponte** entre
`preload.ts` e `renderer.ts`.

## Pontos de atenção

**O compilador só protege metade disso.** A ponte é tipada - `renderer.ts` declara o formato de
`window.apiObjetoCompartilhado`, e errar o nome do método dá erro de compilação. Já o canal é
uma **string**: escrever `'objeto-compartilhado:obter-minha-variavel'` de um lado e qualquer
coisa diferente do outro compila sem reclamação alguma. O sintoma em execução é discreto - a
promessa simplesmente nunca resolve, e o parágrafo nunca aparece. Nenhum erro é impresso.

**O preload não entrega o `ipcRenderer` para a página.** Seria mais curto expor o objeto
inteiro, e é justamente o que não se deve fazer: qualquer script rodando no renderizador
poderia então falar em qualquer canal. O preload publica **uma função**, que faz **uma
chamada**. É o menor privilégio que resolve o problema.

**A leitura é assíncrona, e isso não é detalhe de implementação.** O exemplo original lia o
valor de forma síncrona, pelo módulo `remote`, e escrevia direto na página com
`document.write`. O `remote` saiu do Electron - ele fazia o renderizador manipular objetos do
processo principal como se fossem locais, escondendo a comunicação entre processos e o custo
dela. Com `invoke`, a resposta chega por promessa, e o parágrafo só pode ser criado dentro do
`then`. O código fica um pouco mais longo e a fronteira entre os processos fica visível, que é
o ponto.

**O caminho do preload aponta para o arquivo compilado.** No `main.ts` está
`path.join(__dirname, 'preload.js')`, com extensão `.js`, mesmo o fonte sendo `preload.ts`.
Quem roda é o resultado da compilação, dentro de `dist-electron/`.

**O objeto global do processo principal foi mantido.** `global.objetoCompartilhado` é o mesmo
recurso do exemplo original, e sobrevive porque o assunto aqui é o **caminho** até ele, não
onde ele mora. Num aplicativo de verdade, estado global é escolha a pensar duas vezes.
