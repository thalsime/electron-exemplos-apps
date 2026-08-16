# Compactador de pasta

Escolha uma pasta, e veja o `tar` trabalhar **enquanto ele trabalha**. Cada linha que o programa
escreve aparece na janela na hora, e não só no fim.

É o exemplo que obriga o IPC a ser um **fluxo**, e não uma pergunta com resposta. Um processo
externo produz as duas coisas: muita saída ao longo do tempo, e um resultado no final - e cada
uma pede um formato diferente de comunicação.

| Assunto | De onde vem | O que faz aqui |
|---|---|---|
| processo externo com `spawn` | `codificador-mp3` | executa o `tar` |
| escolher pasta e revelar arquivo | `explorador-de-arquivos` | `dialog` e `shell.showItemInFolder` |
| IPC de mão dupla | `ola-mundo-objeto-compartilhado` | as linhas chegando por `webContents.send` |
| notificação | `notificacoes` | avisa quando termina |
| console e registros | `console-e-registros` | a mesma linha na janela e no terminal |

## O que este exemplo demonstra

- `child_process.spawn` com argumentos em **array**, sem passar pelo shell
- `stdout` e `stderr` como fluxos, entregues em pedaços que **não** respeitam linha
- `webContents.send` para o que chega ao longo do tempo, e `invoke`/`handle` para o resultado
- `dialog.showOpenDialog` com `openDirectory`
- `shell.showItemInFolder`, que revela o arquivo em vez de abri-lo
- `Notification` ao terminar

## Pré-requisitos

- Node.js 24 ou superior
- O comando `tar`, que já existe no macOS, no Linux e no Windows 10 em diante

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

## Roteiro de teste

1. Clique em **Escolher a pasta** e selecione uma pasta pequena.
2. Clique em **Compactar**. As linhas aparecem na área escura conforme o `tar` avança, e o
   contador sobe.
3. Olhe o **terminal** onde você iniciou o aplicativo: as mesmas linhas estão lá, com o prefixo
   `[tar]`.
4. Ao terminar, uma notificação do sistema aparece.
5. Clique em **Mostrar no Finder**. O arquivo `.tar.gz` está em Downloads, selecionado.

## Pontos de atenção

**O pedaço que chega de um fluxo não é uma linha.** É o que coube no buffer naquele instante:
costuma trazer várias linhas juntas, e pode até partir uma linha ao meio. Este exemplo já
tropeçou nisso durante o desenvolvimento - a lista inteira de arquivos aparecia como um bloco só
na tela. Separar em linhas é responsabilidade de quem recebe, e é o que a função `registrar`
faz.

**O `tar -v` escreve a lista de arquivos no `stderr`, não no `stdout`.** Isso surpreende quem
espera que `stderr` seja só para erro. No mundo Unix, `stderr` é o canal de mensagens ao
operador, e o `stdout` fica livre para o dado em si - num `tar -c` que escreve o arquivo na
saída padrão, misturar a lista ali corromperia o resultado. Por isso a lista aparece em âmbar
neste exemplo, e não em vermelho: ela não é erro.

**Os argumentos vão num array, e isso não é estilo.** `spawn('tar', ['-czvf', destino, ...])`
entrega cada argumento separado, sem passar pelo shell. Montar uma string única exigiria o shell
para interpretá-la, e aí um nome de pasta com espaço quebraria o comando - e um nome com `;`
executaria outra coisa. É a mesma disciplina do comando preparado no exemplo `sqlite`.

**O `-C` evita guardar o caminho absoluto.** Sem ele, o arquivo compactado carregaria toda a
árvore de pastas desde a raiz, e ao descompactar recriaria essa estrutura inteira. Com `-C`, o
`tar` entra na pasta-mãe antes de começar, e o arquivo guarda só o nome da pasta escolhida.

**Dois formatos de IPC no mesmo exemplo, de propósito.** As linhas vêm por `send` mais `on` -
não há como esperar por elas, elas chegam quando chegam. O resultado final vem por `invoke` mais
`handle`, e a promessa só resolve quando o processo termina. Usar só um dos dois formatos aqui
seria forçar a barra: ou a tela ficaria parada até o fim, ou o botão nunca saberia quando
reabilitar.

**O botão fica desabilitado durante a execução.** Dois `tar` sobre o mesmo destino é uma corrida
real: os dois escreveriam no mesmo arquivo ao mesmo tempo.

## Diferenças de plataforma

- O `tar` do macOS é o BSD tar, e escreve `a arquivo` para cada item. O GNU tar, comum no Linux,
  escreve só o caminho. O formato do arquivo gerado é o mesmo.
- No Windows 10 em diante existe `tar.exe` nativo. Em versões anteriores, não.
- `shell.showItemInFolder` abre o Finder no macOS, o Explorer no Windows e o gerenciador padrão
  no Linux.
- **Validado apenas no macOS**, como todo o acervo.
