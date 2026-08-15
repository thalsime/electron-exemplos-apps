# Explorador de arquivos

Navega pelo sistema de arquivos: lista o conteúdo de uma pasta com ícones por tipo, mostra a
trilha do caminho atual e abre arquivos no aplicativo padrão do sistema.

## O que este exemplo demonstra

- Acesso ao disco isolado no **processo principal**: `fs.readdir` e `fs.stat` não vivem na
  página
- Um preload de superfície mínima - listar, abrir, e pouco mais
- `shell.openPath`, para entregar o arquivo ao aplicativo padrão do sistema
- `setWindowOpenHandler`, que manda links externos ao navegador em vez de abrir outra janela
  do Electron

## Pré-requisitos

- Node.js 24 ou superior

## Como executar

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Duplo clique entra na pasta ou abre o arquivo. A trilha no topo volta a qualquer nível
anterior, e os atalhos da barra lateral saltam para as pastas mais usadas.

## Pontos de atenção

**Os rótulos da barra lateral estão traduzidos, mas os caminhos não.** No disco, as pastas
pessoais do macOS se chamam `Documents`, `Pictures`, `Music` e `Movies` em inglês - o Finder
apenas as **exibe** traduzidas. Um `data-path="~/Documentos"` apontaria para uma pasta
inexistente. É um bom exemplo de por que nome de exibição e caminho real são coisas
diferentes.

**A página nunca toca no disco.** Ela pede uma pasta e recebe a lista pronta, já com o tipo
de cada item resolvido para escolher o ícone. O exemplo original alcançava o `fs` inteiro
pelo módulo `remote`; hoje isso não é possível, e o desenho ficou melhor por consequência.

**Este exemplo tinha um `node_modules/` versionado.** Três dos arquivos ali eram código do
próprio exemplo, colocados naquela pasta apenas para poderem ser importados por nome - um
truque de quando o Node não tinha alternativa boa para módulo local. Hoje são arquivos comuns
em `src/`, com import relativo.

**Nomes de arquivo entram por `textContent`.** A versão antiga montava o HTML da lista com um
template e interpolava o nome do arquivo direto. Construir os elementos pelo DOM impede que
um arquivo com caracteres de marcação no nome vire HTML.
