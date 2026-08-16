# Notificações

Dispara notificações do sistema operacional - aquelas que aparecem no canto da tela, fora da
janela do aplicativo.

O exemplo usa a **API web de notificações**, a mesma de qualquer página, sem nenhum módulo do
Electron envolvido no renderizador. Quem traduz isso em notificação nativa é o Chromium, por
baixo.

## O que este exemplo demonstra

- `new Notification(titulo, opcoes)`, a API padrão da plataforma web
- Duas variações: só título e mensagem, ou com imagem
- Os eventos `onclick` e `onclose` de uma notificação
- Um asset (`icon.png`) importado no TypeScript e resolvido pelo Vite em tempo de build

## Pré-requisitos

- Node.js 24 ou superior
- Notificações permitidas para o aplicativo, nas preferências do sistema
- **No macOS**: assinatura de código no `Electron.app` (veja os pontos de atenção)

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

## Pontos de atenção

**No macOS, notificação exige assinatura de código.** Sem assinatura o sistema descarta a
notificação em silêncio: nenhum erro no console, nada na tela. O `Electron.app` que vem do npm
não é assinado, e a assinatura ad-hoc **se perde toda vez que o `node_modules` é reinstalado**.
Para repor:

```bash
codesign --force --deep --sign - node_modules/electron/dist/Electron.app
```

Este é o suspeito número um quando o exemplo "não faz nada".

**Clicar na notificação pode ativar outro aplicativo.** Em desenvolvimento o aplicativo roda
sob o identificador genérico `com.github.Electron`. Havendo mais de uma instalação do Electron
na máquina, o sistema pode entregar o clique à outra - que abre a tela de boas-vindas do
Electron em vez de executar o `onclick` daqui. Não é defeito do código: some ao empacotar com
identificador próprio, e não acontece no Windows.

**As notificações ficam guardadas em uma lista de propósito.** Sem manter a referência viva, o
coletor de lixo recolhe o objeto e o `onclick` para de responder depois de algum tempo - falha
intermitente e difícil de reproduzir. Cada notificação sai da lista quando é fechada.

**As chaves `title`, `body` e `icon` não são traduzidas.** Elas são o contrato do construtor
`Notification`, e não texto de interface. O que se traduz são os **valores**.

**A imagem só aparece no macOS.** Windows e Linux ignoram a opção `icon` neste formato de
notificação.
