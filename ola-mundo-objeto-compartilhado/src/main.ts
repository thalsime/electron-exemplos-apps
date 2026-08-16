import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

declare global {
  var objetoCompartilhado: { minhaVariavel: string };
}

global.objetoCompartilhado = { minhaVariavel: 'olá, vindo do main.ts' };

let janelaPrincipal: BrowserWindow | null = null;

// O objeto continua vivendo no processo principal, como no original. O que mudou
// é o caminho até ele: o renderizador não alcança mais o Main por conta própria,
// então o valor é entregue por um canal declarado aqui e exposto pelo preload.
//
// O retorno do handler é anotado porque é o que o outro processo vai receber, e o
// Electron declara este ouvinte devolvendo `Promise<any> | any`: sem o `: string`
// aqui, trocar a variável por um número não quebraria nada em tempo de compilação.
ipcMain.handle('objeto-compartilhado:obter-minha-variavel', (): string => {
  return global.objetoCompartilhado.minhaVariavel;
});

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
