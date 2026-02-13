import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_CONFIG_MESSAGE =
  'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example), then restart the dev server.'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(SUPABASE_CONFIG_MESSAGE)
  }
  return createBrowserClient(url, key)
}

/** Use in client components to show a message when Supabase env vars are missing. */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
