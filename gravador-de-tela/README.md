# Gravador de tela

Escolha a câmera ou uma tela, grave, e salve o vídeo em disco. Enquanto a gravação está em
curso, a tela do computador não apaga e o ícone do aplicativo mostra um distintivo.

Nada aqui é enfeite: quem grava a tela costuma **esconder a janela do gravador**, e é justamente
aí que os dois recursos se justificam - o bloqueio de suspensão porque uma gravação longa morre
se a máquina dormir, e o distintivo no ícone porque ele é o único sinal visível de que a
gravação está rolando.

| Assunto | De onde vem | O que faz aqui |
|---|---|---|
| captura de tela | `captura-de-tela` | lista telas e janelas, e entrega a fonte escolhida |
| câmera | `camera` | a outra fonte possível, por API web pura |
| bloqueio de suspensão | `bloqueio-de-suspensao` | impede a tela de apagar durante a gravação |
| bandeja | `bandeja` | inicia e para a gravação com a janela escondida |
| gravar arquivo | `explorador-de-arquivos` | `dialog` mais `fs.writeFile` |
| contador no ícone | `icone-do-aplicativo` | mostra REC enquanto grava |

## O que este exemplo demonstra

- `desktopCapturer.getSources` com miniaturas, no processo principal
- `session.setDisplayMediaRequestHandler`, que decide o que o `getDisplayMedia` devolve
- `navigator.mediaDevices.getUserMedia` para a câmera, sem passar pelo processo principal
- `MediaRecorder` juntando os pedaços no renderizador
- Um `ArrayBuffer` atravessando o IPC **uma vez**, no fim
- `app.setBadgeCount` e `app.dock?.setBadge` como indicador de estado
- Uma bandeja que **pede** à página, em vez de executar por conta própria

## Pré-requisitos

- Node.js 24 ou superior
- Permissão de câmera e de gravação de tela, pedidas pelo sistema na primeira vez

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

## Antes do primeiro teste: as permissões do macOS

Este exemplo encosta em **duas** permissões do sistema, e as duas aparecem como caixa de diálogo
na primeira tentativa:

- **Câmera**, ao clicar em "Usar a câmera".
- **Gravação de tela**, ao escolher uma fonte da lista.

A permissão de gravação de tela é amarrada ao binário exato do aplicativo. Em desenvolvimento
quem pede é o `Electron.app` do `node_modules`, e ela costuma ser pedida de novo depois de
reinstalar as dependências. Se a lista de fontes aparecer só com nomes genéricos e a imagem sair
preta, é permissão negada - e não defeito do código. Confira em Ajustes do Sistema, Privacidade
e Segurança.

## Roteiro de teste

1. Clique em **Listar telas e janelas**. As miniaturas aparecem.
2. Clique numa fonte. A prévia começa a mostrar o que está sendo capturado.
3. Clique em **Gravar**. O botão fica vermelho e pulsa, e o ícone do aplicativo ganha o
   distintivo.
4. Com a gravação em curso, confira no terminal:

   ```bash
   pmset -g assertions | grep NoDisplaySleepAssertion
   ```

5. Clique em **Parar e salvar**, escolha onde gravar, e abra o `.webm` resultante.
6. Repita usando **Usar a câmera** como fonte.
7. Feche a janela e use o ícone da bandeja para iniciar e parar - o aplicativo continua vivo.

## Pontos de atenção

**A prévia da câmera não aparece em captura de tela.** É superfície de GPU: uma foto da tela sai
com o retângulo preto, mesmo com a câmera funcionando. É armadilha conhecida deste acervo - para
conferir de verdade, olhe a tela, ou instrumente o `readyState` e o `videoWidth` da faixa. Este
exemplo foi validado assim.

**O vídeo atravessa o IPC uma vez, e não pedaço a pedaço.** O `MediaRecorder` entrega fatias
várias vezes por segundo; mandar cada uma pelo canal custaria uma cópia por fatia. As fatias
ficam no renderizador, e só o `ArrayBuffer` final viaja. Um `Blob` **não** atravessa o IPC - por
isso o `await blob.arrayBuffer()` antes de enviar.

**Parar a transmissão exige parar cada faixa.** Descartar o objeto do `MediaStream` não desliga
a câmera nem libera a captura: a luz da webcam continua acesa. É preciso
`getTracks().forEach(f => f.stop())`.

**A bandeja não grava: ela pede.** O `MediaRecorder` só existe no renderizador, então o item de
menu manda um recado para a página, que executa. É a inversão do fluxo comum - aqui o processo
principal é o remetente.

**Este exemplo não registra `window-all-closed`**, como o `painel-flutuante`. Fechar a janela no
meio de uma gravação não pode encerrar o aplicativo.

**O identificador do bloqueio pode ser zero**, e a comparação é com `null`. Mesma armadilha
documentada no `bloqueio-de-suspensao`, confirmada de novo aqui: o log registrou `id 0`.

## Diferenças de plataforma

- O distintivo no ícone é macOS e Linux. No Windows o equivalente é `setOverlayIcon`, que o
  exemplo `icone-do-aplicativo` demonstra.
- A permissão de gravação de tela do macOS não tem equivalente no Windows, onde a captura não
  pede autorização.
- **Validado apenas no macOS**, como todo o acervo.
