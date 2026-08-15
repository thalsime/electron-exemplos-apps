# Captura de tela

Lista as telas e janelas disponíveis, deixa escolher uma pela miniatura e exibe a captura ao
vivo dentro do aplicativo.

## O que este exemplo demonstra

- `desktopCapturer.getSources`, que enumera telas e janelas e devolve miniaturas
- `session.setDisplayMediaRequestHandler`, o ponto em que o Electron decide **qual** fonte
  entregar quando a página pede captura
- `navigator.mediaDevices.getDisplayMedia`, que é **API web padrão** - a mesma de qualquer
  navegador

## Pré-requisitos

- Node.js 24 ou superior
- Permissão de Gravação de Tela concedida ao aplicativo (no macOS)

## Como executar

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Clique numa miniatura para começar a capturar. `Parar captura` encerra a transmissão, e
`Atualizar fontes` reconsulta a lista - útil depois de abrir uma janela nova.

## Pontos de atenção

**Este exemplo mudou de API por completo.** A versão original montava um objeto `mandatory`
não padronizado, com `chromeMediaSource: 'desktop'`, e o passava para
`navigator.webkitGetUserMedia` - função que nem existe mais. Hoje a página chama
`getDisplayMedia`, que é padrão da web, e quem escolhe a fonte é o processo principal, pelo
handler registrado na sessão. O código do renderizador ficou igual ao de uma página comum.

**`getSources` só existe no processo principal.** No exemplo antigo ele era chamado direto da
página. A migração para o processo principal não é preferência de estilo: a API deixou de ser
exposta ao renderizador.

**A permissão é do sistema.** No macOS, a primeira captura pede autorização de Gravação de
Tela em Ajustes do Sistema. Pode ser necessário reabrir o aplicativo depois de conceder.

**Uma captura de tela não registra o vídeo.** O `<video>` é desenhado pela GPU, e ferramentas
como o `screencapture` gravam a área em branco. Não é defeito do exemplo - para registrar a
imagem seria preciso copiá-la antes para um `<canvas>`.
