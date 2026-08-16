# Corretor ortográfico

Uma área de texto editável com verificação ortográfica: palavras erradas ficam sublinhadas, e
o botão direito sobre uma delas abre as sugestões.

Não há dependência nenhuma para isso. O corretor é **nativo do Electron** desde a versão 8.

## O que este exemplo demonstra

- `session.setSpellCheckerEnabled` e `setSpellCheckerLanguages`
- O evento `context-menu` do `webContents`, que já chega com a palavra errada e as sugestões
  resolvidas pelo Chromium
- `replaceMisspelling`, que troca a palavra sob o cursor
- `addWordToSpellCheckerDictionary`, para ensinar uma palavra ao dicionário do usuário
- Um recurso inteiro implementado **sem preload e sem IPC**

## Pré-requisitos

- Node.js 24 ou superior
- Conexão na primeira execução: o Electron baixa o dicionário sob demanda e o mantém em cache

## Como executar

As dependências ficam na raiz do repositório, que usa npm workspaces:

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Digite na área de texto. As palavras de exemplo já vêm escritas com erro - clique com o botão
direito em qualquer uma delas.

## Pontos de atenção

**Este exemplo não usa mais o módulo `spellchecker`.** O original dependia de um pacote nativo
que precisava ser recompilado a cada versão do Electron, com `apm` e variáveis de ambiente - e
falhava com `Module version mismatch` ao menor descuido. Nada disso existe hoje: o corretor
veio para dentro do Electron, e este foi o último exemplo do acervo com dependência npm
própria. Depois dele, **o repositório inteiro ficou sem nenhuma**.

**No macOS, `setSpellCheckerLanguages` não faz efeito.** Ali o Electron delega ao corretor do
sistema (`NSSpellChecker`) em vez de usar o Hunspell do Chromium, e a lista de idiomas é
ignorada - a própria documentação da API registra isso. No Windows e no Linux a lista é o que
manda.

**E há uma consequência incômoda disso, medida nesta base:**

- a **detecção** fica multi-idioma e funciona bem - palavras corretas em português e em inglês
  passam sem sublinhado, no mesmo texto, o que o Hunspell com um idioma só não faz;
- as **sugestões**, porém, saem do dicionário inglês. Digitar `erru` num texto em português
  sugere `err`, não `erro`.

Não é configuração faltando: `app.getLocale()`, `getPreferredSystemLanguages()` e
`getSpellCheckerLanguages()` devolvem todos `pt-BR`, e o dicionário português do sistema tem as
sugestões certas - consultado direto, o `NSSpellChecker` responde `erro, erre, erra, errou`
para `erru`. Quem não repassa é a ponte entre o Chromium e o corretor do macOS. É limitação de
plataforma, e não deve ser "consertada" no código.

**O `main.ts` imprime os idiomas pedidos e os que valeram.** As duas linhas no console existem
para tornar a diferença acima visível em vez de deixá-la como surpresa. Nesta máquina, pedir
`['pt-BR', 'en-US']` resultou em apenas `['pt-BR']`.

**As sugestões chegam prontas.** Não é preciso consultar dicionário nenhum: o evento
`context-menu` traz `misspelledWord` e `dictionarySuggestions` já resolvidos. Por isso o
recurso inteiro cabe no processo principal, sem ponte para o renderizador.
