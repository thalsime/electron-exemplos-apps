import './estilo.css'
import type { EstadoDaApresentacao } from './main'

// A declaração da ponte vive em conteudo.ts, que é carregado pela outra página.
// Aqui o `declare global` seria duplicado, então basta o acesso tipado.
declare global {
  interface Window {
    apiPainel: {
      estadoAtual: () => Promise<EstadoDaApresentacao>
      alternarApresentacao: () => void
      moverSlide: (passo: number) => void
      ocultarPainel: () => void
      aoMudarEstado: (ouvinte: (estado: EstadoDaApresentacao) => void) => void
    }
  }
}

// O painel não guarda estado próprio: ele só desenha o que recebe e manda a
// intenção de volta. Guardar uma cópia aqui seria a porta de entrada para as
// duas telas discordarem.
function pintar(estado: EstadoDaApresentacao): void {
  const botao = document.getElementById('botao-apresentar')
  if (botao) {
    botao.textContent = estado.emApresentacao
      ? 'Sair do modo apresentação'
      : 'Entrar no modo apresentação'
    botao.classList.toggle('ativo', estado.emApresentacao)
  }

  const indicador = document.getElementById('indicador')
  if (indicador) {
    indicador.textContent = `${estado.slide} / ${estado.totalDeSlides}`
  }
}

document.getElementById('botao-apresentar')?.addEventListener('click', () => {
  window.apiPainel.alternarApresentacao()
})

document.getElementById('botao-anterior')?.addEventListener('click', () => {
  window.apiPainel.moverSlide(-1)
})

document.getElementById('botao-proximo')?.addEventListener('click', () => {
  window.apiPainel.moverSlide(1)
})

document.getElementById('botao-ocultar')?.addEventListener('click', () => {
  window.apiPainel.ocultarPainel()
})

window.apiPainel.aoMudarEstado(pintar)
void window.apiPainel.estadoAtual().then(pintar)

export {}
