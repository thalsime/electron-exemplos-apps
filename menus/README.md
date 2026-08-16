# Menus

Duas famílias de menu no mesmo aplicativo: o **menu da aplicação**, que fica na barra do
sistema, e o **menu de contexto**, que abre com o botão direito. A janela é dividida em três
áreas, e cada uma abre um menu de contexto diferente.

A pasta mantém o nome em inglês porque `menus` já é palavra portuguesa.

## O que este exemplo demonstra

- `Menu.buildFromTemplate` e `Menu.setApplicationMenu`, o menu declarado como estrutura de dados
- `Menu` e `MenuItem` montados item a item, para o menu de contexto
- `menu.popup`, e o `callback` que avisa quando o menu fechou - inclusive **sem escolha**
- Tipos de item: comum, caixa de seleção, separador, submenu e item desabilitado
- Papéis nativos (`role`), que entregam comportamento pronto do sistema operacional
- Aceleradores (`accelerator`) com `CmdOrCtrl`, que resolve a diferença entre macOS e o resto
- Um menu que **guarda estado** entre aberturas: a fruta escolhida volta marcada

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

Na janela, clique com o botão direito em cada uma das três áreas:

| Área | Menu |
|---|---|
| primeira | item comum, caixa de seleção e submenu com quatro caixas |
| segunda | quatro frutas; a escolhida volta marcada e desabilitada, e o último item informa qual é |
| terceira | nove cores; a escolhida vira o fundo daquela área |

## Pontos de atenção

**O menu é construído no processo principal, sempre.** `Menu` e `MenuItem` são APIs do Main -
não existem no renderizador. O exemplo original alcançava as duas pelo módulo `remote`, que
foi removido do Electron. Aqui a página apenas **pede** um menu pelo canal
`menus:abrir-contexto`, informando qual dos três quer, e recebe de volta o rótulo escolhido. O
efeito visual - pintar o fundo da área, escrever o texto - acontece no renderizador, que é
quem tem o DOM.

**Um menu fechado sem escolha também precisa responder.** Clicar fora do menu, ou apertar Esc,
não dispara `click` em item nenhum. Se a promessa só resolvesse dentro de um `click`, o
renderizador ficaria esperando para sempre a cada vez que o usuário desistisse. Por isso quem
resolve é o `callback` do `popup`, que dispara em todo fechamento, devolvendo `null` quando
não houve escolha.

**`role` é comportamento pronto, e não se traduz.** `role: 'undo'`, `'about'`, `'services'`,
`'hide'`, `'unhide'` são valores da API do Electron: o sistema operacional fornece a ação, o
atalho e a integração nativa. O que se traduz é o `label`, que é o texto exibido. Trocar o
valor de `role` por uma palavra em português não renomeia nada - só quebra o item.

**O menu da aplicação no macOS tem um bloco a mais.** Ali o primeiro submenu é sempre o do
nome do aplicativo, com Sobre, Serviços, Ocultar e Encerrar. O código monta esse bloco apenas
quando `process.platform === 'darwin'`. No Windows e no Linux ele não existe, e a barra começa
direto no `menu1`.

**O estado da fruta vive no processo principal.** É lá que o menu é remontado a cada abertura,
então é lá que precisa estar a memória da escolha anterior - é o que permite marcar a fruta
atual e desabilitá-la.
