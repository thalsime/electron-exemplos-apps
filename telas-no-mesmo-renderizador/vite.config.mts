import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

// Não há preload nem IPC: a troca de telas acontece inteira no renderizador,
// e o processo principal só abre a janela.
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
});
