// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Vercel runs the app as serverless functions, so it needs its own adapter.
// Every other environment (local dev, Docker, any VPS) keeps the standalone
// Node server, which is what `npm run build --workspace=apps/web` produces by
// default and what `node dist/server/entry.mjs` serves.
const isVercel = Boolean(process.env.VERCEL);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
