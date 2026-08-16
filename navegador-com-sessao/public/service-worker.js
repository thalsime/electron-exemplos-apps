// Service Worker deste navegador. Ele NÃO intercepta o que a <webview> carrega:
// o conteúdo dela roda em outro processo e outra origem, fora do alcance deste
// worker. O que ele faz é servir a PÁGINA INICIAL do navegador - a tela que
// aparece antes de você digitar um endereço - sem tocar a rede.
//
// Fica em `public/` e continua em JavaScript: o escopo de um Service Worker é o
// caminho em que ele é servido, e um arquivo processado pelo bundler ganharia
// hash no nome, mudando esse caminho.

const PAGINA_INICIAL = {
  titulo: 'Início',
  mensagem: 'Esta tela foi montada pelo Service Worker, sem nenhuma requisição de rede.',
  atalhos: [
    { rotulo: 'Documentação do Electron', url: 'https://www.electronjs.org/docs/latest/' },
    { rotulo: 'MDN Web Docs', url: 'https://developer.mozilla.org/pt-BR/' },
    { rotulo: 'Exemplo que trava de propósito', url: 'chrome://crash' },
  ],
}

self.addEventListener('install', () => {
  // Assume o controle sem esperar a próxima abertura da janela.
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url)

  // Só uma rota é interceptada. Todo o resto - inclusive os arquivos da própria
  // casca - segue o caminho normal.
  if (url.pathname === '/pagina-inicial') {
    evento.respondWith(
      new Response(JSON.stringify(PAGINA_INICIAL), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
})
