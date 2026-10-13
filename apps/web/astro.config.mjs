// @ts-check
import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  // Pages are static by default. Server islands and pages that set
  // `export const prerender = false` render on demand through this adapter.
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  // Keep classic HTML whitespace. Astro 7's default ('jsx') drops the space at a
  // line break between text and an inline element, which silently glues words together.
  compressHTML: true,
  env: {
    schema: {
      // Where the server reaches FastAPI (inside Docker this is http://api:8000).
      API_URL: envField.string({ context: 'server', access: 'public', default: 'http://localhost:8000' }),
      // Where browsers reach FastAPI.
      PUBLIC_API_URL: envField.string({ context: 'client', access: 'public', default: 'http://localhost:8000' }),
    },
  },
});
