import iconUrl from './icon.png'

// No original o caminho do ícone saía de path.join(__dirname, 'icon.png'), que
// exigia Node no renderizador. Importar o arquivo faz o Vite devolver a URL
// servida, e a opção icon da Notification aceita URL do mesmo jeito.
interface NotificationSample {
  title: string
  body: string
  icon?: string
}

const options: NotificationSample[] = [
  {
    title: "Basic Notification",
    body: "Short message part"
  },
  {
    title: "Content-Image Notification",
    body: "Short message plus a custom content image",
    icon: iconUrl
  }
]

function doNotify(evt: Event): void {
  const target = evt.currentTarget as HTMLElement
  if (target.id == "basic") {
    new Notification(options[0].title, options[0]);
  }
  else if (target.id == "image") {
    new Notification(options[1].title, options[1]);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("basic")?.addEventListener("click", doNotify);
  document.getElementById("image")?.addEventListener("click", doNotify);
})
