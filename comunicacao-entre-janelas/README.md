# Comunicação entre janelas

Duas janelas abertas ao mesmo tempo, cada uma com um campo de texto. O que você escreve numa
aparece na outra - e **nunca** na que enviou.

O ponto do exemplo está no que não acontece: as duas janelas não se falam. Cada mensagem sobe
para o processo principal, que decide o destino e reenvia. Não existe caminho direto entre dois
renderizadores.

## O que este exemplo demonstra

- Duas `BrowserWindow` criadas pelo mesmo `main.ts`, com **o mesmo preload e a mesma página**
- `ipcRenderer.send` e `ipcMain.on`, o par para quando **não há resposta a esperar** - diferente
  do `invoke` e `handle` usados quando se quer um valor de volta
- `webContents.send`, o sentido inverso: do processo principal para uma janela específica
- `BrowserWindow.fromWebContents`, que responde "quem me mandou isso?" e evita devolver a
  mensagem ao remetente
- Um papel entregue pela consulta do endereço (`?papel=azul`), que faz a mesma página se
  comportar de dois jeitos

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

Duas janelas abrem lado a lado: uma azul e uma verde.

## Roteiro de teste

1. Na janela **azul**, escreva algo e tecle Enter.
2. Olhe a janela **verde**: a mensagem chegou, marcada com a origem.
3. Olhe de volta a janela azul: lá consta "Você enviou", em cinza. Ela registrou o próprio
   envio, e não recebeu nada de volta.
4. Responda pela janela verde. O caminho é o mesmo, no sentido contrário.
5. Feche a janela verde e envie de novo pela azul. Nada acontece, e nada quebra - o processo
   principal percorre as janelas que ainda existem.

## O caminho da mensagem

```
Janela azul                 processo principal              Janela verde
  |                                |                             |
  | ipcRenderer.send               |                             |
  +------------------------------->| ipcMain.on                  |
                                   | quem enviou?                |
                                   | BrowserWindow               |
                                   |   .fromWebContents          |
                                   |                             |
                                   | webContents.send            |
                                   +---------------------------->| ipcRenderer.on
```

## Pontos de atenção

**As janelas não se enxergam.** Cada renderizador é um processo isolado, sem referência aos
outros. O processo principal é o único que tem a lista de janelas abertas, e por isso é sempre
ele o intermediário. Isso não é burocracia do Electron: é a mesma fronteira que impede uma aba
do navegador de mexer em outra.

**Sem identificar o remetente, a mensagem volta para ele.** O `main.ts` percorre as janelas e
reenvia para todas - se não comparasse cada uma com quem enviou, o remetente receberia a própria
mensagem e a tela mostraria um eco. `BrowserWindow.fromWebContents(evento.sender)` é o que
resolve, e vale para qualquer canal que sirva mais de uma janela.

**`send` e `invoke` resolvem problemas diferentes.** O `invoke` combina com `handle` e devolve
uma promessa: use quando quiser um valor de volta. O `send` combina com `on` e não devolve nada:
use quando a resposta, se houver, vier depois e por outro caminho - que é exatamente o caso
aqui, porque a resposta vem da outra janela, quando a pessoa resolver responder.

**Um preload só, e uma página só, para as duas janelas.** Duplicar o arquivo seria o caminho
óbvio e o errado: as duas janelas fazem a mesma coisa, com papéis trocados. O papel viaja na
consulta do endereço e é lido com `URLSearchParams` - a mesma API que se usaria na web.

**O ouvinte é registrado uma vez, no carregamento.** Registrá-lo dentro de uma função chamada
várias vezes acumularia ouvintes, e a mesma mensagem apareceria duplicada, triplicada, e assim
por diante. É um vazamento silencioso e comum.

## Diferenças de plataforma

Nenhuma no comportamento. As posições fixas das janelas (`x` e `y`) supõem uma tela de tamanho
razoável; em telas muito pequenas as duas podem se sobrepor, sem prejuízo para o exemplo.
