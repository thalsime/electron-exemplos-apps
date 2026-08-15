# Cookies

Lista, filtra e remove os cookies da sessão do aplicativo, agrupados por domínio.

A pasta mantém o nome em inglês de propósito: `cookies` é o nome da API que o exemplo
demonstra (`session.cookies`), e é por ele que se procura documentação.

## O que este exemplo demonstra

- `session.cookies.get`, `set` e `remove`, todas em Promise desde as versões recentes
- **IPC com dados estruturados**: o renderizador recebe uma lista de objetos pronta, em vez
  de alcançar a sessão por conta própria
- Um preload que expõe apenas duas operações - listar e remover - em vez de entregar a API
  inteira à página

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

## Pontos de atenção

**O exemplo semeia os próprios cookies.** Uma sessão recém-criada não tem cookie nenhum, e a
tabela abriria vazia. Na inicialização o processo principal cria seis cookies de demonstração
em quatro domínios, o que torna o exemplo autocontido: dá para filtrar e remover sem precisar
navegar para lugar nenhum antes.

**A sessão vive no processo principal.** O renderizador não tem acesso a `session`, e é essa
a diferença em relação ao exemplo original, que alcançava a sessão pelo módulo `remote`. Hoje
a página pede pelo IPC e recebe apenas o que precisa: domínio, nome, caminho e o indicador de
`secure`, que é o suficiente para montar a tabela e pedir a remoção.

**A URL do cookie é remontada no processo principal.** A API de remoção exige uma URL, não os
campos soltos - e montá-la a partir de `secure`, `domain` e `path` é responsabilidade de quem
conhece a API, não da página.
