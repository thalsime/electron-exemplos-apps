# Navegador

Um navegador em miniatura construído sobre a tag `<webview>`: barra de endereço, voltar e
avançar, recarregar, zoom e busca na página.

A pasta externa mantém o nome `webview`, que é o nome da tag.

## O que este exemplo demonstra

- `<webview>`, que hospeda conteúdo externo **em outro processo**
- Navegação: `goBack`, `goForward`, `reload`, `stop`, `getURL`, `canGoBack`
- Zoom: `setZoomFactor` e `getZoomFactor`
- Busca na página: `findInPage`, `stopFindInPage` e o evento `found-in-page`
- Os eventos de carregamento e de falha do conteúdo hospedado
- Uma tela de erro própria, para quando o processo do conteúdo morre

## Pré-requisitos

- Node.js 24 ou superior
- Conexão com a internet: a página inicial é o GitHub

## Como executar

As dependências ficam na raiz do repositório, que usa npm workspaces:

```bash
# uma vez, na raiz do repositório
npm install

# a cada execução, nesta pasta
npm run dev
```

Digite um endereço e pressione Ir. A lupa abre a caixa de zoom; o binóculo, a de busca.

## Pontos de atenção

**Sete APIs mudaram, e o efeito disso era invisível.** O código original protegia o bloco de
zoom e busca com `typeof(webview.setZoom) == "function"`. Como o método deixou de existir, a
guarda passou a ser falsa e os dois recursos ficaram **desligados em silêncio**, com os botões
escondidos por CSS. O exemplo parecia íntegro e rodava com metade das funções inertes. A
conversão devolveu os dois:

| Antes | Agora |
|---|---|
| `setZoom(f)` | `setZoomFactor(f)` |
| `getZoom(callback)` | `getZoomFactor()`, síncrono |
| `find(texto, opções)` | `findInPage(texto, opções)` |
| `stopFinding('activate')` | `stopFindInPage('activateSelection')` |
| evento `findupdate` | evento `found-in-page`, com os dados em `event.result` |
| evento `did-get-redirect-request` | removido |
| evento `close` | `crashed` e `render-process-gone` |

**A tag `<webview>` vem desligada por padrão.** É preciso ligar `webviewTag: true` nas
`webPreferences` da janela que a hospeda. A documentação oficial desencoraja a tag em favor de
`BrowserView` e `iframe`, mas ela segue suportada - e é o que este exemplo demonstra.

**Os atalhos de teclado só respondem com o foco FORA do `<webview>`.** O conteúdo roda em
outro processo, e as teclas digitadas ali são entregues a ele, não à janela que o hospeda. É
limitação da arquitetura, presente também no exemplo original, e não regressão. Na prática o
zoom por teclado funciona mesmo assim, porque o Chromium tem atalhos próprios dentro do
webview; já o Cmd+F, que abriria a caixa de busca deste exemplo, é o único que aparenta estar
quebrado.

Capturar essas teclas exigiria interceptar `before-input-event` no processo principal e avisar
o renderizador por IPC - o que acrescentaria preload e ponte a um exemplo que hoje não precisa
de nenhum dos dois.

**Este exemplo roda inteiro no renderizador.** A API da `<webview>` é de elemento de página, e
não passa pelo processo principal. Por isso não há `preload.ts` aqui, ao contrário da maioria
dos outros.

**Os nomes de evento não foram traduzidos, mas as classes CSS sim.** `crashed` e
`render-process-gone` são eventos da API; `travou` e `morto` são as classes que o exemplo
aplica ao `body` para mostrar a tela de erro. O mesmo literal aparecia nos dois papéis no
código original, e agora eles estão distinguíveis.
