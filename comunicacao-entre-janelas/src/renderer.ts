import './estilo.css'

// Quem descreve `window.apiJanelas` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. O tipo de `mensagem`, lá no ouvinte do fim do arquivo, chega por
// inferência a partir do contrato - por isso nem `MensagemRecebida` precisa ser
// importado aqui.

// As duas janelas rodam este mesmo arquivo. O papel vem na consulta do
// endereço, posta pelo processo principal ao carregar a página.
const papel = new URLSearchParams(location.search).get('papel') ?? 'desconhecida'
const outra = papel === 'azul' ? 'verde' : 'azul'

document.body.classList.add(`papel-${papel}`)

const titulo = document.getElementById('titulo')
if (titulo) {
  titulo.textContent = `Janela ${papel}`
}

const destino = document.getElementById('destino')
if (destino) {
  destino.textContent = outra
}

const campo = document.getElementById('campo-mensagem') as HTMLInputElement | null
const historico = document.getElementById('historico')

function registrar(texto: string, classe: string): void {
  const linha = document.createElement('li')
  linha.textContent = texto
  linha.className = classe
  historico?.appendChild(linha)
  historico?.scrollTo(0, historico.scrollHeight)
}

document.getElementById('botao-enviar')?.addEventListener('click', () => {
  const texto = campo?.value.trim()
  if (!texto) {
    return
  }

  window.apiJanelas.enviar(texto)

  // O remetente registra o próprio envio por conta própria. Ele NÃO recebe a
  // mensagem de volta do processo principal - ela só vai para a outra janela.
  registrar(`Você enviou: ${texto}`, 'enviada')

  if (campo) {
    campo.value = ''
  }
})

campo?.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    document.getElementById('botao-enviar')?.click()
  }
})

// O ouvinte é registrado uma vez, no carregamento. A partir daqui, toda
// mensagem que o processo principal reenviar para esta janela cai aqui.
window.apiJanelas.aoReceber((mensagem) => {
  registrar(`Recebido da janela ${mensagem.de}: ${mensagem.texto}`, 'recebida')
})

export {}
