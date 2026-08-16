# Navegador com sessão

Um mini-navegador que guarda a sessão, tem uma página inicial que funciona sem rede, abre
endereços em outra janela e continua de pé quando o conteúdo trava.

É o combinado mais denso do acervo: cinco assuntos que, juntos, formam o ciclo de vida de uma
página - carregar, lembrar quem você é, ter o que mostrar offline, abrir em outra janela sem
perder o vínculo, e falhar de forma diagnosticável.

| Assunto | De onde vem | O que faz aqui |
|---|---|---|
| `<webview>` | `webview/navegador` | carrega o conteúdo externo |
| cookies | `cookies` | lista e limpa a sessão acumulada |
| Service Worker | `service-worker/resposta-simulada` | monta a página inicial sem rede |
| relatório de falha | `relatorio-de-falha` | recebe o relatório quando o conteúdo trava |
| duas janelas | `comunicacao-entre-janelas` | abre em nova janela e avisa as demais |

## O que este exemplo demonstra

- `<webview>` com `goBack`, `reload`, `getURL` e os eventos de carregamento
- `render-process-gone`, o evento de quando o processo do conteúdo morre
- `session.defaultSession.cookies` para listar e remover
- Um Service Worker interceptando **uma rota** e respondendo sem tocar a rede
- Por que registrar um worker **não é o mesmo** que estar sob o controle dele
- `crashReporter` com um coletor HTTP local
- Segunda janela criada pelo processo principal, que avisa as demais

## Pré-requisitos

- Node.js 24 ou superior
- Conexão com a internet para navegar de verdade (a página inicial funciona sem)

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

1. A janela abre na **página inicial**, montada pelo Service Worker. Ela não veio da rede.
2. A tabela de **cookies** já traz dois, semeados na inicialização.
3. Digite um endereço e tecle Enter. A `<webview>` assume a área central.
4. Clique em **Atualizar** nos cookies: agora há mais, deixados pelo site visitado.
5. Clique em **Abrir em nova janela**. Uma segunda janela abre já no endereço, e a primeira
   registra um aviso - o recado passou pelo processo principal.
6. Clique em **Fazer o conteúdo travar**. A `<webview>` esmaece, a janela do navegador continua
   viva, e depois de alguns segundos o relatório aparece na tabela.

## O que fica offline, e o que não fica

**Só a página inicial.** O Service Worker registrado aqui pertence à **casca** do navegador, e
não alcança o que a `<webview>` carrega: aquele conteúdo roda em outro processo e outra origem,
fora do escopo do worker.

Dizer que este navegador "funciona offline" seria falso, e o aluno descobriria isso no primeiro
teste. O worker tem um papel honesto e menor: servir a tela de início. Para cachear o conteúdo
navegado seria preciso um worker **dentro** de cada página visitada - o que não está ao alcance
de quem hospeda a `<webview>`.

## Pontos de atenção

**Registrar um Service Worker não é estar sob o controle dele.** Na primeira visita, a página já
está carregada quando o worker ativa, e segue **sem controlador** até um recarregamento. Por
isso o exemplo `service-worker/resposta-simulada` pede para recarregar a página. Aqui o worker
chama `clients.claim()` ao ativar, e a casca espera o evento `controllerchange` antes de pedir a
rota - com um tempo limite, para não travar a tela se o controle nunca chegar. Sem esse cuidado,
o `fetch` cai na rede e volta o HTML da página, gerando um erro de JSON confuso.

**O relatório de falha não fica pronto no instante do travamento.** O Crashpad grava o despejo,
envia ao coletor, e só então ele aparece em `getUploadedReports`. Listar imediatamente devolve
vazio - o que parece defeito. Este exemplo lista duas vezes: na hora e alguns segundos depois.

**A janela sobrevive ao travamento do conteúdo.** É a razão de existir da `<webview>`: o
conteúdo externo roda em processo separado, então uma página que trava leva só a si mesma. A
barra de endereço continua funcionando, e dá para navegar para outro lugar.

**`webviewTag: true` é obrigatório.** Sem ele a tag simplesmente não existe na página, e o
sintoma é uma área vazia sem erro nenhum.

**`cookies.remove` pede a URL, não o objeto.** Ela é remontada a partir do domínio e do caminho,
e o ponto inicial de um domínio de abrangência (`.exemplo.com`) precisa sair - senão a remoção
falha em silêncio.

**Travar de propósito usa `chrome://crash`.** É um endereço interno do Chromium que derruba o
processo de renderização na hora. Serve para exercitar o caminho de falha sem escrever código
que quebre.

## Diferenças de plataforma

- O coletor de relatórios roda em `127.0.0.1:9998`. Se a porta estiver ocupada, o servidor não
  sobe e o relatório não é recebido.
- No macOS, relatórios só são enviados quando o aplicativo está assinado - a assinatura ad-hoc
  do `Electron.app` basta em desenvolvimento.
- **Validado apenas no macOS**, como todo o acervo.
