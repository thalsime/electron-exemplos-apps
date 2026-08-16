import { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain } from 'electron'
import path from 'path'

let janelaPrincipal: BrowserWindow | null = null

// Os três menus que a página pode pedir. Antes esta união era escrita por extenso em
// quatro lugares, e o lado que a CONSOME - o `abrirMenuDeContexto` aqui embaixo -
// recebia `string` cru: um pedido escrito errado chegaria até o `if/else`, cairia fora
// dos três ramos e devolveria um menu vazio, sem erro nenhum de compilação.
export type TipoDeMenu = 'itens' | 'frutas' | 'cores'

// As cores oferecidas pelo menu de contexto da terceira área.
const CORES = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#00FFFF', '#FF00FF', '#C0C0C0', '#FFFFFF',
]

const FRUTAS = ['Maçã', 'Banana', 'Morango', 'Pera']

// Guarda a fruta escolhida por último. O estado vive no processo principal
// porque é ele quem monta o menu a cada abertura, e o item informativo precisa
// refletir a escolha anterior.
let frutaPreferida: string | null = null

function criarMenuDaAplicacao(): void {
  const modelo: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'menu1',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        {
          label: 'Abrir',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            // showOpenDialog passou de callback para Promise.
            const resultado = await dialog.showOpenDialog({
              properties: ['openFile', 'openDirectory', 'multiSelections'],
            })
            console.log('Selecionado:', resultado.filePaths)
          },
        },
        {
          label: 'submenu1',
          submenu: [
            {
              label: 'Abrir DevTools',
              accelerator: 'CmdOrCtrl+A',
              // openDevTools saiu de BrowserWindow e vive em webContents.
              click: () => janelaPrincipal?.webContents.openDevTools(),
            },
            {
              label: 'Fechar DevTools',
              accelerator: 'CmdOrCtrl+B',
              click: () => janelaPrincipal?.webContents.closeDevTools(),
            },
          ],
        },
      ],
    },
  ]

  if (process.platform === 'darwin') {
    // app.getName() foi substituído pela propriedade app.name.
    const nome = app.name
    modelo.unshift({
      label: nome,
      submenu: [
        { label: `Sobre ${nome}`, role: 'about' },
        { type: 'separator' },
        { label: 'Serviços', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: `Ocultar ${nome}`, accelerator: 'Command+H', role: 'hide' },
        { label: 'Ocultar Outros', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Mostrar Tudo', role: 'unhide' },
        { type: 'separator' },
        { label: 'Encerrar', accelerator: 'Command+Q', click: () => app.quit() },
      ],
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(modelo))
}

// Monta o menu de contexto pedido e devolve o rótulo escolhido.
//
// O menu é construído aqui, e não no renderizador: Menu e MenuItem são APIs do
// processo principal. Antes o renderizador as alcançava pelo módulo remote, que
// não existe mais - a página agora pede, e o resultado volta pelo IPC.
function abrirMenuDeContexto(tipo: TipoDeMenu): Promise<string | null> {
  return new Promise((resolve) => {
    const janela = janelaPrincipal
    if (!janela) {
      resolve(null)
      return
    }

    const menu = new Menu()
    // Um menu fechado sem escolha também precisa resolver a Promise, senão o
    // renderizador fica esperando para sempre.
    let escolha: string | null = null

    if (tipo === 'itens') {
      const submenu = new Menu()
      for (const rotulo of ['caixa1', 'caixa2', 'caixa3', 'caixa4']) {
        submenu.append(new MenuItem({ type: 'checkbox', label: rotulo }))
      }
      menu.append(new MenuItem({
        label: 'ItemDeMenu1',
        click: () => { escolha = 'ItemDeMenu1' },
      }))
      menu.append(new MenuItem({ label: 'ItemDeMenu2', type: 'checkbox', checked: true }))
      menu.append(new MenuItem({ label: 'Disco', submenu }))
    } else if (tipo === 'frutas') {
      for (const fruta of FRUTAS) {
        menu.append(new MenuItem({
          label: fruta,
          type: 'checkbox',
          checked: fruta === frutaPreferida,
          // A fruta já escolhida aparece marcada e desabilitada, que é o efeito
          // que o exemplo original perseguia com a função `flip`.
          enabled: fruta !== frutaPreferida,
          click: () => { frutaPreferida = fruta; escolha = fruta },
        }))
      }
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({
        label: frutaPreferida ? `Eu amo ${frutaPreferida}` : 'Qual fruta eu amo?',
        enabled: false,
      }))
    } else if (tipo === 'cores') {
      for (const cor of CORES) {
        menu.append(new MenuItem({ label: cor, click: () => { escolha = cor } }))
      }
    }

    menu.popup({
      window: janela,
      callback: () => resolve(escolha),
    })
  })
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    janelaPrincipal.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    janelaPrincipal.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null
  })
}

ipcMain.handle(
  'menus:abrir-contexto',
  (_evento, tipo: TipoDeMenu): Promise<string | null> => abrirMenuDeContexto(tipo),
)

app.whenReady().then(() => {
  criarMenuDaAplicacao()
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
