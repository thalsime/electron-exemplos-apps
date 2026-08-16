import { app, BrowserWindow } from 'electron';
import path from 'path';

let janelaPrincipal: BrowserWindow | null = null;

// O renderizador deste exemplo não precisa mais de Node: o único uso era montar
// o caminho do ícone, que agora o Vite resolve em tempo de build.
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
}

app.whenReady().then(criarJanela);

// O original não registrava este handler, e sem ele o Electron encerra sozinho
// quando a última janela fecha. Declarar o encerramento de forma explícita
// preserva esse comportamento e deixa a intenção visível no código.
app.on('window-all-closed', () => {
  app.quit();
});
