import './estilo.css';

// Quem descreve `window.apiNavegador` é o src/ponte.d.ts, o mesmo arquivo contra o qual
// o preload se confere. Os três tipos saíram dos imports daqui junto com a declaração
// duplicada: cookies, relatórios e avisos chegam tipados pelo contrato.

interface PaginaInicial {
  titulo: string;
  mensagem: string;
  atalhos: Array<{ rotulo: string; url: string }>;
}

const visualizador = document.getElementById('visualizador') as Electron.WebviewTag | null;
const campoEndereco = document.getElementById('campo-endereco') as HTMLInputElement | null;
const inicio = document.getElementById('inicio');
const avisos = document.getElementById('avisos');

function anunciar(mensagem: string): void {
  const area = document.getElementById('situacao');
  if (area) {
    area.textContent = mensagem;
  }
}

// ---------------------------------------------------------------------------
// Página inicial servida pelo Service Worker
// ---------------------------------------------------------------------------

// O worker responde a esta rota sem tocar a rede. Note que a requisição parte
// da CASCA do navegador: o conteúdo da <webview> roda em outro processo e não
// passa por aqui - ver o README.
// Registrar um Service Worker NÃO significa estar sob o controle dele. Na
// primeira visita a página já está carregada quando o worker ativa, e
// continua sem controlador até um recarregamento - por isso o exemplo
// `service-worker/resposta-simulada` pede para recarregar. Aqui o worker chama
// `clients.claim()` na ativação, e esta função espera o controle chegar.
function aguardarControle(): Promise<boolean> {
  if (navigator.serviceWorker.controller) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const aoMudar = (): void => {
      navigator.serviceWorker.removeEventListener('controllerchange', aoMudar);
      resolve(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', aoMudar);

    // Rede de segurança: sem isto, um worker que não assumisse deixaria a tela
    // presa para sempre, sem explicação nenhuma.
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('controllerchange', aoMudar);
      resolve(navigator.serviceWorker.controller !== null);
    }, 3000);
  });
}

async function montarPaginaInicial(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    anunciar('Este ambiente não tem Service Worker.');
    return;
  }

  await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  if (!(await aguardarControle())) {
    anunciar('O Service Worker registrou mas não assumiu o controle. Recarregue a janela.');
    return;
  }

  const resposta = await fetch('/pagina-inicial');
  const pagina: PaginaInicial = await resposta.json();

  if (!inicio) {
    return;
  }

  const titulo = document.createElement('h2');
  titulo.textContent = pagina.titulo;

  const mensagem = document.createElement('p');
  mensagem.textContent = pagina.mensagem;

  const lista = document.createElement('ul');
  for (const atalho of pagina.atalhos) {
    const item = document.createElement('li');
    const link = document.createElement('button');
    link.textContent = atalho.rotulo;
    link.className = 'atalho';
    link.addEventListener('click', () => navegarPara(atalho.url));
    item.appendChild(link);
    lista.appendChild(item);
  }

  inicio.replaceChildren(titulo, mensagem, lista);
}

// ---------------------------------------------------------------------------
// Navegação com <webview>
// ---------------------------------------------------------------------------

function navegarPara(endereco: string): void {
  if (!visualizador || !endereco) {
    return;
  }

  const completo = /^[a-z]+:/i.test(endereco) ? endereco : `https://${endereco}`;

  if (campoEndereco) {
    campoEndereco.value = completo;
  }

  document.body.classList.add('navegando');
  visualizador.src = completo;
}

document.getElementById('formulario-endereco')?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  navegarPara(campoEndereco?.value.trim() ?? '');
});

document.getElementById('botao-voltar')?.addEventListener('click', () => {
  if (visualizador?.canGoBack()) {
    visualizador.goBack();
  }
});

document.getElementById('botao-recarregar')?.addEventListener('click', () => {
  visualizador?.reload();
});

