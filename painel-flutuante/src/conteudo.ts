import './estilo.css'
import type { EstadoDaApresentacao } from './main'

// Quem descreve `window.apiPainel` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere - e o mesmo que serve o painel.ts, a outra página deste exemplo.

const TITULOS = ['Abertura', 'O problema', 'A proposta', 'Como funciona', 'Perguntas']

// Esta janela é só um espelho do estado: ela não decide nada e não guarda nada.
// Todo o cálculo fica no processo principal, e é por isso que as duas telas
// nunca discordam.
function pintar(estado: EstadoDaApresentacao): void {
  const numero = document.getElementById('numero-do-slide')
  if (numero) {
    numero.textContent = String(estado.slide)
  }

  const titulo = document.getElementById('titulo-do-slide')
  if (titulo) {
    titulo.textContent = TITULOS[estado.slide - 1] ?? ''
  }

  const situacao = document.getElementById('situacao')
  if (situacao) {
    situacao.textContent = estado.emApresentacao ? 'ligado' : 'desligado'
  }

  const detalhe = document.getElementById('detalhe-do-bloqueio')
  if (detalhe) {
    detalhe.textContent = estado.emApresentacao
      ? 'A tela não vai apagar enquanto isto durar.'
      : 'A tela apaga normalmente.'
  }

  document.body.classList.toggle('apresentando', estado.emApresentacao)
}

window.apiPainel.aoMudarEstado(pintar)

// O estado pode ter mudado antes desta janela existir - ela é reabrível pela
// bandeja. Por isso a primeira pintura vem de uma pergunta, e não de espera.
void window.apiPainel.estadoAtual().then(pintar)

export {}
