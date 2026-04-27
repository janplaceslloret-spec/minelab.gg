import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy UI libs
          'vendor-gsap': ['gsap'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Dashboard core (siempre cargado al entrar a /panel)
          'dashboard-core': [
            './src/components/dashboard/DashboardLayout.jsx',
            './src/components/dashboard/MainContent.jsx',
            './src/components/dashboard/Sidebar.jsx',
            './src/components/dashboard/AIAssistantSidebar.jsx',
          ],
          // Console + console-related (la pestaña por defecto)
          'dashboard-console': [
            './src/components/dashboard/ConsoleView.jsx',
            './src/components/dashboard/PlayersView.jsx',
          ],
          // Files manager (más pesado, lazy)
          'dashboard-files': [
            './src/components/dashboard/FileManagerView.jsx',
          ],
          // Backups + Config (admin tools)
          'dashboard-admin': [
            './src/components/dashboard/BackupsView.jsx',
            './src/components/dashboard/ConfigView.jsx',
            './src/components/dashboard/SettingsView.jsx',
          ],
        }
      }
    }
  }
})
