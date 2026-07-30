import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// Este exemplo não declara preload: getUserMedia é API web padrão e roda inteiro
// no renderizador, sem nenhuma ponte com o processo principal.
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
