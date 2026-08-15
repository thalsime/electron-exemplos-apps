# Relatório de falha

Provoca uma falha proposital no renderizador, captura o relatório e o envia a um servidor
coletor - que também acompanha o exemplo, rodando em `localhost`.

## O que este exemplo demonstra

- `crashReporter`, o mecanismo do Electron que captura falhas de processo
- Um **servidor coletor** embutido, que recebe o relatório e devolve um identificador
- `process.crash()` exposto pelo preload, sem ligar `nodeIntegration`
- A listagem dos relatórios já enviados, pedida pelo renderizador por IPC

## Pré-requisitos

- Node.js 24 ou superior

## Como executar

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Ao abrir, a janela informa que ainda não há relatórios. Clique em **Provocar falha**: a página
fica em branco, porque o renderizador foi derrubado de propósito. No terminal aparece a linha
`Relatório de falha recebido. ID atribuído: NNNN`. Feche e rode de novo - a tabela agora lista
a data de envio e o identificador.

## Pontos de atenção

**A falha precisa acontecer no renderizador, e não no processo principal.** Derrubar o
principal encerraria o aplicativo inteiro, e o relatório gerado seria de outro processo. Por
isso `process.crash()` é exposto pelo preload: ele roda no contexto da página, mas o preload
é quem tem acesso ao objeto `process`.

**O envio é imediato, não na próxima abertura.** O Crashpad manda o relatório ao coletor no
mesmo instante da falha; a reabertura serve apenas para a página conseguir listar o que já
foi enviado, já que o renderizador anterior morreu antes de poder consultar.

**`companyName` está depreciado.** A opção antiga virou apelido de uma entrada em
`globalExtra`, e é essa a forma usada aqui. Configurar o `crashReporter` no renderizador,
como fazia o exemplo original, também deixou de ser necessário: o que é definido no processo
principal já vale para os renderizadores que ele cria.

**Onde os relatórios ficam.** Em `~/Library/Application Support/<nome-do-app>/Crashpad`, com
`pending/` para o que ainda não subiu e `completed/` para o que já foi enviado. É o primeiro
lugar a olhar quando a tabela não preenche.
