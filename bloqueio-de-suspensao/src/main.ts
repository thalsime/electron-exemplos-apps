import { app, Tray, Menu, powerSaveBlocker, BrowserWindow } from 'electron'
import path from 'path'

let iconeDaBandeja: Tray | null = null

// __dirname aponta para dist-electron/, então as imagens ficam um nível acima.
// Elas são lidas pelo processo principal, não pelo Vite, e por isso continuam
// em images/ em vez de ir para public/.
const imagens = path.join(__dirname, '..', 'images')
const caminhoIconeDesativado = path.join(imagens, 'night-19.png')
const caminhoIconeSuspensaoDoApp = path.join(imagens, 'sunset-19.png')
const caminhoIconeSuspensaoDoMonitor = path.join(imagens, 'day-19.png')

app.whenReady().then(function () {
  // A janela existe apenas para manter o processo vivo: nunca é exibida e nada
  // mais a acessa. Não há variável para guardá-la porque o próprio Electron
  // mantém as janelas abertas em BrowserWindow.getAllWindows().
  new BrowserWindow({ show: false })
  iconeDaBandeja = new Tray(caminhoIconeDesativado)

  // O identificador devolvido por start() pode ser zero, então a comparação é
  // com null e não pela veracidade do valor - o original usava `if (idDoBloqueio)`,
  // que ignoraria justamente o primeiro bloqueio criado.
  //
  // A anotação `number | null` não é enfeite: sem ela, `let idDoBloqueio = null` faz o
  // TypeScript desistir e cair em `any` implícito - `TS7034: Variable 'idDoBloqueio'
  // implicitly has type 'any' in some locations where its type cannot be determined`.
  // Ou seja, o `any` voltaria por uma porta que não é a do IPC. É a regra 4 da
  // convenção: onde a inferência não alcança, quem sabe a forma do valor é quem escreve.
  //
  // Este exemplo também não tem `src/ponte.d.ts` - tudo acontece no processo principal,
  // sem página e sem canal.
  let idDoBloqueio: number | null = null

  function pararBloqueioAtivo(): void {
    if (idDoBloqueio !== null) {
      powerSaveBlocker.stop(idDoBloqueio)
      idDoBloqueio = null
    }
  }

  const menuDeContexto = Menu.buildFromTemplate([
    {
      label: 'Impedir suspensão do aplicativo',
      type: 'radio',
      icon: caminhoIconeSuspensaoDoApp,
      click: function () {
        pararBloqueioAtivo()
        idDoBloqueio = powerSaveBlocker.start('prevent-app-suspension')
      }
    },
    {
      label: 'Impedir suspensão do monitor',
      type: 'radio',
      icon: caminhoIconeSuspensaoDoMonitor,
      click: function () {
        pararBloqueioAtivo()
        idDoBloqueio = powerSaveBlocker.start('prevent-display-sleep')
      }
    },
    {
      label: 'Desativar',
      type: 'radio',
      icon: caminhoIconeDesativado,
      checked: true,
      click: function () {
        pararBloqueioAtivo()
      }
    },
    {
      label: 'Encerrar',
      accelerator: 'Command+Q',
      // O original usava selector: 'terminate:', seletor do Objective-C que a
      // API de menus não expõe mais. O papel equivalente é o role quit.
      role: 'quit'
    }
  ])

  iconeDaBandeja.setToolTip('Manter o sistema acordado')
  iconeDaBandeja.setContextMenu(menuDeContexto)
})

// Este exemplo não registra window-all-closed de propósito: um aplicativo de
// bandeja precisa continuar vivo sem janela visível. Quem encerra é o item Encerrar.
