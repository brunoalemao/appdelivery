import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'zustand',
      'framer-motion',
      '@supabase/supabase-js',
    ],
  },
  build: {
    target: 'esnext', // Otimiza para navegadores modernos
    minify: 'terser', // Usa terser para minificação mais agressiva
    cssMinify: true,
    rollupOptions: {
      output: {
        // Usando a forma de função para manualChunks em vez de objeto
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            if (id.includes('framer-motion') || id.includes('react-hot-toast')) {
              return 'ui-libs';
            }
            if (id.includes('zustand') || id.includes('@supabase/supabase-js')) {
              return 'data-libs';
            }
            return 'vendor'; // outros pacotes de terceiros
          }
        }
      },
    },
    // Otimiza o tamanho final do bundle
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  // Otimizações para desenvolvimento
  server: {
    hmr: {
      overlay: true,
      // Configurações para evitar recargas desnecessárias
      timeout: 5000,
    },
  },
  // Evita recargas desnecessárias
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
