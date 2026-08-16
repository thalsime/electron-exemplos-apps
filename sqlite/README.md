# SQLite

Um cadastro de alunos com as quatro operações do CRUD - criar, ler, atualizar e remover - sobre
um banco SQLite de verdade, que sobrevive ao fechar o aplicativo.

E **sem instalar nada**: o módulo `node:sqlite` já vem no Node embutido no Electron. Este
exemplo mantém a marca do acervo de não ter nenhuma dependência npm própria.

## O que este exemplo demonstra

- `node:sqlite` com `DatabaseSync` e `prepare`, o SQLite que acompanha o Node
- As quatro operações: `SELECT`, `INSERT`, `UPDATE` e `DELETE`
- **Comandos preparados** com `?`, que separam comando de dado e fecham a porta para injeção
- `app.getPath('userData')`, a pasta certa para guardar dados do usuário
- Uma ponte que expõe **verbos, não SQL**: a página nunca manda um comando pronto
- A conversão explícita entre o que o banco devolve e o tipo que o código promete

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

Na primeira execução, o banco é criado e recebe três alunos de exemplo.

## Roteiro de teste

1. A tabela abre com três registros. Isso é o `SELECT`.
2. Preencha nome, curso e nota e clique em **Salvar**. O aviso mostra o id que o banco
   atribuiu - o `INSERT`.
3. Clique em **Editar** numa linha, mude a nota e salve. Agora foi `UPDATE`, no mesmo botão.
4. Clique em **Remover**. `DELETE`.
5. **Feche o aplicativo e abra de novo.** Tudo que você fez continua lá.

O caminho do arquivo aparece no terminal ao iniciar:

```
Banco em /Users/<voce>/Library/Application Support/sqlite/alunos.db
```

## Pontos de atenção

**O banco não fica na pasta do projeto, e isso é de propósito.** Ele vai para
`app.getPath('userData')`, o diretório que o sistema reserva para os dados deste aplicativo -
`~/Library/Application Support/` no macOS, `%APPDATA%` no Windows, `~/.config/` no Linux.
Guardar dentro da pasta do código seria cômodo em desenvolvimento e quebraria em produção, onde
o aplicativo costuma estar num diretório somente leitura. E arquivo de banco **nunca** se
versiona: ele é estado do usuário, não código. O `.gitignore` deste exemplo cobre isso.

**Todo o SQL fica no processo principal.** A ponte expõe `listar`, `inserir`, `atualizar` e
`remover` - quatro verbos, nenhum deles aceitando um comando. Se a página pudesse mandar SQL
pronto, a fronteira não existiria de fato: qualquer script no renderizador poderia apagar a
tabela. É a mesma disciplina do exemplo `cookies`, aplicada a banco de dados.

**`prepare` com `?` não é preciosismo.** Montar o comando concatenando texto quebra no primeiro
nome com apóstrofo - "D'Ávila" já basta - e abre a porta para injeção de SQL. O comando
preparado manda a estrutura e os dados por caminhos separados, e o banco nunca interpreta o
dado como comando.

**O compilador recusa converter a linha do banco direto para o tipo.** `all()` devolve
`Record<string, SQLOutputValue>[]`, e o TypeScript não aceita transformar isso em `Aluno[]` com
um `as`. Ele está certo: SQL é texto, e nada garante que a consulta trouxe aquelas colunas. Por
isso existe a função `paraAluno`, que converte campo a campo - é a fronteira onde o dado não
tipado do banco vira o tipo que o resto do código promete.

**Este `node:sqlite` é síncrono, e no processo principal isso importa.** `DatabaseSync` bloqueia
enquanto executa. Para consultas pequenas como as daqui é o mais simples e o mais rápido; numa
consulta pesada, o processo principal travaria - e com ele todas as janelas. É a mesma razão
pela qual não se lê arquivo grande com `readFileSync` no `main.ts`.

**O bundler não atrapalhou, mas quase.** O módulo `sqlite` não aparece em
`module.builtinModules` do Node, porque só existe sob o prefixo `node:`. Ferramentas que decidem
"é módulo nativo?" consultando aquela lista podem tentar empacotá-lo e quebrar o build. Aqui o
`vite-plugin-electron` acertou sozinho - o `require("node:sqlite")` ficou no arquivo gerado, sem
tentativa de empacotar. Se algum dia falhar, a correção é uma linha no `vite.config.mts`:
`build: { rollupOptions: { external: ['node:sqlite'] } }`.

## O mesmo CRUD em Postgres

O `main.ts` traz, **comentado**, o equivalente com Postgres. Ele não roda e não instala nada -
está lá para comparação, porque a diferença é menor do que costuma parecer.

O SQLite é um arquivo aberto direto pelo processo. O Postgres é um servidor: exige endereço,
credenciais, conexão de rede e a biblioteca `pg` como dependência. Mas o SQL é praticamente o
mesmo, e a arquitetura não muda - as consultas continuam no processo principal, e o renderizador
continua pedindo por IPC.

Três diferenças aparecem no código: tudo vira assíncrono, os marcadores mudam de `?` para `$1`,
e recuperar o id gerado exige `RETURNING id` em vez de `lastInsertRowid`. O que não muda é o
mais importante: preparar o comando em vez de concatenar texto.

## Diferenças de plataforma

Nenhuma no comportamento. O que muda é o caminho de `app.getPath('userData')`, que segue a
convenção de cada sistema.
