import './estilo.css';

// Quem descreve `window.apiSqlite` é o src/ponte.d.ts, o mesmo arquivo contra o qual o
// preload se confere. A página não importa mais `Aluno`: o tipo de cada item de
// `alunos`, e o do objeto entregue a `inserir`, vêm por inferência do contrato.

// Quando há id, o formulário está editando; quando não há, está criando. É a
// única variável de estado da tela.
let emEdicao: number | null = null;

const campoNome = document.getElementById('campo-nome') as HTMLInputElement;
const campoCurso = document.getElementById('campo-curso') as HTMLInputElement;
const campoNota = document.getElementById('campo-nota') as HTMLInputElement;
const corpoDaTabela = document.getElementById('corpo-da-tabela');

function anunciar(mensagem: string): void {
  const area = document.getElementById('retorno');
  if (area) {
    area.textContent = mensagem;
  }
}

// A tela é redesenhada inteira a cada mudança, sempre a partir do banco. É mais
// simples do que remendar linha por linha, e garante que o que está na tela é o
// que está gravado - nunca um palpite do renderizador.
async function recarregar(): Promise<void> {
  const alunos = await window.apiSqlite.listar();

  if (!corpoDaTabela) {
    return;
  }

  corpoDaTabela.replaceChildren();

  for (const aluno of alunos) {
    const linha = document.createElement('tr');

    for (const valor of [aluno.id, aluno.nome, aluno.curso, aluno.nota]) {
      const celula = document.createElement('td');
      celula.textContent = String(valor);
      linha.appendChild(celula);
    }

    const acoes = document.createElement('td');

    const editar = document.createElement('button');
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => {
      emEdicao = aluno.id;
      campoNome.value = aluno.nome;
      campoCurso.value = aluno.curso;
      campoNota.value = String(aluno.nota);
      anunciar(`Editando o registro ${aluno.id}. Salvar agora faz UPDATE.`);
    });

    const remover = document.createElement('button');
    remover.textContent = 'Remover';
    remover.className = 'perigo';
    remover.addEventListener('click', async () => {
      await window.apiSqlite.remover(aluno.id);
      anunciar(`DELETE no registro ${aluno.id}.`);
      await recarregar();
    });

    acoes.append(editar, remover);
    linha.appendChild(acoes);
    corpoDaTabela.appendChild(linha);
  }

  const contagem = document.getElementById('contagem');
  if (contagem) {
    contagem.textContent = String(alunos.length);
  }
}

function limparFormulario(): void {
  emEdicao = null;
  campoNome.value = '';
  campoCurso.value = '';
  campoNota.value = '';
}

document.getElementById('formulario')?.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const dados = {
    nome: campoNome.value.trim(),
    curso: campoCurso.value.trim(),
    nota: Number(campoNota.value) || 0,
  };

  if (!dados.nome || !dados.curso) {
    anunciar('Nome e curso são obrigatórios.');
    return;
  }

  if (emEdicao === null) {
    const id = await window.apiSqlite.inserir(dados);
    anunciar(`INSERT concluído. O banco atribuiu o id ${id}.`);
  } else {
    await window.apiSqlite.atualizar({ id: emEdicao, ...dados });
    anunciar(`UPDATE concluído no registro ${emEdicao}.`);
  }

  limparFormulario();
  await recarregar();
});

document.getElementById('botao-cancelar')?.addEventListener('click', () => {
  limparFormulario();
  anunciar('Edição cancelada. Salvar agora faz INSERT.');
});

void recarregar();

export {};
