# Service Worker: resposta simulada

Um Service Worker que **intercepta a requisição da própria página** e responde no lugar da
rede. Recarregue a janela e o conteúdo muda: o que aparece não veio do servidor, veio do
worker.

É a menor demonstração possível da ideia por trás de aplicativos que funcionam offline.

## O que este exemplo demonstra

- `navigator.serviceWorker.register`, e o `scope` que ele devolve
- O ciclo de vida do worker: `install`, `activate` e `fetch`
- `event.respondWith`, que responde à requisição sem tocar a rede
- Um arquivo servido **sem passar pelo bundler**, e por que isso é obrigatório aqui

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

Na primeira abertura a janela mostra que o worker foi registrado, com o escopo dele.
**Recarregue** (Cmd+R ou Ctrl+R): agora quem responde é o worker, e a página exibe o texto que
ele devolveu.

## Pontos de atenção

**O arquivo do worker fica em `public/`, e o nome dele não pode mudar.** O escopo de um
Service Worker é o caminho em que ele **é servido**: um worker entregue em `/service-worker.js`
controla tudo abaixo de `/`. Se o arquivo passasse pelo bundler, ganharia hash no nome
(`service-worker-a1b2c3.js`), o escopo mudaria junto e o registro deixaria de cobrir a página.
`public/` é a pasta que o Vite copia sem processar - por isso ele mora ali.

**Ele continua em JavaScript, não em TypeScript.** Pelo mesmo motivo: nada em `public/` é
compilado. É o único arquivo do acervo que ficou fora da conversão para TypeScript, e de
propósito.

**O contexto de execução é outro.** Dentro do worker, `self` é o `ServiceWorkerGlobalScope` -
não há `window`, não há DOM, não há acesso à página. Ele é um intermediário entre a página e a
rede, e só isso.

**Não há Electron nenhum neste exemplo.** Service Worker é API web padrão: o `renderer.ts`
rodaria igual num navegador comum. O Electron entra apenas para hospedar a página. Por isso
não há preload nem IPC aqui.

**A pasta externa mantém o nome.** `service-worker/` é o nome da API, e é por ele que o aluno
procura documentação. O que foi traduzido é a subpasta - este exemplo é o **único subprojeto
aninhado** do acervo, e nas duas listas explícitas do repositório ele aparece pelo caminho
composto.
