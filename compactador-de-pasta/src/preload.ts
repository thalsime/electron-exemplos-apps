import { contextBridge, ipcRenderer } from 'electron';
import type { LinhaDeSaida, ResultadoDaCompactacao } from './main';
import type { ApiCompactador } from './ponte';

// Repare nos dois formatos de comunicação convivendo:
//   - `invoke` para pedir algo e esperar a resposta (escolher pasta, compactar)
//   - `on` para receber um FLUXO que chega ao longo do tempo (as linhas)
// Um processo externo produz os dois: um resultado no fim, e muita saída antes.
//
// O tipo é aplicado à variável porque `exposeInMainWorld(apiKey: string, api: any)` não
// confere nada: sem esta anotação, a ponte poderia divergir do contrato em silêncio.
const apiCompactador: ApiCompactador = {
  escolherPasta: (): Promise<string | null> => ipcRenderer.invoke('compactador:escolher-pasta'),

  compactar: (pasta: string): Promise<ResultadoDaCompactacao> =>
    ipcRenderer.invoke('compactador:compactar', pasta),

  revelar: (arquivo: string): Promise<void> => ipcRenderer.invoke('compactador:revelar', arquivo),

  aoReceberLinha: (ouvinte: (linha: LinhaDeSaida) => void): void => {
    ipcRenderer.on('compactador:linha', (_evento, linha: LinhaDeSaida) => {
      ouvinte(linha);
    });
  },
};

contextBridge.exposeInMainWorld('apiCompactador', apiCompactador);
