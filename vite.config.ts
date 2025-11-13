import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts: [],
    },
    preview: {
      port: 5173,
    },
  };
});
