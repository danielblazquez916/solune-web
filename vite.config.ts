import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build') {
    if (mode !== 'production') throw new Error('Only production builds may be deployed.');
    if (env.VITE_CONTACT_API_URL !== 'https://api.solune.dev/contact')
      throw new Error('Set VITE_CONTACT_API_URL to the production Solune API.');
    if (!/^0x[\w-]+$/.test(env.VITE_TURNSTILE_SITE_KEY || ''))
      throw new Error('Set VITE_TURNSTILE_SITE_KEY to the real public widget key.');
    for (const key of ['VITE_SITE_URL', 'VITE_LEGAL_WEBSITE'])
      if (env[key] && env[key] !== 'https://solune.dev')
        throw new Error(`${key} must use the production Solune domain.`);
    if (
      Object.keys(env).some((key) => /SECRET|PASSWORD|PRIVATE|RESEND|API_KEY|API_TOKEN/i.test(key))
    )
      throw new Error('A private credential name uses the public VITE_ prefix.');
  }
  return {
    plugins: [react()],
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
