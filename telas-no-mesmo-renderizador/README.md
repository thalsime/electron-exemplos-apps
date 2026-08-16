# Telas no mesmo renderizador

Três telas dentro de **uma única janela**, trocadas com TypeScript, HTML e CSS nativos. Não há
biblioteca de roteamento, não há segunda `BrowserWindow`, e não há preload nem IPC: o assunto
aqui é a camada de apresentação, e ela vive inteira no renderizador.

É o exemplo para responder a uma dúvida comum de quem vem da web: "preciso de um framework para
ter mais de uma tela?". Não precisa.

## O que este exemplo demonstra

- `location.hash` como estado de navegação, e o evento `hashchange` que avisa quando ele muda
- Mostrar e esconder seções alternando **uma classe CSS**, sem criar nem destruir elementos
- Os botões de voltar e avançar do histórico funcionando de graça
- Uma lista de telas tipada com `as const`, que faz o compilador recusar nome de tela inventado
- Por que o estado da tela **sobrevive** à navegação: a página nunca é recarregada

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

1. Clique em **Cadastro** e digite algo nos dois campos.
2. Vá para **Sobre** e volte para **Cadastro**. O que você digitou continua lá.
3. Use o atalho de voltar do histórico (`Cmd+[` no macOS). A tela anterior reaparece.
4. Repare no rodapé da tela **Início**: o endereço mostrado muda a cada troca.

## Pontos de atenção

**Trocar o `#` não recarrega a página, e é isso que faz o exemplo funcionar.** Um endereço como
`arquivo.html#cadastro` aponta para o mesmo documento de `arquivo.html#sobre`. O navegador não
busca nada novo: ele só dispara `hashchange` e deixa o código decidir. Se a navegação fosse por
arquivos diferentes, cada troca recarregaria tudo, e o que estava digitado se perderia.

**O estado sobrevive porque nada é destruído.** As três seções existem no documento o tempo
todo; o que muda é qual delas tem a classe `ativa`. Isso é vantagem e é armadilha: com muitas
telas pesadas, todas continuam na memória. Para este porte de aplicativo, é o melhor negócio.

**O `preventDefault()` no envio do formulário não é detalhe.** Sem ele o formulário navega de
verdade, a página recarrega e o histórico de telas some. É o mesmo cuidado de qualquer
formulário na web, mas aqui o efeito é mais visível, porque leva junto o estado que o exemplo
existe para mostrar.

**O endereço é texto livre, e o código trata isso.** Nada impede alguém de digitar
`#qualquer-coisa`. A função `ehTelaValida` é o portão que separa nome de tela conhecido de nome
inventado, e o `valor is Tela` no retorno dela é o que avisa o compilador de que, dali em
diante, o valor é seguro. Endereço desconhecido cai na tela inicial em vez de deixar a janela em
branco.

**Este mecanismo é o modo "hash" dos roteadores conhecidos.** Bibliotecas de interface oferecem
o mesmo comportamento com mais recursos - parâmetros na rota, telas aninhadas, carregamento sob
demanda. Quando o aplicativo precisar disso, a biblioteca se paga. Enquanto não precisar, são 60
linhas.

## Diferenças de plataforma

Nenhuma. O exemplo usa apenas API do navegador, e se comporta igual no macOS, no Windows e no
Linux. Só os atalhos de voltar e avançar do histórico mudam de tecla conforme o sistema.
