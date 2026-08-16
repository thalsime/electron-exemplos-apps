import { contextBridge, ipcRenderer } from 'electron';
import type { Aluno, NovoAluno } from './main';
import type { ApiSqlite } from './ponte';

// A ponte expõe quatro verbos, e nenhum deles aceita SQL. Esse é o ponto: se a
// página pudesse mandar um comando pronto, a fronteira não existiria de fato -
// qualquer script no renderizador poderia apagar a tabela inteira.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiSqlite: ApiSqlite = {
  listar: (): Promise<Aluno[]> => ipcRenderer.invoke('sqlite:listar'),
  inserir: (aluno: NovoAluno): Promise<number> => ipcRenderer.invoke('sqlite:inserir', aluno),
  atualizar: (aluno: Aluno): Promise<void> => ipcRenderer.invoke('sqlite:atualizar', aluno),
  remover: (id: number): Promise<void> => ipcRenderer.invoke('sqlite:remover', id),
};

contextBridge.exposeInMainWorld('apiSqlite', apiSqlite);
