import { app, BrowserWindow } from 'electron';
import path from 'path';

// A referência da janela fica em escopo de módulo de propósito: se ela existisse
// apenas dentro da função, o coletor de lixo poderia descartar a janela ainda em uso.
let janelaPrincipal: BrowserWindow | null = null;

// Este exemplo não tem `src/ponte.d.ts`, e é o melhor lugar do acervo para entender por
// quê. A convenção de tipagem existe para reconstruir o tipo na FRONTEIRA entre os dois
// processos - o IPC do Electron declara tudo que atravessa como `any`, e o
// `contextBridge` recebe o objeto exposto como `any`. Aqui não há fronteira: a página é
// estática, não há preload nem canal. Sem contrato a atravessar, não há contrato a
// nomear, e a única anotação que a convenção pede é o `: void` logo abaixo.

// Cria a janela e carrega o HTML. Como esta página é estática, o renderizador não
// precisa de acesso ao Node - por isso nenhuma permissão extra é concedida aqui.
function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Em desenvolvimento a página vem do servidor do Vite; empacotado, do build.
  if (process.env.VITE_DEV_SERVER_URL) {
    janelaPrincipal.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    janelaPrincipal.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null;
  });
}

app.whenReady().then(criarJanela);

// Encerra em todas as plataformas, inclusive no macOS: sem o handler activate que
// recria a janela, manter o processo vivo deixaria apenas um ícone inerte no Dock.
app.on('window-all-closed', () => {
  app.quit();
});
