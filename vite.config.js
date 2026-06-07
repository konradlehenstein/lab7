import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { glob } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const inputs = [];

for await (const entry of glob('src/**/*.html')) {
  console.log(resolve(__dirname, entry));
  inputs.push(resolve(__dirname, entry));
}

export default defineConfig({
  plugins: [],
  base: '/lab7/',
  root: resolve(__dirname, 'src'),

  root: resolve(__dirname, 'src'),
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,
    },
    outDir: resolve(__dirname, 'dist'),
  },
})
