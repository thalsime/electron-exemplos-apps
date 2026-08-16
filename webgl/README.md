# WebGL

Um modelo 3D girando dentro de uma janela sem moldura. Arraste com o mouse para girar, use a
roda para aproximar e afastar.

A pasta mantém o nome: **WebGL** é o nome da tecnologia, e é por ele que se procura
documentação.

## O que este exemplo demonstra

- WebGL rodando dentro do Electron, com a biblioteca three.js
- Uma janela **sem moldura** (`frame: false`) com botão de fechar próprio
- `requestPointerLock`, que prende o cursor durante o arraste
- `app.commandLine.appendSwitch`, para passar opções ao Chromium
- Um asset carregado **por requisição em tempo de execução**, e não por import

## Pré-requisitos

- Node.js 24 ou superior
- Uma GPU com suporte a WebGL

## Como executar

As dependências ficam na raiz do repositório, que usa npm workspaces:

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Como a janela não tem moldura, o botão de fechar é o quadradinho no canto superior direito -
desenhado pelo próprio exemplo.

## Pontos de atenção

**O Vite serve pela extensão, não pelo conteúdo.** O modelo 3D é um JSON, mas no exemplo
original tinha extensão `.js`. O servidor de desenvolvimento aplicava a ele a transformação de
JavaScript, e o arquivo chegava corrompido ao parser - erro que só aparece em execução, nunca
na compilação. Renomear para `.json` resolveu.

**O modelo é buscado em tempo de execução, então precisa de URL válida nos dois modos.** É o
que o `import ... ?url` garante: o Vite devolve o caminho certo tanto no servidor de
desenvolvimento quanto no build. Um caminho fixo escrito à mão funcionaria em um dos dois e
falharia no outro, em silêncio.

**As duas bibliotecas ficam em `public/` e entram por tag `<script>`.** O three.js r50 declara
`var THREE` e o `Detector.js` faz atribuição implícita: as duas formas só produzem variável
global em script clássico, nunca em módulo ES. E a r50 **não existe no npm** - o pacote começou
a ser publicado na r54 -, então não há como trocá-la por uma dependência. Como não há pacote,
também não há tipos: a declaração mínima que faz o TypeScript aceitar `THREE` e `Detector` está
em `src/types/globals.d.ts`, escrita à mão e cobrindo só o que este exemplo usa.

**Nada em `public/` foi traduzido.** São bibliotecas de terceiros, sob licença própria.

**Se a tela ficar preta, a suspeita é a GPU.** O Chromium mantém uma lista de placas com
defeitos conhecidos e desliga a aceleração nelas. O `main.ts` passa
`ignore-gpu-blocklist` para contornar - ao custo de menos estabilidade. O nome dessa opção
mudou de `blacklist` para `blocklist`, e `appendSwitch` a recebe **sem** os hifens iniciais.

**Uma captura de tela funciona aqui, ao contrário do exemplo da câmera.** O conteúdo é
desenhado num `<canvas>`, que o `screencapture` consegue registrar. Vídeo de câmera, que vive
numa superfície de GPU separada, sai em branco.

**O crédito da origem do código 3D permanece no fonte.** A linha que aponta para o artigo do
Opera Dev não é comentário explicativo, é atribuição.
