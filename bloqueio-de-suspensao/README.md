# Bloqueio de suspensão

Impede o computador de dormir enquanto o aplicativo estiver rodando. Vive inteiro na bandeja
do sistema: não há janela, só um ícone com menu.

É útil para aplicativos que trabalham sem ninguém olhando - uma renderização longa, um
download, uma apresentação que não pode escurecer a tela.

## O que este exemplo demonstra

- `powerSaveBlocker`, e os dois níveis de bloqueio que ele oferece
- `Tray` com menu de opções mutuamente exclusivas (`type: 'radio'`)
- Um aplicativo **sem janela visível**, que segue vivo
- Ícones por item de menu, indicando o estado atual

## Os dois níveis de bloqueio

| Valor | Efeito |
|---|---|
| `prevent-display-sleep` | mantém a tela acesa; implica também não suspender o sistema |
| `prevent-app-suspension` | deixa a tela apagar, mas mantém o processo executando |

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

Nenhuma janela abre - procure o ícone na bandeja do sistema, ao lado do relógio. O menu tem as
duas formas de bloqueio, a opção de desativar e o item de encerrar.

## Como conferir que o bloqueio é real

A interface marca a opção escolhida, mas isso não prova nada sobre o gerenciamento de energia.
No macOS, o sistema mostra as travas ativas:

```bash
pmset -g assertions | grep -i electron
```

Com `prevent-display-sleep` ativo, aparece uma linha assim:

```
pid 34870(Electron): [0x...] 00:00:00 NoDisplaySleepAssertion named: "Electron"
```

Ao escolher Desativar, a linha some. No Windows o equivalente é `powercfg /requests`.

## Pontos de atenção

**O identificador do bloqueio pode ser zero.** `powerSaveBlocker.start()` devolve um número
sequencial, e o primeiro bloqueio de uma execução recebe **0**. O exemplo original guardava
esse valor e testava com `if (blocker_id)`, que é falso para zero - justamente o primeiro
bloqueio criado. Aqui a comparação é explícita, com `!== null`. Vale como lembrete geral: um
identificador numérico nunca deve ser testado pela veracidade.

**Um bloqueio anterior precisa ser parado antes do próximo.** Trocar de opção sem chamar
`stop()` deixaria a trava antiga ativa para sempre, sem nenhum jeito de alcançá-la depois - o
identificador teria sido perdido.

**Este exemplo não registra `window-all-closed`, de propósito.** Um aplicativo de bandeja
precisa continuar vivo sem janela; encerrar quando a última fecha o mataria imediatamente.
Quem encerra é o item Encerrar do menu. É o oposto da decisão tomada nos exemplos com janela,
como o `ola-mundo`.

**Há uma janela invisível, e ela tem função.** A `BrowserWindow({ show: false })` criada no
início existe só para segurar o processo. Ela não é guardada em variável nenhuma porque o
próprio Electron mantém a lista em `BrowserWindow.getAllWindows()`.

**Os ícones não passam pelo Vite.** Ficam em `images/` e são lidos pelo processo principal
com caminho de arquivo, não importados pelo renderizador - por isso não vão para `public/`
como os assets dos outros exemplos.
