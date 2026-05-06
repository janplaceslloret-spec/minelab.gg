import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin: elimina el atributo crossorigin de los <link>/<script> en index.html.
// Vite lo añade por defecto pero hace que algunos navegadores cacheen una versión
// truncada del recurso bajo ciertos fallos de red, dejando la página sin estilos
// hasta limpiar la caché manualmente. Como nuestros assets son same-origin no es
// necesario y produce este bug.
const stripCrossorigin = {
  name: 'strip-crossorigin',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(/\s+crossorigin(="[^"]*")?/g, '')
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    stripCrossorigin,
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://46.225.115.78:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    // Disable crossorigin attribute on assets - evita corrupción de caché en algunos navegadores
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy UI libs
          'vendor-gsap': ['gsap'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Dashboard (only loaded on /panel)
          'dashboard': [
            './src/components/dashboard/DashboardLayout.jsx',
            './src/components/dashboard/MainContent.jsx',
            './src/components/dashboard/Sidebar.jsx',
            './src/components/dashboard/ConsoleView.jsx',
            './src/components/dashboard/BackupsView.jsx',
            './src/components/dashboard/ConfigView.jsx',
            './src/components/dashboard/PlayersView.jsx',
            './src/components/dashboard/SettingsView.jsx',
            './src/components/dashboard/AIAssistantSidebar.jsx',
          ],
          // FileManagerView con CodeMirror (lazy on demand)
          'file-editor': [
            './src/components/dashboard/FileManagerView.jsx',
            '@uiw/react-codemirror',
            '@codemirror/lang-yaml',
            '@codemirror/lang-json',
            '@codemirror/lang-javascript',
            '@codemirror/theme-one-dark',
          ],
        }
      }
    }
  }
})
