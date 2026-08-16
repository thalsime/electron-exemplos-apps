import { contextBridge, ipcRenderer } from 'electron'
import type { Aluno, NovoAluno } from './main'

// A ponte expõe quatro verbos, e nenhum deles aceita SQL. Esse é o ponto: se a
// página pudesse mandar um comando pronto, a fronteira não existiria de fato -
// qualquer script no renderizador poderia apagar a tabela inteira.
contextBridge.exposeInMainWorld('apiSqlite', {
  listar: (): Promise<Aluno[]> => ipcRenderer.invoke('sqlite:listar'),
  inserir: (aluno: NovoAluno): Promise<number> => ipcRenderer.invoke('sqlite:inserir', aluno),
  atualizar: (aluno: Aluno): Promise<void> => ipcRenderer.invoke('sqlite:atualizar', aluno),
  remover: (id: number): Promise<void> => ipcRenderer.invoke('sqlite:remover', id),
})
