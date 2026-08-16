import { app, BrowserWindow } from 'electron';
import path from 'path';

let janelaPrincipal: BrowserWindow | null = null;

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,

      // A tag <webview> é desabilitada por padrão e precisa ser ligada aqui. A
      // documentação oficial a desencoraja em favor de BrowserView e iframe,
      // mas ela segue suportada, e é justamente o que este exemplo demonstra.
      webviewTag: true,
    },
  });

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
