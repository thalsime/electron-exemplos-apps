import { contextBridge, ipcRenderer } from 'electron'
import type { LinhaDeSaida, ResultadoDaCompactacao } from './main'

// Repare nos dois formatos de comunicação convivendo:
//   - `invoke` para pedir algo e esperar a resposta (escolher pasta, compactar)
//   - `on` para receber um FLUXO que chega ao longo do tempo (as linhas)
// Um processo externo produz os dois: um resultado no fim, e muita saída antes.
contextBridge.exposeInMainWorld('apiCompactador', {
  escolherPasta: (): Promise<string | null> => ipcRenderer.invoke('compactador:escolher-pasta'),

  compactar: (pasta: string): Promise<ResultadoDaCompactacao> =>
    ipcRenderer.invoke('compactador:compactar', pasta),

  revelar: (arquivo: string): Promise<void> => ipcRenderer.invoke('compactador:revelar', arquivo),

  aoReceberLinha: (ouvinte: (linha: LinhaDeSaida) => void): void => {
    ipcRenderer.on('compactador:linha', (_evento, linha: LinhaDeSaida) => {
      ouvinte(linha)
    })
  },
})
