import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { hybridSupabaseFetch } from './hybridSupabaseEngine'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    fetch: hybridSupabaseFetch,
  },
})

