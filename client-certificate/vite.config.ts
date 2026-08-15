import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// A janela carrega o servidor HTTPS externo, não uma página do Vite. O
// index.html local existe como fallback: aparece quando o servidor está fora do
// ar, com as instruções para subi-lo.
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
