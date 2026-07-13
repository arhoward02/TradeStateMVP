import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'node:fs'
import path from 'node:path'

// Public anon defaults for the Trade Study Gallery Supabase project.
// Prefer Vercel / .env values; these keep production working if env is unset.
const DEFAULT_SUPABASE_URL = 'https://xjcnqnpliajkliwhtcfr.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY25xbnBsaWFqa2xpd2h0Y2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MjUwMDgsImV4cCI6MjA5OTQwMTAwOH0.RkUWTcC_n_7K7SLB7PRRTjwD2KlAmzI8SLQAHpfZ5L0'

function studyConfigPlugin(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  const config = {
    supabaseUrl: env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  }

  const writeConfig = () => {
    const out = path.resolve('public/study-config.js')
    fs.writeFileSync(
      out,
      `window.__STUDY_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`,
    )
  }

  return {
    name: 'study-config',
    buildStart: writeConfig,
    configureServer() {
      writeConfig()
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

  return {
    plugins: [svelte(), studyConfigPlugin(mode)],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    server: {
      port: 3000,
    },
  }
})
