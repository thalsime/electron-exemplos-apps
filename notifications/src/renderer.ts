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

// O exemplo demonstra o disparo da notificação, não navegação: clicar nela apenas
// a dispensa. A lista mantém as notificações vivas enquanto podem ser clicadas -
// sem guardar a referência, o coletor de lixo descarta o handler e o clique deixa
// de responder depois de algum tempo.
//
// Limitação conhecida no macOS durante o desenvolvimento: o clique não chega a
// este código. O aplicativo roda sob o identificador genérico com.github.Electron,
// e quando existe mais de uma instalação do Electron na máquina o sistema entrega
// o clique a outra delas, que abre a tela de boas-vindas do Electron. Some ao
// empacotar o aplicativo com identificador próprio, e não ocorre no Windows.
const notificacoesAtivas: Notification[] = []

function dispensarAoClicar(notification: Notification): void {
  notificacoesAtivas.push(notification)

  function esquecer(): void {
    const posicao = notificacoesAtivas.indexOf(notification)
    if (posicao >= 0) {
      notificacoesAtivas.splice(posicao, 1)
    }
  }

  notification.onclick = function (evt) {
    evt.preventDefault();
    notification.close();
    esquecer();
  }

  notification.onclose = esquecer
}

function doNotify(evt: Event): void {
  const target = evt.currentTarget as HTMLElement
  if (target.id == "basic") {
    dispensarAoClicar(new Notification(options[0].title, options[0]));
  }
  else if (target.id == "image") {
    dispensarAoClicar(new Notification(options[1].title, options[1]));
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("basic")?.addEventListener("click", doNotify);
  document.getElementById("image")?.addEventListener("click", doNotify);
})
