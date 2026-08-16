import './estilo.css'

// A lista de telas é a única fonte da verdade deste exemplo. Cada nome aqui
// precisa ter uma <section id="tela-NOME"> no HTML e um link com
// data-tela="NOME" no menu. Acrescentar uma tela nova é acrescentar o nome aqui.
const TELAS = ['inicio', 'cadastro', 'sobre'] as const

// `typeof TELAS[number]` transforma a lista acima num tipo com exatamente estes
// três valores. É o que faz o compilador recusar um nome de tela inventado.
type Tela = (typeof TELAS)[number]

const TELA_PADRAO: Tela = 'inicio'

const visitadas = new Set<Tela>()

// O endereço é texto livre: o usuário pode digitar "#qualquer-coisa". Esta
// função é o portão de entrada que separa o que é tela válida do que não é, e
// o `valor is Tela` avisa o compilador de que, depois dela, o valor está seguro.
function ehTelaValida(valor: string): valor is Tela {
  return (TELAS as readonly string[]).includes(valor)
}

function telaDoEndereco(): Tela {
  const nome = location.hash.replace(/^#/, '')
  return ehTelaValida(nome) ? nome : TELA_PADRAO
}

// Mostrar uma tela é alternar uma classe CSS: nenhuma seção é criada ou
// destruída, e é justamente por isso que o conteúdo digitado sobrevive à troca.
function mostrarTela(tela: Tela): void {
  for (const nome of TELAS) {
    const secao = document.getElementById(`tela-${nome}`)
    const link = document.querySelector(`[data-tela="${nome}"]`)

    secao?.classList.toggle('ativa', nome === tela)
    link?.classList.toggle('ativo', nome === tela)
  }

  visitadas.add(tela)
  atualizarIndicadores(tela)
}

function atualizarIndicadores(tela: Tela): void {
  const endereco = document.getElementById('endereco-atual')
  if (endereco) {
    endereco.textContent = `#${tela}`
  }

  const contador = document.getElementById('contador-visitas')
  if (contador) {
    contador.textContent = String(visitadas.size)
  }
}

// O evento hashchange é disparado pelo próprio navegador, tanto no clique do
// menu quanto nos botões de voltar e avançar do histórico. Escutar só ele
// resolve os dois casos de uma vez.
window.addEventListener('hashchange', () => {
  mostrarTela(telaDoEndereco())
})

const formulario = document.getElementById('formulario-cadastro')
const retorno = document.getElementById('retorno-cadastro')

formulario?.addEventListener('submit', (evento) => {
  // Sem isto o formulário navegaria de verdade, recarregando a página e
  // apagando tudo - inclusive o histórico de telas que acabamos de montar.
  evento.preventDefault()

  const nome = (document.getElementById('campo-nome') as HTMLInputElement | null)?.value.trim()

  if (retorno) {
    retorno.textContent = nome
      ? `Cadastro de ${nome} guardado na memória desta janela.`
      : 'Preencha o nome para ver a mensagem mudar.'
  }
})

// Primeira pintura: o endereço pode já vir com "#cadastro" se a janela foi
// recarregada, então a tela inicial sai da mesma função que trata as trocas.
mostrarTela(telaDoEndereco())

export {}
