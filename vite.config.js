import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace this with your actual ngrok domain
const NGROK_DOMAIN = '6e453725ef90.ngrok-free.app';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [NGROK_DOMAIN, 'localhost', '127.0.0.1'],
    port: 5173,
  },
});
