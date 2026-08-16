import './estilo.css'
import type { LinhaDeSaida } from './main'

// Quem descreve `window.apiCompactador` é o src/ponte.d.ts, o mesmo arquivo contra o
// qual o preload se confere. `ResultadoDaCompactacao` saiu dos imports daqui junto com a
// declaração duplicada: o tipo de `resultado` chega por inferência do contrato.

let pastaEscolhida: string | null = null
let ultimoArquivo: string | null = null

const saida = document.getElementById('saida')
const botaoCompactar = document.getElementById('botao-compactar') as HTMLButtonElement | null
const botaoRevelar = document.getElementById('botao-revelar') as HTMLButtonElement | null

function anunciar(mensagem: string): void {
  const area = document.getElementById('retorno')
  if (area) {
    area.textContent = mensagem
  }
}

// Cada linha vira um elemento próprio, colorido pelo fluxo de origem. A tela
// acompanha o processo enquanto ele roda - não espera o fim para mostrar tudo.
function acrescentarLinha(linha: LinhaDeSaida): void {
  const elemento = document.createElement('div')
  elemento.className = `linha ${linha.fluxo}`
  elemento.textContent = linha.texto
  saida?.appendChild(elemento)
  saida?.scrollTo(0, saida.scrollHeight)

  const contador = document.getElementById('contador-de-linhas')
  if (contador) {
    contador.textContent = String(saida?.childElementCount ?? 0)
  }
}

window.apiCompactador.aoReceberLinha(acrescentarLinha)

document.getElementById('botao-escolher')?.addEventListener('click', async () => {
  const pasta = await window.apiCompactador.escolherPasta()

  if (!pasta) {
    anunciar('Nenhuma pasta escolhida.')
    return
  }

  pastaEscolhida = pasta
  const campo = document.getElementById('pasta-escolhida')
  if (campo) {
    campo.textContent = pasta
  }

  if (botaoCompactar) {
    botaoCompactar.disabled = false
  }

  anunciar('Pasta escolhida. Agora é só compactar.')
})

botaoCompactar?.addEventListener('click', async () => {
  if (!pastaEscolhida) {
    return
  }

  // Desabilitar durante a execução evita dois `tar` sobre o mesmo destino, que
  // é uma corrida real: os dois escreveriam no mesmo arquivo.
  botaoCompactar.disabled = true
  saida?.replaceChildren()
  anunciar('Compactando...')

  const resultado = await window.apiCompactador.compactar(pastaEscolhida)

  botaoCompactar.disabled = false

  if (resultado.sucesso) {
    ultimoArquivo = resultado.arquivo
    if (botaoRevelar) {
      botaoRevelar.disabled = false
    }
    anunciar(`Pronto: ${resultado.arquivo}`)
  } else {
    anunciar(`Falhou com código ${resultado.codigo}. Veja a saída acima.`)
  }
})

botaoRevelar?.addEventListener('click', () => {
  if (ultimoArquivo) {
    void window.apiCompactador.revelar(ultimoArquivo)
  }
})

export {}
