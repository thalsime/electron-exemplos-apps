import { app, BrowserWindow, ipcMain } from 'electron'
import { DatabaseSync } from 'node:sqlite'
import path from 'path'

// O formato que trafega no IPC. Declarado aqui e reimportado com `import type`
// no preload e no renderizador, para que as três pontas concordem.
export interface Aluno {
  id: number
  nome: string
  curso: string
  nota: number
}

export type NovoAluno = Omit<Aluno, 'id'>

let janelaPrincipal: BrowserWindow | null = null
let banco: DatabaseSync | null = null

// O banco fica em `app.getPath('userData')`, a pasta que o sistema reserva para
// os dados deste aplicativo. Guardar dentro da pasta do projeto seria cômodo e
// errado: em produção o aplicativo mora num diretório somente leitura, e o
// arquivo acabaria versionado por engano.
function abrirBanco(): DatabaseSync {
  const arquivo = path.join(app.getPath('userData'), 'alunos.db')
  const bd = new DatabaseSync(arquivo)

  console.log(`Banco em ${arquivo}`)

  // `exec` roda comando sem retorno. O `IF NOT EXISTS` é o que permite abrir o
  // aplicativo pela segunda vez sem apagar nada.
  bd.exec(`
    CREATE TABLE IF NOT EXISTS alunos (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      nome  TEXT    NOT NULL,
      curso TEXT    NOT NULL,
      nota  REAL    NOT NULL DEFAULT 0
    )
  `)

  // Semente só na primeira execução, para a tela não abrir vazia.
  const total = bd.prepare('SELECT COUNT(*) AS quantidade FROM alunos').get()

  if (Number(total?.quantidade ?? 0) === 0) {
    const inserir = bd.prepare('INSERT INTO alunos (nome, curso, nota) VALUES (?, ?, ?)')
    inserir.run('Ana Souza', 'Desenvolvimento de Sistemas', 8.5)
    inserir.run('Bruno Lima', 'Desenvolvimento de Sistemas', 7)
    inserir.run('Carla Dias', 'Redes de Computadores', 9.2)
  }

  return bd
}

function criarJanela(): void {
  janelaPrincipal = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
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

// As quatro operações do CRUD. Repare que TODAS ficam aqui, no processo
// principal: o renderizador nunca vê SQL nem o caminho do arquivo. Ele pede
// "listar" e recebe dados prontos - a mesma fronteira do exemplo `cookies`.

// O banco devolve linhas como `Record<string, SQLOutputValue>`, e o compilador
// **recusa** convertê-las direto para `Aluno`. Ele está certo: o SQL é texto, e
// nada garante que a consulta trouxe estas colunas. Converter campo a campo é a
// fronteira onde o dado não tipado do banco vira o tipo que o resto do código
// promete - e o lugar certo para tratar valor ausente.
function paraAluno(linha: Record<string, unknown>): Aluno {
  return {
    id: Number(linha.id),
    nome: String(linha.nome),
    curso: String(linha.curso),
    nota: Number(linha.nota),
  }
}

ipcMain.handle('sqlite:listar', (): Aluno[] => {
  const linhas = banco!.prepare('SELECT id, nome, curso, nota FROM alunos ORDER BY nome').all()
  return linhas.map(paraAluno)
})

ipcMain.handle('sqlite:inserir', (_evento, aluno: NovoAluno): number => {
  // `prepare` com `?` é o que separa comando de dado. Concatenar o valor dentro
  // do texto do SQL abriria a porta para injeção - um nome contendo aspas já
  // bastaria para quebrar o comando.
  const resultado = banco!
    .prepare('INSERT INTO alunos (nome, curso, nota) VALUES (?, ?, ?)')
    .run(aluno.nome, aluno.curso, aluno.nota)

  return Number(resultado.lastInsertRowid)
})

ipcMain.handle('sqlite:atualizar', (_evento, aluno: Aluno): void => {
  banco!
    .prepare('UPDATE alunos SET nome = ?, curso = ?, nota = ? WHERE id = ?')
    .run(aluno.nome, aluno.curso, aluno.nota, aluno.id)
})

ipcMain.handle('sqlite:remover', (_evento, id: number): void => {
  banco!.prepare('DELETE FROM alunos WHERE id = ?').run(id)
})

app.whenReady().then(() => {
  banco = abrirBanco()
  criarJanela()
})

app.on('window-all-closed', () => {
  // Fechar o banco explicitamente é boa prática: garante que tudo foi gravado
  // antes de o processo morrer.
  banco?.close()
  app.quit()
})

// ---------------------------------------------------------------------------
// O MESMO CRUD EM POSTGRES, para comparação - deliberadamente comentado
// ---------------------------------------------------------------------------
//
// O SQLite é um arquivo no disco do usuário, aberto direto pelo processo. O
// Postgres é um servidor: exige endereço, credenciais, uma conexão de rede e a
// biblioteca `pg` como dependência. O que muda no código é menos do que parece
// - o SQL é praticamente o mesmo, e a fronteira continua a mesma: as consultas
// no processo principal, o renderizador pedindo por IPC.
//
// import { Pool } from 'pg'                       // exigiria `npm install pg`
//
// const pool = new Pool({
//   host: 'localhost',
//   port: 5432,
//   database: 'escola',
//   user: 'aluno',
//   password: process.env.SENHA_DO_BANCO,          // nunca no código
// })
//
// ipcMain.handle('sqlite:listar', async (): Promise<Aluno[]> => {
//   const { rows } = await pool.query('SELECT id, nome, curso, nota FROM alunos ORDER BY nome')
//   return rows
// })
//
// ipcMain.handle('sqlite:inserir', async (_evento, aluno: NovoAluno): Promise<number> => {
//   const { rows } = await pool.query(
//     'INSERT INTO alunos (nome, curso, nota) VALUES ($1, $2, $3) RETURNING id',
//     [aluno.nome, aluno.curso, aluno.nota],
//   )
//   return rows[0].id
// })
//
// Três diferenças que saltam à vista:
//   1. tudo vira assíncrono - o `node:sqlite` usado aqui é síncrono de propósito
//   2. os marcadores mudam de `?` para `$1`, `$2`, `$3`
//   3. recuperar o id gerado exige `RETURNING id`, em vez de `lastInsertRowid`
//
// O que NÃO muda: preparar o comando em vez de concatenar texto.