document.getElementById('botao-inicio')?.addEventListener('click', () => {
  document.body.classList.remove('navegando');
  anunciar('De volta à página inicial, servida pelo Service Worker.');
});

document.getElementById('botao-nova-janela')?.addEventListener('click', () => {
  const endereco = campoEndereco?.value.trim();
  if (endereco) {
    window.apiNavegador.abrirEmNovaJanela(endereco);
    anunciar('Pedido de nova janela enviado ao processo principal.');
  }
});

visualizador?.addEventListener('did-start-loading', () => anunciar('Carregando...'));

visualizador?.addEventListener('did-stop-loading', () => {
  anunciar(`Carregado: ${visualizador.getURL()}`);
  if (campoEndereco) {
    campoEndereco.value = visualizador.getURL();
  }
});

visualizador?.addEventListener('did-fail-load', (evento) => {
  anunciar(`Falhou (${evento.errorCode}): ${evento.errorDescription}`);
});

// Quando o processo que desenha a página morre, este evento dispara - e é aí
// que o crashReporter tem o que relatar. A janela do navegador continua viva:
// só o conteúdo caiu.
visualizador?.addEventListener('render-process-gone', () => {
  document.body.classList.add('travado');
  anunciar('O conteúdo travou. O relatório leva alguns segundos para ser enviado...');

  // O relatório NÃO fica pronto no instante do travamento: o Crashpad grava o
  // despejo, envia ao coletor e só então ele entra em `getUploadedReports`.
  // Listar agora quase sempre devolve vazio - por isso a segunda tentativa.
  void listarRelatorios();
  setTimeout(() => {
    void listarRelatorios().then(() => anunciar('Relatório enviado ao coletor local.'));
  }, 8000);
});

// ---------------------------------------------------------------------------
// Cookies e relatórios
// ---------------------------------------------------------------------------

function preencherTabela(id: string, linhas: string[][]): void {
  const corpo = document.getElementById(id);
  if (!corpo) {
    return;
  }

  corpo.replaceChildren();

  for (const colunas of linhas) {
    const linha = document.createElement('tr');
    for (const valor of colunas) {
      const celula = document.createElement('td');
      celula.textContent = valor;
      linha.appendChild(celula);
    }
    corpo.appendChild(linha);
  }
}

async function listarCookies(): Promise<void> {
  const cookies = await window.apiNavegador.listarCookies();
  preencherTabela(
    'corpo-cookies',
    cookies.map((cookie) => [cookie.dominio, cookie.nome, cookie.valor]),
  );
  anunciar(`${cookies.length} cookies na sessão.`);
}

async function listarRelatorios(): Promise<void> {
  const relatorios = await window.apiNavegador.listarRelatorios();
  preencherTabela(
    'corpo-relatorios',
    relatorios.map((relatorio) => [relatorio.id, relatorio.data]),
  );
}

document.getElementById('botao-cookies')?.addEventListener('click', () => void listarCookies());

document.getElementById('botao-limpar-cookies')?.addEventListener('click', async () => {
  await window.apiNavegador.limparCookies();
  await listarCookies();
  anunciar('Cookies removidos. Navegue de novo para ver outros aparecerem.');
});

document.getElementById('botao-travar')?.addEventListener('click', () => {
  anunciar('Mandando o conteúdo travar de propósito...');
  navegarPara('chrome://crash');
});

// ---------------------------------------------------------------------------
// Avisos vindos de outras janelas
// ---------------------------------------------------------------------------

window.apiNavegador.aoReceberAviso((aviso) => {
  const linha = document.createElement('li');
  linha.textContent = aviso.daPropria ? `${aviso.texto} (foi você quem pediu)` : aviso.texto;
  avisos?.appendChild(linha);
});

// Uma janela aberta pela outra recebe o endereço na consulta do endereço.
const enderecoInicial = new URLSearchParams(location.search).get('endereco');
if (enderecoInicial) {
  navegarPara(enderecoInicial);
}

void montarPaginaInicial();
void listarCookies();
void listarRelatorios();

export {};
