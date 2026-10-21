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
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  })
  if (error) throw error

  if (bucket === 'documentos') return path

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Genera una URL firmada y temporal para ver o descargar documentos privados del bucket 'documentos'.
 */
export async function getSignedDocumentUrl(path: string | null, expiresIn = 3600): Promise<string | null> {
  if (!path) return null
  // Si ya es una URL completa pública o externa
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const { data, error } = await supabase.storage.from('documentos').createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) {
    console.error('Error al generar URL firmada de documento:', error)
    return null
  }
  return data.signedUrl
}
