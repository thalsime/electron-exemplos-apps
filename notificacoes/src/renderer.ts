import urlDoIcone from './icon.png';

// No original o caminho do ícone saía de path.join(__dirname, 'icon.png'), que
// exigia Node no renderizador. Importar o arquivo faz o Vite devolver a URL
// servida, e a opção icon da Notification aceita URL do mesmo jeito.
//
// As chaves title, body e icon são da API web de notificações e ficam como
// estão: são o contrato do construtor, não texto da interface.
interface ExemploDeNotificacao {
  title: string;
  body: string;
  icon?: string;
}

const EXEMPLOS: Record<'basica' | 'com-imagem', ExemploDeNotificacao> = {
  basica: {
    title: 'Notificação simples',
    body: 'Uma mensagem curta',
  },
  'com-imagem': {
    title: 'Notificação com imagem',
    body: 'Mensagem curta acompanhada de uma imagem',
    icon: urlDoIcone,
  },
};

// O exemplo demonstra o disparo da notificação, não navegação: clicar nela apenas
// a dispensa. A lista mantém as notificações vivas enquanto podem ser clicadas -
// sem guardar a referência, o coletor de lixo descarta o tratador e o clique
// deixa de responder depois de algum tempo.
//
// Limitação conhecida no macOS durante o desenvolvimento: o clique não chega a
// este código. O aplicativo roda sob o identificador genérico com.github.Electron,
// e quando existe mais de uma instalação do Electron na máquina o sistema entrega
// o clique a outra delas, que abre a tela de boas-vindas do Electron. Some ao
// empacotar o aplicativo com identificador próprio, e não ocorre no Windows.
const notificacoesAtivas: Notification[] = [];

function dispensarAoClicar(notificacao: Notification): void {
  notificacoesAtivas.push(notificacao);

  function esquecer(): void {
    const posicao = notificacoesAtivas.indexOf(notificacao);
    if (posicao >= 0) {
      notificacoesAtivas.splice(posicao, 1);
    }
  }

  notificacao.onclick = (evento) => {
    evento.preventDefault();
    notificacao.close();
    esquecer();
  };

  notificacao.onclose = esquecer;
}

function notificar(evento: Event): void {
  const alvo = evento.currentTarget as HTMLElement;
  const exemplo = EXEMPLOS[alvo.id as keyof typeof EXEMPLOS];
  if (!exemplo) return;

  dispensarAoClicar(new Notification(exemplo.title, exemplo));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('basica')?.addEventListener('click', notificar);
  document.getElementById('com-imagem')?.addEventListener('click', notificar);
});
