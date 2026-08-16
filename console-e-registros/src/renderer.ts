import './estilo.css';

// Quem descreve `window.apiRegistros` é o src/ponte.d.ts, o mesmo arquivo que o preload
// usa para se conferir. Aqui a página só consome.

// A mesma função das outras duas camadas, com o mesmo texto. Só o rótulo muda.
function emitirOsCincoNiveis(origem: string): void {
  console.log(`[${origem}] console.log - a mensagem comum do dia a dia`);
  console.info(`[${origem}] console.info - informação, tratada como log na maioria dos destinos`);
  console.warn(`[${origem}] console.warn - aviso, costuma sair em amarelo`);
  console.error(`[${origem}] console.error - erro, costuma sair em vermelho e vai para o stderr`);
  console.debug(`[${origem}] console.debug - o mais discreto: some se o destino filtra por nível`);
}

console.log('[renderizador] código da página carregado - repare que o preload veio antes');

// Cada botão emite de um lugar diferente. A pergunta que o exemplo faz é
// sempre a mesma: onde essa mensagem vai aparecer?
const acoes: Record<string, () => void> = {
  'botao-emitir-main': () => {
    void window.apiRegistros.emitirNoMain();
    anunciar('Pedido enviado ao processo principal. Procure no TERMINAL.');
  },
  'botao-emitir-preload': () => {
    window.apiRegistros.emitirNoPreload();
    anunciar('Emitido pelo preload. Procure no DEVTOOLS desta janela.');
  },
  'botao-emitir-renderizador': () => {
    emitirOsCincoNiveis('renderizador');
    anunciar('Emitido pela página. Procure no DEVTOOLS desta janela.');
  },
  'botao-abrir-devtools': () => {
    void window.apiRegistros.abrirDevTools();
    anunciar('DevTools aberto. Para ver o console.debug, ligue o nível Verbose.');
  },
};

function anunciar(mensagem: string): void {
  const area = document.getElementById('retorno');
  if (area) {
    area.textContent = mensagem;
  }
}

for (const [id, acao] of Object.entries(acoes)) {
  document.getElementById(id)?.addEventListener('click', acao);
}

export {};
