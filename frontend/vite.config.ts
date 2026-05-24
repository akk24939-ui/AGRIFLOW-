import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-is', 'recharts', 'zustand', 'react-hook-form', 'zod', '@hookform/resolvers/zod'],
  },
  build: {
    commonjsOptions: { include: [/react-is/, /node_modules/] },
  },
})

