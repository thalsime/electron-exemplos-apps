import { app, Tray, Menu, BrowserWindow } from 'electron'
import path from 'path'

// __dirname aponta para dist-electron/, então o ícone fica um nível acima. Ele é
// lido pelo processo principal, não pelo Vite, e por isso continua na raiz do
// exemplo em vez de ir para public/.
const iconPath = path.join(__dirname, '..', 'icon.png')

let appIcon: Tray | null = null
let win: BrowserWindow | null = null

app.whenReady().then(function () {
  // A janela existe apenas para manter o processo vivo e para hospedar as
  // DevTools do item de menu: ela nunca é exibida nem carrega página alguma.
  win = new BrowserWindow({ show: false })
  appIcon = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Item1',
      type: 'radio',
      icon: iconPath
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
      label: 'Toggle DevTools',
      accelerator: 'Alt+Command+I',
      click: function () {
        win?.show()
        // toggleDevTools passou a ser método de webContents, não da janela.
        win?.webContents.toggleDevTools()
      }
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      // O original usava selector: 'terminate:', seletor do Objective-C que a
      // API de menus não expõe mais. O papel equivalente é o role quit.
      role: 'quit'
    }
  ])

  appIcon.setToolTip('This is my application.')
  appIcon.setContextMenu(contextMenu)
})

// Este exemplo não registra window-all-closed de propósito: um aplicativo de
// bandeja precisa continuar vivo sem janela visível. Quem encerra é o item Quit.
