/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_SUPABASE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 