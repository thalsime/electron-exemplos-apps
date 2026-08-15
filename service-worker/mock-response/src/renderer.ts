// Registra o Service Worker e mostra na página o que foi acontecendo. Tudo aqui
// é API web padrão: o mesmo código rodaria num navegador comum.
//
// O arquivo do worker mora em `public/` e não em `src/`. O motivo é o escopo: o
// Service Worker só controla URLs abaixo do caminho em que ele próprio é
// servido, então precisa chegar ao navegador na raiz, com o nome intacto e sem
// hash de build. É o que o Vite garante para o conteúdo de `public/`.

function registrar(mensagem: string, detalhe?: unknown): void {
  const linha = document.createElement('p')
  linha.textContent = detalhe === undefined ? mensagem : `${mensagem} ${String(detalhe)}`
  document.body.appendChild(linha)
  console.log(mensagem, detalhe ?? '')
}

window.addEventListener('error', (evento) => {
  registrar('Erro:', evento.message)
})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('service-worker.js', { scope: './' })
    .then((registro) => {
      registrar('Registrado!', registro.scope)
      registrar('Recarregue a página para receber a resposta do worker.')
    })
    .catch((erro: unknown) => {
      registrar('Erro no registro:', erro)
    })
} else {
  registrar('Este ambiente não expõe navigator.serviceWorker.')
}
