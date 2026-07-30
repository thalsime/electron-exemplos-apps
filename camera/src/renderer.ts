import './app.css'

// getUserMedia é API web padrão: roda inteiro no renderizador, sem passar pelo
// processo principal. Por isso este exemplo não tem preload nem IPC.
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    const video = document.getElementById('camera') as HTMLVideoElement
    video.srcObject = stream
  }).catch(function () {
    alert('could not connect stream')
  })
