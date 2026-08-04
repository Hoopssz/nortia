import { supabase } from './supabase'

export function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const base = lastDot > 0 ? name.slice(0, lastDot) : name
  const ext = lastDot > 0 ? name.slice(lastDot + 1) : ''
  const safeBase = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'archivo'
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

export async function uploadToBucket(bucket: 'avatares' | 'camiones' | 'documentos', path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error

  if (bucket === 'documentos') return path

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
