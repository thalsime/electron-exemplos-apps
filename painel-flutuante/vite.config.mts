import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      // Duas janelas com conteúdo diferente pedem duas páginas. Sem esta lista,
      // o Vite empacota só o index.html e o painel some do build - falha que só
      // aparece depois, em produção, com a janela do painel em branco.
      input: {
        principal: resolve(import.meta.dirname, 'index.html'),
        painel: resolve(import.meta.dirname, 'painel.html'),
      },
    },
  },
  plugins: [
    electron([
      {
        // Ponto de entrada do processo Main (Principal)
        entry: 'src/main.ts',
      },
      {
        // Ponto de entrada do script Preload (Ponte), usado pelas duas janelas
        entry: 'src/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
})
