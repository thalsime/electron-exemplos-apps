import { app, BrowserWindow } from 'electron';
import path from 'path';

// A referência da janela fica em escopo de módulo de propósito: se ela existisse
// apenas dentro da função, o coletor de lixo poderia descartar a janela ainda em uso.
let janelaPrincipal: BrowserWindow | null = null;

// O exemplo demonstra Service Worker, que é API web padrão e roda inteiro no
// renderizador. Não há ponte main/renderizador aqui: nenhum preload, nenhum IPC.
function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 400,
    height: 300,
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
