import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function decapAdminPrettyPathPlugin() {
  const adminHtmlPath = resolve(process.cwd(), 'public/admin/index.html')

  function handleAdminPath(req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body: string) => void }, next: () => void) {
    const url = req.url?.split('?')[0]
    if (url !== '/admin' && url !== '/admin/') {
      next()
      return
    }

    const html = readFileSync(adminHtmlPath, 'utf8')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  }

  return {
    name: 'decap-admin-pretty-path',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use(handleAdminPath)
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use(handleAdminPath)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [decapAdminPrettyPathPlugin(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) return 'vendor-gsap';
          if (id.includes('node_modules/react-icons')) return 'vendor-icons';
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) return 'vendor-react';
        },
      },
    },
  },
})
