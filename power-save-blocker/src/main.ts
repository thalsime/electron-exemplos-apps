import { app, Tray, Menu, powerSaveBlocker, BrowserWindow } from 'electron'
import path from 'path'

let appIcon: Tray | null = null

// __dirname aponta para dist-electron/, então as imagens ficam um nível acima.
// Elas são lidas pelo processo principal, não pelo Vite, e por isso continuam
// em images/ em vez de ir para public/.
const imagens = path.join(__dirname, '..', 'images')
const disabledIconPath = path.join(imagens, 'night-19.png')
const appSuspensionIconPath = path.join(imagens, 'sunset-19.png')
const displaySleepIconPath = path.join(imagens, 'day-19.png')

app.whenReady().then(function () {
  // A janela existe apenas para manter o processo vivo: nunca é exibida e nada
  // mais a acessa. Não há variável para guardá-la porque o próprio Electron
  // mantém as janelas abertas em BrowserWindow.getAllWindows().
  new BrowserWindow({ show: false })
  appIcon = new Tray(disabledIconPath)

  // O identificador devolvido por start() pode ser zero, então a comparação é
  // com null e não pela veracidade do valor - o original usava `if (blocker_id)`,
  // que ignoraria justamente o primeiro bloqueio criado.
  let blocker_id: number | null = null

  function pararBloqueioAtivo(): void {
    if (blocker_id !== null) {
      powerSaveBlocker.stop(blocker_id)
      blocker_id = null
    }
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Prevent app suspension',
      type: 'radio',
      icon: appSuspensionIconPath,
      click: function () {
        pararBloqueioAtivo()
        blocker_id = powerSaveBlocker.start('prevent-app-suspension')
      }
    },
    {
      label: 'Prevent display sleep',
      type: 'radio',
      icon: displaySleepIconPath,
      click: function () {
        pararBloqueioAtivo()
        blocker_id = powerSaveBlocker.start('prevent-display-sleep')
      }
    },
    {
      label: 'Disable',
      type: 'radio',
      icon: disabledIconPath,
      checked: true,
      click: function () {
        pararBloqueioAtivo()
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

  appIcon.setToolTip('Keep system awake')
  appIcon.setContextMenu(contextMenu)
})

// Este exemplo não registra window-all-closed de propósito: um aplicativo de
// bandeja precisa continuar vivo sem janela visível. Quem encerra é o item Quit.
