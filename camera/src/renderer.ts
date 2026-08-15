import './app.css'

// Todo este exemplo cabe no renderizador, e é esse o ponto dele.
//
// `getUserMedia` é API web padrão: a mesma que qualquer página usaria num
// navegador comum. Não há preload, não há IPC e não há nada do Electron aqui -
// o que o Electron faz é apenas hospedar a página numa janela de aplicativo.
//
// A permissão é do sistema operacional, não do código: no macOS a primeira
// execução abre o diálogo de acesso à câmera, e a resposta fica gravada em
// Ajustes do Sistema. Negada uma vez, ela não é perguntada de novo - o `catch`
// abaixo é o que informa isso ao usuário.
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((transmissao) => {
    const video = document.getElementById('camera') as HTMLVideoElement
    // `srcObject` recebe o MediaStream direto, sem passar por URL. O atributo
    // `autoplay` no HTML é o que dispara a exibição assim que o fluxo chega.
    video.srcObject = transmissao
  })
  .catch(() => {
    alert('Não foi possível conectar à câmera.')
  })
