// Servidor HTTPS que exige certificado de cliente. Roda FORA do Electron, em
// terminal separado: `npm run servidor`.
//
// Node 24 executa TypeScript direto, removendo os tipos em tempo de carga, então
// não há passo de compilação aqui.

import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ESTE_DIRETORIO = path.dirname(fileURLToPath(import.meta.url))
const PASTA_SSL = path.join(ESTE_DIRETORIO, 'ssl')

// Caminhos resolvidos a partir do arquivo, e não do diretório atual: assim o
// servidor sobe de qualquer lugar, inclusive pelo `npm run` da raiz.
function lerCertificado(nome: string): Buffer {
  const caminho = path.join(PASTA_SSL, nome)
  if (!fs.existsSync(caminho)) {
    console.error(`Faltando ${caminho}`)
    console.error('Gere os certificados primeiro: ./ssl/setup.sh')
    process.exit(1)
  }
  return fs.readFileSync(caminho)
}

const opcoes: https.ServerOptions = {
  key: lerCertificado('server.key'),
  cert: lerCertificado('server.crt'),
  ca: lerCertificado('rootCA.crt'),

  // requestCert pede o certificado ao cliente; rejectUnauthorized falso deixa a
  // conexão seguir mesmo sem certificado válido, para que o próprio servidor
  // possa responder "denied" em vez de derrubar a conexão.
  requestCert: true,
  rejectUnauthorized: false,
}

https
  .createServer(opcoes, (req, res) => {
    const autorizado = (req.socket as import('node:tls').TLSSocket).authorized
    console.log(`Requisição recebida. Autorizada: ${autorizado}`)

    if (autorizado) {
      res.writeHead(200)
      res.end('approved\n')
    } else {
      res.writeHead(401)
      res.end('denied\n')
    }
  })
  .listen(5000, () => {
    console.log('Servidor HTTPS em https://localhost:5000')
  })
