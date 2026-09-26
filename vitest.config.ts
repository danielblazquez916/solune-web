import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/ui/**/*.test.tsx'],
    environment: 'jsdom',
    env: {
      VITE_CONTACT_API_URL: 'https://api.solune.dev/contact',
      VITE_TURNSTILE_SITE_KEY: 'test-public-site-key',
    },
  },
});
