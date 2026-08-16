import { app, Tray, Menu, BrowserWindow } from 'electron';
import path from 'path';

// __dirname aponta para dist-electron/, então o ícone fica um nível acima. Ele é
// lido pelo processo principal, não pelo Vite, e por isso continua na raiz do
// exemplo em vez de ir para public/.
const caminhoDoIcone = path.join(__dirname, '..', 'icon.png');

let iconeDaBandeja: Tray | null = null;
let janelaOculta: BrowserWindow | null = null;

app.whenReady().then(function () {
  // A janela existe apenas para manter o processo vivo e para hospedar as
  // DevTools do item de menu: ela nunca é exibida nem carrega página alguma.
  janelaOculta = new BrowserWindow({ show: false });
  iconeDaBandeja = new Tray(caminhoDoIcone);

  // Este exemplo não tem `src/ponte.d.ts` porque não tem fronteira: tudo roda no
  // processo principal, e a janela oculta nunca carrega página nenhuma. E como não há
  // IPC, também não há `any` a reconstruir - o modelo abaixo é conferido contra
  // `MenuItemConstructorOptions`, que o próprio `electron.d.ts` declara. Escrever
  // `type: 'radiu'` aqui é erro de compilação; o mesmo engano dentro de um canal de IPC
  // passaria batido.
  const menuDeContexto = Menu.buildFromTemplate([
    {
      label: 'Item1',
      type: 'radio',
      icon: caminhoDoIcone
    },
    {
      label: 'Item2',
      submenu: [
        { label: 'submenu1' },
        { label: 'submenu2' }
      ]
    },
    {
      label: 'Item3',
      type: 'radio',
      checked: true
    },
    {
      label: 'Alternar DevTools',
      accelerator: 'Alt+Command+I',
      click: function () {
        janelaOculta?.show();
        // toggleDevTools passou a ser método de webContents, não da janela.
        janelaOculta?.webContents.toggleDevTools();
      }
    },
    {
      label: 'Encerrar',
      accelerator: 'Command+Q',
      // O original usava selector: 'terminate:', seletor do Objective-C que a
      // API de menus não expõe mais. O papel equivalente é o role quit.
      role: 'quit'
    }
  ]);

  iconeDaBandeja.setToolTip('Este é o meu aplicativo.');
  iconeDaBandeja.setContextMenu(menuDeContexto);
});

// Este exemplo não registra window-all-closed de propósito: um aplicativo de
// bandeja precisa continuar vivo sem janela visível. Quem encerra é o item Encerrar.
