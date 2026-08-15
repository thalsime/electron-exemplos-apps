// Service Worker do exemplo. Fica em `public/` para ser servido na raiz, com o
// nome intacto: o escopo de um Service Worker é definido pelo caminho em que ele
// é servido, e um arquivo processado pelo bundler ganharia hash no nome.
//
// Continua em JavaScript, e não em TypeScript, porque `public/` é copiado como
// está - nada ali passa por compilação. O contexto é o do worker, não o da
// janela: `self` aqui é o ServiceWorkerGlobalScope.

console.log('Service worker iniciando.')

self.addEventListener('install', () => {
  console.log('Service worker instalado.')
})

self.addEventListener('activate', () => {
  console.log('Service worker ativado.')
})

// O ponto do exemplo: interceptar a requisição e responder sem chegar à rede.
// Por isso a página muda de conteúdo ao ser recarregada.
self.addEventListener('fetch', (event) => {
  console.log('Requisição interceptada:', event.request.url)
  event.respondWith(new Response('Hello world!'))
})
