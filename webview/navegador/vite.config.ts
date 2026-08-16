import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// A página é estática: não há preload, IPC nem código de renderizador.
export default defineConfig({
  plugins: [
    electron([
      {
        // Ponto de entrada do processo Main (Principal)
        entry: 'src/main.ts',
      },
    ]),
    renderer(),
  ],
})
