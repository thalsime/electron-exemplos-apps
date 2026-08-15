import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// O Service Worker é API web padrão e roda inteiro no renderizador: não há
// preload nem IPC aqui. O arquivo do worker fica em `public/`, que o Vite copia
// sem processar - é o que preserva o nome e, com ele, o escopo do worker.
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
