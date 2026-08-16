import './estilo.css'
import type { ArquivoGravado, FonteDeCaptura } from './main'

// Quem descreve `window.apiGravador` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. Os dois tipos continuam importados aqui porque `escolherFonte` e
// `mostrarResultado` os usam nas próprias assinaturas.

const previa = document.getElementById('previa') as HTMLVideoElement | null
const botaoGravar = document.getElementById('botao-gravar') as HTMLButtonElement | null

let transmissao: MediaStream | null = null
let gravador: MediaRecorder | null = null
let pedacos: Blob[] = []

function anunciar(mensagem: string): void {
  const area = document.getElementById('situacao')
  if (area) {
    area.textContent = mensagem
  }
}

function mostrarTransmissao(nova: MediaStream, descricao: string): void {
  pararTransmissao()
  transmissao = nova

  if (previa) {
    previa.srcObject = nova
    void previa.play()
  }

  if (botaoGravar) {
    botaoGravar.disabled = false
  }

  anunciar(`Fonte ativa: ${descricao}. Pronto para gravar.`)
}

function pararTransmissao(): void {
  // Cada faixa precisa ser parada uma a uma: descartar o objeto do MediaStream
  // não desliga a câmera nem libera a captura de tela.
  transmissao?.getTracks().forEach((faixa) => faixa.stop())
  transmissao = null
}

// ---------------------------------------------------------------------------
// Câmera - API web pura, sem passar pelo processo principal
// ---------------------------------------------------------------------------

document.getElementById('botao-camera')?.addEventListener('click', async () => {
  try {
    anunciar('Pedindo acesso à câmera...')
    const nova = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    mostrarTransmissao(nova, 'câmera')
  } catch (erro) {
    anunciar(`A câmera não foi liberada: ${(erro as Error).message}`)
  }
})

// ---------------------------------------------------------------------------
// Tela - a escolha da fonte vem do processo principal
// ---------------------------------------------------------------------------

async function listarFontes(): Promise<void> {
  anunciar('Listando telas e janelas...')
  const fontes = await window.apiGravador.listarFontes()
  const lista = document.getElementById('fontes')

  if (!lista) {
    return
  }

  lista.replaceChildren()

  for (const fonte of fontes) {
    const cartao = document.createElement('button')
    cartao.className = 'fonte'

    const imagem = document.createElement('img')
    imagem.src = fonte.miniatura
    imagem.alt = ''

    const rotulo = document.createElement('span')
    rotulo.textContent = fonte.nome

    cartao.append(imagem, rotulo)
    cartao.addEventListener('click', () => void escolherFonte(fonte))
    lista.appendChild(cartao)
  }

  anunciar(`${fontes.length} fontes encontradas. Escolha uma.`)
}

async function escolherFonte(fonte: FonteDeCaptura): Promise<void> {
  await window.apiGravador.escolherFonte(fonte.id)

  try {
    // API web padrão. Quem decide o que ela devolve é o
    // `setDisplayMediaRequestHandler` registrado no processo principal.
    const nova = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    mostrarTransmissao(nova, fonte.nome)
  } catch (erro) {
    anunciar(`Não foi possível capturar: ${(erro as Error).message}`)
  }
}

document.getElementById('botao-fontes')?.addEventListener('click', () => void listarFontes())

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------

function iniciarGravacao(): void {
  if (!transmissao) {
    anunciar('Escolha uma fonte antes de gravar.')
    return
  }

  pedacos = []
  gravador = new MediaRecorder(transmissao, { mimeType: 'video/webm' })

  // Os pedaços ficam AQUI, no renderizador. Mandar cada um pelo IPC custaria
  // uma cópia por fatia, várias vezes por segundo - só o resultado viaja.
  gravador.ondataavailable = (evento) => {
    if (evento.data.size > 0) {
      pedacos.push(evento.data)
    }
  }

  gravador.onstop = () => void salvarGravacao()

  gravador.start()
  window.apiGravador.marcarGravacao(true)

  document.body.classList.add('gravando')
  if (botaoGravar) {
    botaoGravar.textContent = 'Parar e salvar'
  }

  anunciar('Gravando. A tela não vai apagar, e o ícone mostra REC.')
}

function pararGravacao(): void {
  gravador?.stop()
  window.apiGravador.marcarGravacao(false)

  document.body.classList.remove('gravando')
  if (botaoGravar) {
    botaoGravar.textContent = 'Gravar'
  }
}

async function salvarGravacao(): Promise<void> {
  const blob = new Blob(pedacos, { type: 'video/webm' })
  anunciar(`Gravação encerrada: ${(blob.size / 1024).toFixed(0)} KB. Escolha onde salvar.`)

  // `arrayBuffer()` é o formato que atravessa o IPC: um Blob não é
  // serializável pelo canal, mas os bytes dele são.
  const resultado = await window.apiGravador.salvar(await blob.arrayBuffer())
  mostrarResultado(resultado)
}

function mostrarResultado(resultado: ArquivoGravado | null): void {
  if (!resultado) {
    anunciar('Gravação descartada: nenhum arquivo foi escolhido.')
    return
  }

  anunciar(`Salvo em ${resultado.caminho} (${(resultado.bytes / 1024).toFixed(0)} KB).`)
}

function alternarGravacao(): void {
  if (gravador && gravador.state === 'recording') {
    pararGravacao()
  } else {
    iniciarGravacao()
  }
}

botaoGravar?.addEventListener('click', alternarGravacao)

// O item da bandeja chega por aqui: o processo principal pede, a página executa.
window.apiGravador.aoPedirAlternancia(alternarGravacao)

export {}
