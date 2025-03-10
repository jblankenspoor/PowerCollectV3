/**
 * Vite Environment Type Declarations
 * 
 * This file provides TypeScript type definitions for Vite's import.meta.env feature
 * 
 * @version 1.0.0
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_API_KEY: string;
  readonly VITE_CLAUDE_API_KEY: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
