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
            './src/components/dashboard/FileManagerView.jsx',
            './src/components/dashboard/ConfigView.jsx',
            './src/components/dashboard/PlayersView.jsx',
            './src/components/dashboard/SettingsView.jsx',
            './src/components/dashboard/AIAssistantSidebar.jsx',
          ],
        }
      }
    }
  }
})
