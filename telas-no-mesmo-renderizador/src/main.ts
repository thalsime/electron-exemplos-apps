import { app, BrowserWindow } from 'electron';
import path from 'path';

// A referência da janela fica em escopo de módulo: se ela existisse apenas
// dentro da função, o coletor de lixo poderia descartar a janela ainda em uso.
let janelaPrincipal: BrowserWindow | null = null;

// O processo principal deste exemplo não faz nada além de abrir a janela. Todo
// o assunto - trocar de tela sem trocar de janela - acontece do outro lado, no
// renderizador. Por isso não há preload nem canal de IPC aqui.
function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 900,
    height: 640,
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

app.on('window-all-closed', () => {
  app.quit();
});
