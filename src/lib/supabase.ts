import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('TU_PROYECTO')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.\n' +
    'Copia .env.example a .env o .env.local y añade tus credenciales de Supabase.'
  )
}

// Fallback dummy URL to prevent createClient from crashing if env vars are missing on fresh clone
const safeUrl = supabaseUrl || 'https://placeholder-project.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient(safeUrl, safeKey)
