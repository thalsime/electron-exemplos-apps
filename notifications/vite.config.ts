import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// Sem preload: a API Notification é do padrão web e roda no renderizador. O que
// exigia Node no original era só o caminho do ícone, resolvido agora pelo Vite.
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
