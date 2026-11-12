import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages は リポジトリ名のサブパス (https://<user>.github.io/Calculator/) で配信される
  base: '/Calculator/',
  plugins: [react(), tailwindcss()],
})
