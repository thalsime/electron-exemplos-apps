# Ícone do aplicativo

Todo exemplo do acervo abre com o mesmo ícone: o átomo do Electron. Este aqui substitui o ícone
padrão pelo seu, e exercita os recursos vizinhos - distintivo com contador, troca de ícone em
execução e sobreposição na barra de tarefas.

É também o exemplo mais dependente de plataforma do acervo. Em vez de esconder o que não
funciona aqui, a página mostra a lista inteira, marcando o que está disponível e o que não está.

## O que este exemplo demonstra

- `BrowserWindow({ icon })`, o ícone da janela e da barra de tarefas
- `app.dock?.setIcon`, que troca o ícone no Dock do macOS **em execução**
- `app.setBadgeCount`, o contador portátil, e `app.dock?.setBadge`, a versão do macOS que
  aceita texto livre
- `BrowserWindow.setOverlayIcon`, o equivalente do Windows: uma imagem sobreposta ao ícone
- `nativeImage.createFromPath`, que carrega a imagem do disco
- Os três formatos - `.png`, `.icns` e `.ico` - e onde cada um é usado
- Por que o caminho do ícone muda entre desenvolvimento e produção

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

## Roteiro de teste

1. Olhe o **Dock** (macOS) ou a **barra de tarefas** (Windows e Linux). O ícone é o deste
   exemplo, e não o átomo do Electron.
2. Clique em **Somar uma pendência** três vezes. Um distintivo com o número aparece sobre o
   ícone.
3. Clique em **Limpar o contador**. O distintivo some.
4. Clique em **Trocar pelo ícone de alerta**. O ícone muda de cor sem reiniciar o aplicativo.
5. Clique em **Restaurar o original**.

**Se o Dock estiver configurado para ocultar automaticamente**, o distintivo existe mas não fica
à vista. Traga o Dock para a tela com o mouse, ou desligue a ocultação em Ajustes do Sistema,
Área de trabalho e Dock.

## Os três formatos

| Formato | Para quê | Como foi gerado |
|---|---|---|
| `icone.png` | janela e barra de tarefas no Linux; Dock do macOS em execução | desenhado em `canvas` e exportado |
| `icone.icns` | pacote do aplicativo no macOS, ao empacotar | `sips` para os dez tamanhos, depois `iconutil -c icns` |
| `icone.ico` | executável e atalhos no Windows, ao empacotar | container com seis PNGs embutidos, de 16 a 256 |

Nenhum deles exigiu dependência nova: o `sips` e o `iconutil` já vêm no macOS, e o `.ico` é um
cabeçalho simples seguido dos PNGs.

## Pontos de atenção

**No macOS, o `icon` do `BrowserWindow` é ignorado.** Lá o ícone do aplicativo vem do pacote
(`.app`), e não de uma chamada em código. Durante o desenvolvimento quem manda é o
`Electron.app` instalado no `node_modules` - por isso o Dock mostra o átomo até o
`app.dock.setIcon` rodar. No Windows e no Linux a propriedade `icon` funciona como se espera.

**`app.dock` não existe fora do macOS, e o TypeScript obriga a lidar com isso.** Ele é tipado
como `Dock | undefined`. Escrever `app.dock.setIcon(...)` não compila; é preciso
`app.dock?.setIcon(...)` ou uma verificação explícita. É um caso raro e bem-vindo de diferença
de plataforma que aparece no **código**, e não só na documentação.

**`setBadgeCount` é `@platform linux,darwin`.** No Windows ele não faz nada, e o equivalente é
`setOverlayIcon`, que exige uma imagem - não aceita um número. Um aplicativo que queira o mesmo
efeito nos três sistemas precisa dos dois caminhos, que é o que o `main.ts` faz.

**Para remover a sobreposição no Windows, passe `null`.** Não existe um `removeOverlayIcon`.

**O caminho do ícone muda entre desenvolvimento e produção.** Os arquivos ficam em `public/`,
que o Vite copia para `dist/` no build. O processo principal precisa do caminho no **disco**, e
não de uma URL, então ele resolve entre `../public` e `../dist` conforme o modo - a mesma
condição que decide se a página vem do servidor do Vite ou de um arquivo. Errar isso é uma
falha silenciosa: o aplicativo sobe, e o ícone simplesmente continua o padrão.

**O contador aceita texto no macOS.** `app.dock.setBadge('99+')` funciona, e é assim que
aplicativos mostram "muitas" pendências sem escrever um número gigante.

## Diferenças de plataforma

| Recurso | macOS | Windows | Linux |
|---|---|---|---|
| ícone da janela por `icon` | ignorado | sim | sim |
| ícone do Dock em execução | sim | não existe | não existe |
| contador sobre o ícone | sim | não | depende do ambiente |
| sobreposição na barra | não | sim | não |

**Este exemplo foi validado apenas no macOS**, como todo o acervo. Os caminhos de Windows estão
escritos e compilam, mas não foram executados.
