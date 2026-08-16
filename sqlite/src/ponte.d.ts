import type { Aluno, NovoAluno } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois.
//
// A ponte expõe quatro verbos, e nenhum deles aceita SQL. Esse é o ponto do exemplo, e
// aqui ele vira uma regra que o compilador faz valer: não existe assinatura por onde um
// comando pronto possa entrar.
//
// `inserir` recebe `NovoAluno`, e não `Aluno`: quem atribui o id é o banco. O tipo
// nomeado diz isso; um `Omit<Aluno, 'id'>` escrito à mão diria o mesmo, mas seria mais
// uma cópia a manter em sincronia.
export interface ApiSqlite {
  listar: () => Promise<Aluno[]>
  inserir: (aluno: NovoAluno) => Promise<number>
  atualizar: (aluno: Aluno) => Promise<void>
  remover: (id: number) => Promise<void>
}

declare global {
  interface Window {
    apiSqlite: ApiSqlite
  }
}
