import { app, BrowserWindow } from 'electron';
import path from 'path';

// A referência da janela fica em escopo de módulo de propósito: se existisse só
// dentro da função, o coletor de lixo poderia descartar a janela ainda em uso.
let janelaPrincipal: BrowserWindow | null = null;

// A janela nasce sem nenhuma permissão extra. O exemplo original ligava
// nodeIntegration sem que uma linha sequer do renderizador usasse Node - aqui
// vale o padrão da stack da turma: contexto isolado e Node desligado.
//
// Repare que o processo principal deste exemplo não faz nada além de abrir a
// janela. Toda a captura acontece do outro lado, no renderizador, porque
// getUserMedia é API web padrão e não depende de privilégio nenhum do Electron.
function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Em desenvolvimento a página vem do servidor do Vite; empacotado, vem do
  // build gerado em dist/. É o mesmo par de caminhos em todos os exemplos.
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

// O original mantinha o processo vivo no macOS depois de fechar a janela,
// seguindo a convenção do sistema, mas nunca implementou o evento `activate` que
// recria a janela - o resultado era um ícone inerte no Dock. Por decisão do
// mantenedor, o aplicativo encerra em todas as plataformas.
app.on('window-all-closed', () => {
  app.quit();
});
