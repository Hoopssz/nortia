import { Icon } from './Icon'
import type { Tables } from '../lib/database.types'

interface ModoCabinaModalProps {
  isOpen: boolean
  viaje: Tables<'viajes'>
  carga: Tables<'cargas'>
  otraParte: Tables<'perfiles'> | null
  onClose: () => void
  onCambiarEstado: (nuevoEstado: 'en_ruta' | 'entregado') => void
  onOpenGuia?: () => void
  onOpenSos?: () => void
  onOpenChat?: () => void
  actualizando: boolean
}

export function ModoCabinaModal({
  isOpen,
  viaje,
  carga,
  otraParte,
  onClose,
  onCambiarEstado,
  onOpenGuia,
  onOpenSos,
  onOpenChat,
  actualizando,
}: ModoCabinaModalProps) {
  if (!isOpen) return null

  const destinoTexto = carga.destino_texto
  const origenTexto = carga.origen_texto

  // Enlaces de navegación con coordenadas o dirección
  const wazeUrl = carga.destino_lat && carga.destino_lng
    ? `https://waze.com/ul?ll=${carga.destino_lat},${carga.destino_lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(destinoTexto + ', Chile')}`

  const gmapsUrl = carga.destino_lat && carga.destino_lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${carga.destino_lat},${carga.destino_lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinoTexto + ', Chile')}`

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
    >
      {/* Barra Superior Cabina */}
      <div className="between" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 22 }}>🚛</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5, color: '#38BDF8' }}>
            MODO CABINA NORTIA
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Salir ✕
        </button>
      </div>

      {/* Tarjeta de Destino Gigante de Alto Contraste */}
      <div
        style={{
          background: '#1E293B',
          borderRadius: 20,
          padding: '20px 18px',
          border: '2px solid #334155',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
          DESTINO DE ENTREGA
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#F8FAFC', marginTop: 4, lineHeight: 1.2 }}>
          {destinoTexto}
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
          Desde: {origenTexto} · {carga.peso_kg.toLocaleString('es-CL')} kg
          {carga.distancia_km ? ` · 📍 ${carga.distancia_km} km` : ''}
        </div>
      </div>

      {/* Botones Gigantes de Navegación GPS (Waze y Google Maps) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#265370',
            color: '#FFFFFF',
            borderRadius: 18,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span style={{ fontSize: 24, marginBottom: 4 }}>🧭</span>
          Abrir en Waze
        </a>

        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#059669',
            color: '#FFFFFF',
            borderRadius: 16,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span style={{ fontSize: 24, marginBottom: 4 }}>🗺️</span>
          Google Maps
        </a>
      </div>

      {/* Canal de Comunicación Oficial NORTIA (Protegido por Escrow) */}
      {onOpenChat && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={onOpenChat}
            style={{
              width: '100%',
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#FFFFFF',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            <Icon name="message" size={18} strokeWidth={2.2} />
            Chat Oficial con {otraParte?.nombre || 'el Cliente'}
          </button>
          <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icon name="shield" size={12} color="#10B981" />
            Comunicación oficial auditada y respaldada por NORTIA Escrow
          </div>
        </div>
      )}

      {/* Botón de Guía de Despacho SII en Cabina */}
      {onOpenGuia && (
        <button
          type="button"
          onClick={onOpenGuia}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
            color: '#FFFFFF',
            borderRadius: 16,
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            border: 'none',
            fontWeight: 800,
            fontSize: 14,
            marginBottom: 16,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span style={{ fontSize: 20 }}>📄</span>
          <span>MOSTRAR GUÍA SII (FISCALIZACIÓN)</span>
        </button>
      )}

      {/* Botón de Emergencia SOS en Cabina */}
      {onOpenSos && (
        <button
          type="button"
          onClick={onOpenSos}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            color: '#FFFFFF',
            borderRadius: 16,
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            border: 'none',
            fontWeight: 800,
            fontSize: 14,
            marginBottom: 16,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span style={{ fontSize: 20 }}>🚨</span>
          <span>REPORTAR IMPREVISTO / SOS EN RUTA</span>
        </button>
      )}

      {/* Botón de Estado del Viaje Gigante */}
      <div style={{ marginTop: 'auto', paddingTop: 10 }}>
        {viaje.estado === 'asignado' && (
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: 17,
              fontWeight: 900,
              background: '#2563EB',
              borderRadius: 18,
            }}
            disabled={actualizando}
            onClick={() => onCambiarEstado('en_ruta')}
          >
            {actualizando ? 'Actualizando…' : '🚚 SALIR A RUTA / INICIAR VIAJE'}
          </button>
        )}

        {viaje.estado === 'en_ruta' && (
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: 17,
              fontWeight: 900,
              background: '#059669',
              borderRadius: 18,
            }}
            disabled={actualizando}
            onClick={() => onCambiarEstado('entregado')}
          >
            {actualizando ? 'Confirmando…' : '✅ CONFIRMAR ENTREGA EN DESTINO'}
          </button>
        )}

        {viaje.estado === 'entregado' && (
          <div
            style={{
              background: '#064E3B',
              color: '#6EE7B7',
              borderRadius: 18,
              padding: '16px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            ✓ VIAJE COMPLETADO CON ÉXITO
          </div>
        )}
      </div>
    </div>
  )
}
