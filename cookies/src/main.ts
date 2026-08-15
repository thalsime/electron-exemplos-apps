import { app, BrowserWindow, ipcMain, session } from 'electron'
import path from 'path'

export interface ResumoDeCookie {
  domain: string
  name: string
  path: string
  secure: boolean
}

let janelaPrincipal: BrowserWindow | null = null

// A sessão de um aplicativo recém-aberto não tem cookie algum, e o exemplo
// abriria com a tabela vazia. Estes cookies de demonstração deixam o exemplo
// autocontido: há o que listar, filtrar e remover sem depender de o usuário ter
// navegado para algum lugar antes.
const COOKIES_DE_DEMONSTRACAO = [
  { url: 'https://exemplo.com.br/', name: 'sessao', value: 'abc123' },
  { url: 'https://exemplo.com.br/', name: 'tema', value: 'escuro' },
  { url: 'https://exemplo.com.br/', name: 'idioma', value: 'pt-BR' },
  { url: 'https://loja.exemplo.com.br/', name: 'carrinho', value: '3-itens' },
  { url: 'https://outro-dominio.org/', name: 'visitas', value: '7' },
  { url: 'http://sem-tls.net/', name: 'aviso', value: 'sem-https' },
]

async function semearCookies(): Promise<void> {
  for (const cookie of COOKIES_DE_DEMONSTRACAO) {
    await session.defaultSession.cookies.set(cookie)
  }
  console.log(`${COOKIES_DE_DEMONSTRACAO.length} cookies de demonstração criados.`)
}

// Monta a URL a partir dos campos do cookie. Fica no processo principal, e não
// no renderizador, porque é a forma que a API de remoção exige - o renderizador
// só precisa dizer QUAL cookie quer remover.
function urlDoCookie(cookie: ResumoDeCookie): string {
  const esquema = cookie.secure ? 'https' : 'http'
  return `${esquema}://${cookie.domain}${cookie.path}`
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 600,
    height: 500,
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

// `cookies.get` e `cookies.remove` passaram de callback para Promise. No exemplo
// original as duas chamadas de `get` usavam assinaturas de callback DIFERENTES
// entre si - uma esperava (cookies) e a outra (error, cookies) -, então pelo
// menos uma estava errada desde sempre. Com Promise a ambiguidade desaparece.
ipcMain.handle('cookies:listar', async (): Promise<ResumoDeCookie[]> => {
  const cookies = await session.defaultSession.cookies.get({})
  return cookies.map((c) => ({
    domain: c.domain ?? '',
    name: c.name,
    path: c.path ?? '/',
    secure: c.secure ?? false,
  }))
})

ipcMain.handle('cookies:remover', async (_evento, cookie: ResumoDeCookie) => {
  await session.defaultSession.cookies.remove(urlDoCookie(cookie), cookie.name)
})

app.whenReady().then(async () => {
  await semearCookies()
  criarJanela()
})

app.on('window-all-closed', () => {
  app.quit()
})
