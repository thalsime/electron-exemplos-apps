# Codificador MP3

Converte um arquivo `.wav` em `.mp3` chamando um **programa externo** - o codificador
`shineenc`, que acompanha o exemplo já compilado.

O assunto aqui não é áudio: é executar um processo do sistema a partir de um aplicativo
Electron, acompanhar a saída dele enquanto roda e mostrar isso na tela.

## O que este exemplo demonstra

- `child_process.spawn`, para executar um binário externo
- A leitura de `stdout` e `stderr` **em tempo real**, enviada à página por IPC enquanto o
  processo trabalha
- `webUtils.getPathForFile`, a forma atual de descobrir o caminho real de um arquivo escolhido
  em um `<input type="file">`
- Um binário que muda conforme a plataforma, selecionado em tempo de execução

## Pré-requisitos

- Node.js 24 ou superior
- macOS ou Windows - **não há binário para Linux** (veja os pontos de atenção)
- Um arquivo `.wav` para converter

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

Na janela, escolha um `.wav`, ajuste a taxa de bits se quiser e clique em Codificar. O painel
de baixo mostra a saída do codificador conforme ela acontece. O `.mp3` é gravado **ao lado do
arquivo de origem**, com o mesmo nome.

## Pontos de atenção

**O caminho do arquivo não vem do `<input type="file">`.** Por segurança, o navegador esconde
o caminho real: `input.value` devolve algo como `C:\fakepath\musica.wav`. O exemplo original
contornava isso lendo `File.path`, uma propriedade que o Electron acrescentava ao objeto - e
que **foi removida**. A substituta é `webUtils.getPathForFile`, que só existe do lado
privilegiado e por isso é chamada no `preload.ts`.

**O `spawn` roda no processo principal.** No exemplo original ele era chamado direto do
renderizador, o que só funcionava com `nodeIntegration` ligado - a página tinha acesso pleno
ao Node. Hoje a página só envia o pedido pelo canal `mp3:codificar`, e as linhas de saída
voltam pelo `mp3:registro`, uma a uma.

**A saída chega aos poucos, e é isso que o exemplo mostra.** Um codificador escreve no
`stdout` enquanto trabalha. Se o resultado só fosse enviado no `exit`, a tela ficaria parada
até o fim e o exemplo perderia a graça. Por isso cada evento `data` vira uma mensagem IPC.

**O texto do processo entra por `textContent`, nunca por `innerHTML`.** É saída de um programa
externo: tratá-la como HTML seria abrir uma porta de injeção por um caminho que ninguém
audita.

**O bit de execução se perde no zip.** Baixar o repositório como arquivo compactado, em vez de
clonar, descarta as permissões Unix - e o binário chega sem permissão de execução. O código
reaplica `chmod 755` antes de cada chamada, o que é mais barato do que descobrir a causa
quando o erro aparece.

**Não há binário para Linux.** O exemplo original trouxe apenas as versões para macOS e
Windows, e essa limitação foi preservada. Em outra plataforma o aplicativo abre normalmente e
avisa no painel que não há codificador disponível.

**O binário fica, e é exceção deliberada.** A política do acervo manda remover biblioteca de
terceiros, mas o `shineenc` não é acessório: sem ele não há processo externo para executar. Já
o que saiu foram as três bibliotecas de interface do exemplo original - jQuery, Backbone e
Underscore - mais o fonte em CoffeeScript. O formulário hoje é HTML e DOM nativo.
