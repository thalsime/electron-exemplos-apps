import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron([
      {
        // Ponto de entrada do processo Main (Principal)
        entry: 'src/main.ts',
      },
      {
        // Ponto de entrada do script Preload (Ponte)
        entry: 'src/preload.ts',
        onstart(options) {
          // Solicita recarregamento da janela quando o preload for compilado
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
})
