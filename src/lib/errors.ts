export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  if (typeof err === 'string') return err
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
