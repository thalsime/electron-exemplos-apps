import './estilo.css'
import type { RecursosDaPlataforma } from './main'

declare global {
  interface Window {
    apiIcone: {
      recursos: () => Promise<RecursosDaPlataforma>
      definirContador: (quantidade: number) => Promise<void>
      limparContador: () => Promise<void>
      trocarIcone: (nome: string) => Promise<void>
    }
  }
}

const NOMES_DE_PLATAFORMA: Record<string, string> = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux',
}

let contador = 0

function anunciar(mensagem: string): void {
  const area = document.getElementById('retorno')
  if (area) {
    area.textContent = mensagem
  }
}

// A interface é montada a partir do que a plataforma sabe fazer. Um recurso
// indisponível continua na tela, marcado - esconder daria a impressão de que
// ele não existe.
async function montarQuadroDeRecursos(): Promise<void> {
  const recursos = await window.apiIcone.recursos()

  const nome = NOMES_DE_PLATAFORMA[recursos.plataforma] ?? recursos.plataforma
  const plataforma = document.getElementById('plataforma')
  if (plataforma) {
    plataforma.textContent = nome
  }

  const disponibilidade: Array<[string, boolean, string]> = [
    ['ícone da janela', recursos.plataforma !== 'darwin', 'no macOS o ícone vem do pacote'],
    ['ícone do Dock', recursos.temDock, 'só existe no macOS'],
    ['contador no ícone', recursos.temContadorNoDock, 'macOS e Linux'],
    ['sobreposição na barra', recursos.temSobreposicaoNaBarra, 'só no Windows'],
  ]

  const lista = document.getElementById('recursos')
  for (const [rotulo, disponivel, observacao] of disponibilidade) {
    const linha = document.createElement('li')
    linha.className = disponivel ? 'disponivel' : 'indisponivel'
    linha.textContent = `${rotulo}: ${disponivel ? 'disponível aqui' : 'não aqui'} (${observacao})`
    lista?.appendChild(linha)
  }
}

document.getElementById('botao-somar')?.addEventListener('click', () => {
  contador += 1
  void window.apiIcone.definirContador(contador)
  anunciar(`Contador em ${contador}. Olhe o ícone do aplicativo.`)
})

document.getElementById('botao-limpar')?.addEventListener('click', () => {
  contador = 0
  void window.apiIcone.limparContador()
  anunciar('Contador limpo. O distintivo some do ícone.')
})

document.getElementById('botao-alerta')?.addEventListener('click', () => {
  void window.apiIcone.trocarIcone('alerta.png')
  anunciar('Ícone trocado pela variante de alerta.')
})

document.getElementById('botao-restaurar')?.addEventListener('click', () => {
  void window.apiIcone.trocarIcone('icone.png')
  anunciar('Ícone original restaurado.')
})

void montarQuadroDeRecursos()

export {}
