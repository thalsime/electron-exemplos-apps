import './app.css'
import type { FonteDeCaptura } from './main'

declare global {
  interface Window {
    capturaApi: {
      listarFontes: () => Promise<FonteDeCaptura[]>
      escolherFonte: (id: string) => Promise<boolean>
    }
  }
}

// A grade de miniaturas era um <select> transformado pelo plugin jQuery
// image-picker. Aqui ela é HTML e CSS: o exemplo é sobre captura de tela, e
// carregar 9.400 linhas de jQuery para desenhar botões com imagem não ajuda a
// entender desktopCapturer.

let transmissao: MediaStream | null = null

function elemento<T extends HTMLElement>(seletor: string): T {
  const alvo = document.querySelector<T>(seletor)
  if (!alvo) throw new Error(`Elemento não encontrado: ${seletor}`)
  return alvo
}

function registrar(mensagem: string): void {
  elemento('#status').textContent = mensagem
}

function encerrarTransmissao(): void {
  transmissao?.getTracks().forEach((faixa) => faixa.stop())
  transmissao = null
  elemento<HTMLVideoElement>('video').srcObject = null
  elemento<HTMLButtonElement>('#alternar').textContent = 'Iniciar captura'
}

async function iniciarTransmissao(id: string, nome: string): Promise<void> {
  if (!(await window.capturaApi.escolherFonte(id))) {
    registrar('A fonte escolhida não está mais disponível. Atualize a lista.')
    return
  }

  try {
    // API web padrão. Quem decide qual tela ou janela entregar é o handler
    // registrado no processo principal, com a fonte que acabamos de informar.
    transmissao = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    const video = elemento<HTMLVideoElement>('video')
    video.srcObject = transmissao
    elemento<HTMLButtonElement>('#alternar').textContent = 'Parar captura'
    registrar(`Capturando: ${nome}`)

    // Encerrar pela interface do sistema também precisa limpar o nosso estado.
    transmissao.getVideoTracks()[0]?.addEventListener('ended', () => {
      encerrarTransmissao()
      registrar('A captura foi encerrada pelo sistema.')
    })
  } catch (erro) {
    registrar(`Não foi possível capturar: ${String(erro)}`)
  }
}

function montarLista(fontes: FonteDeCaptura[]): void {
  const grade = elemento('#fontes')
  grade.replaceChildren()

  for (const fonte of fontes) {
    const item = document.createElement('button')
    item.className = 'fonte'
    item.title = fonte.name

    const imagem = document.createElement('img')
    imagem.src = fonte.thumbnail
    imagem.alt = fonte.name

    const legenda = document.createElement('span')
    legenda.textContent = fonte.name

    item.append(imagem, legenda)
    item.addEventListener('click', () => {
      grade.querySelectorAll('.fonte').forEach((outro) => outro.classList.remove('ativa'))
      item.classList.add('ativa')
      void iniciarTransmissao(fonte.id, fonte.name)
    })

    grade.appendChild(item)
  }

  registrar(`${fontes.length} fontes disponíveis. Clique em uma para capturar.`)
}

async function atualizarFontes(): Promise<void> {
  registrar('Consultando as fontes...')
  montarLista(await window.capturaApi.listarFontes())
}

window.addEventListener('DOMContentLoaded', () => {
  void atualizarFontes()

  elemento('#atualizar').addEventListener('click', () => void atualizarFontes())
  elemento('#alternar').addEventListener('click', () => {
    if (transmissao) {
      encerrarTransmissao()
      registrar('Captura encerrada.')
    } else {
      registrar('Escolha uma fonte na lista acima.')
    }
  })
})

export {}
