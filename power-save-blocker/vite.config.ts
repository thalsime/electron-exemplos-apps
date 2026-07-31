import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'

// Este exemplo não tem renderizador: a única janela nasce com show: false e nunca
// carrega página. Sem index.html nem entrada configurada, o vite-plugin-electron
// escreve um HTML temporário só para o Vite ter um ponto de partida, e o remove
// ao final. O plugin de renderizador não entra aqui, por não haver o que servir.
export default defineConfig({
  plugins: [
    electron([
      {
        // Ponto de entrada do processo Main (Principal)
        entry: 'src/main.ts',
      },
    ]),
  ],
})
