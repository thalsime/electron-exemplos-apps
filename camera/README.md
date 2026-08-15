# Câmera

Exibe ao vivo a imagem da câmera do computador dentro de uma janela do Electron.

É o exemplo mais direto do acervo para entender uma ideia central: **nem tudo num
aplicativo Electron precisa do Electron**. A captura aqui é feita com `getUserMedia`, API web
padrão, exatamente como seria numa página aberta no navegador. O Electron só entra para
hospedar essa página numa janela de aplicativo.

## O que este exemplo demonstra

- `navigator.mediaDevices.getUserMedia`, a API de captura de áudio e vídeo da plataforma web
- Um renderizador que funciona **sem preload e sem IPC**, porque não precisa de privilégio
- O elemento `<video>` recebendo um `MediaStream` pela propriedade `srcObject`

## Pré-requisitos

- Node.js 24 ou superior
- Uma câmera disponível no computador
- Permissão de acesso à câmera concedida ao aplicativo

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

**A permissão é do sistema, não do código.** Na primeira execução o macOS abre o diálogo de
acesso à câmera. A resposta fica gravada em Ajustes do Sistema, em Privacidade e Segurança:
se você negar uma vez, o diálogo não aparece de novo, e o exemplo passa a cair direto no
`catch`. Para testar de novo, é preciso reautorizar por lá.

**A janela é criada sem nenhuma permissão extra.** O exemplo original ligava
`nodeIntegration`, embora nenhuma linha do renderizador usasse Node. Aqui vale o padrão do
acervo: `contextIsolation: true` e `nodeIntegration: false`. Vale reparar que o exemplo
funciona igual - a permissão era desnecessária desde o começo.

**Uma captura de tela não registra este exemplo.** O conteúdo de um `<video>` é desenhado
pela GPU, e ferramentas como o `screencapture` do macOS gravam a área em branco. Não é
defeito do código: para registrar a imagem, é preciso copiá-la antes para um `<canvas>`.
