import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
        'Content-Security-Policy': `
            default-src 'self';
            script-src 'self' https://accounts.google.com https://apis.google.com https://cdn.jsdelivr.net;
            style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
            connect-src 'self' https://student-management-backend-a2q4.onrender.com https://play.google.com https://accounts.google.com;
            img-src 'self' https://*.googleusercontent.com;
            frame-src 'self' https://accounts.google.com;
        `,
    },
},
});
