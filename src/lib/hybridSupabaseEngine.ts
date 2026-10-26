import type { Tables } from './database.types'

interface HybridDb {
  perfiles: Tables<'perfiles'>[]
  perfil_roles: Tables<'perfil_roles'>[]
  perfil_regiones: Tables<'perfil_regiones'>[]
  camiones: Tables<'camiones'>[]
  cargas: Tables<'cargas'>[]
  ofertas: Tables<'ofertas'>[]
  viajes: Tables<'viajes'>[]
  resenas: Tables<'resenas'>[]
}

const DB_KEY = 'nortia_hybrid_db_v1'

function createSeedDb(): HybridDb {
  const now = new Date().toISOString()
  return {
    perfiles: [
      {
        id: 'seed-empresa-1',
        nombre: 'Roberto Valdés',
        razon_social: 'Frutícola Valle del Ñuble SpA',
        rut: '76.543.210-8',
        rubro: 'Agroindustria y Exportación',
        telefono: '+56 9 8234 5671',
        email: 'logistica@vallenuble.cl',
        rol: 'negocio',
        emite_factura: true,
        verificado: true,
        activo: true,
        avatar_url: null,
        rating_prom: 4.9,
        total_resenas: 34,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'seed-empresa-2',
        nombre: 'Carolina Soto',
        razon_social: 'Maderas Arauco Sur Ltda.',
        rut: '77.112.334-K',
        rubro: 'Forestal y Construcción',
        telefono: '+56 9 9123 4455',
        email: 'despacho@araucosur.cl',
        rol: 'negocio',
        emite_factura: true,
        verificado: true,
        activo: true,
        avatar_url: null,
        rating_prom: 4.8,
        total_resenas: 21,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'seed-camionero-1',
        nombre: 'Héctor Sepúlveda',
        razon_social: 'Transportes Sepúlveda EIRL',
        rut: '14.321.654-2',
        rubro: 'Transporte de Carga por Carretera',
        telefono: '+56 9 7654 3210',
        email: 'hector.ruta5@gmail.com',
        rol: 'camionero',
        emite_factura: true,
        verificado: true,
        activo: true,
        avatar_url: null,
        rating_prom: 5.0,
        total_resenas: 42,
        created_at: now,
        updated_at: now,
      },
    ],
    perfil_roles: [
      { perfil_id: 'seed-empresa-1', rol: 'negocio', created_at: now },
      { perfil_id: 'seed-empresa-2', rol: 'negocio', created_at: now },
      { perfil_id: 'seed-camionero-1', rol: 'camionero', created_at: now },
    ],
    perfil_regiones: [
      { perfil_id: 'seed-camionero-1', region_codigo: 16 },
      { perfil_id: 'seed-camionero-1', region_codigo: 8 },
      { perfil_id: 'seed-camionero-1', region_codigo: 13 },
    ],
    camiones: [
      {
        id: 'seed-camion-1',
        perfil_id: 'seed-camionero-1',
        tipo: 'rampla',
        carroceria: 'cerrada',
        patente: 'PJKW42',
        marca: 'Scania',
        modelo: 'R450 Streamline',
        anio: 2023,
        carga_max_kg: 28000,
        pallets: 26,
        largo_m: 13.6,
        ancho_m: 2.5,
        alto_m: 2.7,
        volumen_m3: 90,
        tiene_rampa: true,
        tiene_pulpo: true,
        tiene_grua: false,
        tiene_refrigeracion: false,
        ayuda_carga: true,
        activo: true,
        disponible: true,
        documentos_al_dia: true,
        foto_url: null,
        permiso_circulacion_url: 'verificado',
        revision_tecnica_url: 'verificado',
        soap_url: 'verificado',
        created_at: now,
        updated_at: now,
      },
    ],
    cargas: [
      {
        id: 'carga-nortia-101',
        cliente_id: 'seed-empresa-1',
        tipo_carga: 'Pallets de Manzanas de Exportación',
        descripcion: 'Carga paletizada lista en frigorífico de Chillán Viejo con destino a centro de distribución en Pudahuel.',
        peso_kg: 18500,
        volumen_m3: 55,
        pallets: 20,
        largo_m: null,
        ancho_m: null,
        alto_m: null,
        origen_texto: 'Chillán, Ñuble',
        origen_region: 16,
        origen_lat: -36.6063,
        origen_lng: -72.1034,
        destino_texto: 'Santiago (Pudahuel), RM',
        destino_region: 13,
        destino_lat: -33.4372,
        destino_lng: -70.6506,
        distancia_km: 403,
        fecha_retiro: new Date(Date.now() + 86400000).toISOString(),
        precio_referencia: 685000,
        tipo_vehiculo_sugerido: 'rampla',
        requiere_frio: true,
        requiere_rampa: false,
        requiere_grua: false,
        requiere_ayuda: false,
        ruta_id: null,
        estado: 'publicada',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'carga-nortia-102',
        cliente_id: 'seed-empresa-2',
        tipo_carga: 'Tableros Terciados & Madera Dimensionada',
        descripcion: 'Paquetes enzunchados para entrega en bodega comercial en Temuco. Carga con horquilla en planta.',
        peso_kg: 12000,
        volumen_m3: 38,
        pallets: 14,
        largo_m: null,
        ancho_m: null,
        alto_m: null,
        origen_texto: 'Concepción, Biobío',
        origen_region: 8,
        origen_lat: -36.8201,
        origen_lng: -73.0444,
        destino_texto: 'Temuco, La Araucanía',
        destino_region: 9,
        destino_lat: -38.7359,
        destino_lng: -72.5904,
        distancia_km: 295,
        fecha_retiro: new Date(Date.now() + 129600000).toISOString(),
        precio_referencia: 490000,
        tipo_vehiculo_sugerido: 'camion',
        requiere_frio: false,
        requiere_rampa: false,
        requiere_grua: false,
        requiere_ayuda: false,
        ruta_id: null,
        estado: 'publicada',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'carga-nortia-103',
        cliente_id: 'seed-empresa-1',
        tipo_carga: 'Insumos Agrícolas & Riego Tecnificado',
        descripcion: 'Despacho directo desde Puerto Valparaíso hacia fundo agrícola en Rancagua.',
        peso_kg: 4500,
        volumen_m3: 18,
        pallets: 6,
        largo_m: null,
        ancho_m: null,
        alto_m: null,
        origen_texto: 'Valparaíso, Valparaíso',
        origen_region: 5,
        origen_lat: -33.0472,
        origen_lng: -71.6127,
        destino_texto: 'Rancagua, O’Higgins',
        destino_region: 6,
        destino_lat: -34.1701,
        destino_lng: -70.7444,
        distancia_km: 198,
        fecha_retiro: new Date(Date.now() + 172800000).toISOString(),
        precio_referencia: 340000,
        tipo_vehiculo_sugerido: 'tres_cuartos',
        requiere_frio: false,
        requiere_rampa: true,
        requiere_grua: false,
        requiere_ayuda: true,
        ruta_id: null,
        estado: 'publicada',
        created_at: now,
        updated_at: now,
      },
    ],
    ofertas: [],
    viajes: [],
    resenas: [],
  }
}

function getDb(): HybridDb {
  let db: HybridDb
  try {
    const raw = localStorage.getItem(DB_KEY)
    db = raw ? JSON.parse(raw) : createSeedDb()
  } catch {
    db = createSeedDb()
  }

  // Sincronizar con nortia_users_db y nortia_local_camion_*
  try {
    const usersRaw = localStorage.getItem('nortia_users_db')
    if (usersRaw) {
      const usersMap = JSON.parse(usersRaw) as Record<
        string,
        { id: string; email: string; perfil: Tables<'perfiles'> | null; roles: string[] }
      >
      for (const u of Object.values(usersMap)) {
        if (u.perfil) {
          const idx = db.perfiles.findIndex((p) => p.id === u.id)
          if (idx >= 0) {
            db.perfiles[idx] = { ...db.perfiles[idx], ...u.perfil }
          } else {
            db.perfiles.push(u.perfil)
          }
        }
        for (const r of u.roles || []) {
          const exists = db.perfil_roles.some((pr) => pr.perfil_id === u.id && pr.rol === r)
          if (!exists) {
            db.perfil_roles.push({
              perfil_id: u.id,
              rol: r as Tables<'perfil_roles'>['rol'],
              created_at: new Date().toISOString(),
            })
          }
        }
        // Sincronizar camión local si existe
        const camRaw = localStorage.getItem(`nortia_local_camion_${u.id}`)
        if (camRaw) {
          const cam = JSON.parse(camRaw)
          const cIdx = db.camiones.findIndex((c) => c.perfil_id === u.id)
          const fullCam: Tables<'camiones'> = {
            activo: true,
            disponible: true,
            documentos_al_dia: true,
            largo_m: null,
            ancho_m: null,
            alto_m: null,
            volumen_m3: null,
            foto_url: null,
            permiso_circulacion_url: 'verificado',
            revision_tecnica_url: 'verificado',
            soap_url: 'verificado',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...cam,
          }
          if (cIdx >= 0) {
            db.camiones[cIdx] = fullCam
          } else {
            db.camiones.push(fullCam)
          }
        }
      }
    }
  } catch {}

  return db
}

function saveDb(db: HybridDb) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {}
}

function getActiveUserId(db: HybridDb): string {
  try {
    const activeEmail = localStorage.getItem('nortia_active_user_email')
    if (activeEmail) {
      const usersRaw = localStorage.getItem('nortia_users_db')
      if (usersRaw) {
        const usersMap = JSON.parse(usersRaw)
        const u = usersMap[activeEmail.toLowerCase()]
        if (u?.id) return u.id
      }
    }
  } catch {}
  return db.perfiles[0]?.id || 'local-user'
}

function enrichRow(table: string, row: Record<string, unknown>, selectParam: string, db: HybridDb): Record<string, unknown> {
  const result = { ...row }

  if (table === 'cargas' && selectParam.includes('ofertas(count)')) {
    const count = db.ofertas.filter((o) => o.carga_id === row.id && o.estado !== 'retirada').length
    result.ofertas = [{ count }]
  }

  if (table === 'ofertas') {
    if (selectParam.includes('perfiles:camionero_id')) {
      result.perfiles = db.perfiles.find((p) => p.id === row.camionero_id) || {
        nombre: 'Transportista NORTIA',
        rating_prom: 5.0,
        total_resenas: 12,
        verificado: true,
      }
    }
    if (selectParam.includes('camiones:camion_id')) {
      result.camiones =
        db.camiones.find((c) => c.id === row.camion_id) ||
        db.camiones.find((c) => c.perfil_id === row.camionero_id) || {
          tipo: 'camion',
          patente: 'NORTIA1',
          marca: 'Scania',
          modelo: 'R450',
        }
    }
  }

  if (table === 'viajes') {
    if (selectParam.includes('cargas:carga_id')) {
      result.cargas = db.cargas.find((c) => c.id === row.carga_id) || null
    }
    if (selectParam.includes('contraparte:cliente_id')) {
      result.contraparte = db.perfiles.find((p) => p.id === row.cliente_id) || null
    }
    if (selectParam.includes('contraparte:camionero_id')) {
      result.contraparte = db.perfiles.find((p) => p.id === row.camionero_id) || null
    }
  }

  if (table === 'resenas' && selectParam.includes('autor:autor_id')) {
    result.autor = db.perfiles.find((p) => p.id === row.autor_id) || { nombre: 'Usuario NORTIA' }
  }

  return result
}

function applyFilters(rows: Record<string, unknown>[], searchParams: URLSearchParams): Record<string, unknown>[] {
  let filtered = [...rows]

  for (const [key, val] of searchParams.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue

    if (val.startsWith('eq.')) {
      const target = val.slice(3)
      filtered = filtered.filter((r) => String(r[key]) === target)
    } else if (val.startsWith('neq.')) {
      const target = val.slice(4)
      filtered = filtered.filter((r) => String(r[key]) !== target)
    } else if (val.startsWith('in.(') && val.endsWith(')')) {
      const items = val
        .slice(4, -1)
        .split(',')
        .map((s) => s.replace(/^"|"$/g, ''))
      filtered = filtered.filter((r) => items.includes(String(r[key])))
    }
  }

  const orderParam = searchParams.get('order')
  if (orderParam) {
    const [col, dir] = orderParam.split('.')
    const asc = dir !== 'desc'
    filtered.sort((a, b) => {
      const va = String(a[col] ?? '')
      const vb = String(b[col] ?? '')
      return asc ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }

  const limitParam = searchParams.get('limit')
  if (limitParam) {
    const n = Number(limitParam)
    if (n > 0) filtered = filtered.slice(0, n)
  }

  return filtered
}

function handleLocalRequest(urlStr: string, init?: RequestInit): Response {
  const url = new URL(urlStr)
  const method = (init?.method || 'GET').toUpperCase()
  const headers = new Headers(init?.headers)
  const accept = headers.get('accept') || ''
  const isSingle = accept.includes('application/vnd.pgrst.object+json')
  const prefer = headers.get('prefer') || ''
  const isHeadCount = method === 'HEAD' || prefer.includes('count=exact')

  const bodyText = typeof init?.body === 'string' ? init.body : null
  const bodyJson = bodyText ? JSON.parse(bodyText) : null

  const db = getDb()

  // 1. Storage uploads
  if (url.pathname.includes('/storage/v1/object/')) {
    const pathParts = url.pathname.split('/storage/v1/object/')[1] || 'file'
    return new Response(JSON.stringify({ Key: pathParts, Id: 'local-' + Date.now() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Auth endpoints
  if (url.pathname.includes('/auth/v1/')) {
    return new Response(JSON.stringify({ user: null, session: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. RPC endpoints
  if (url.pathname.includes('/rest/v1/rpc/')) {
    const rpcName = url.pathname.split('/rest/v1/rpc/')[1]
    const activeUserId = getActiveUserId(db)
    const now = new Date().toISOString()

    if (rpcName === 'cargas_compatibles') {
      const publicadas = db.cargas.filter((c) => c.estado === 'publicada')
      return new Response(JSON.stringify(publicadas), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (rpcName === 'mis_ganancias') {
      const entregados = db.viajes.filter((v) => v.camionero_id === activeUserId && v.estado === 'entregado')
      const total = entregados.reduce(
        (acc, v) => acc + Math.max(0, (v.precio_final || 0) - (v.comision_monto || 0)),
        0,
      )
      return new Response(
        JSON.stringify([
          {
            ganancia_semana: total,
            ganancia_mes: total,
            viajes_semana: entregados.length,
            viajes_totales: entregados.length,
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (rpcName === 'aceptar_oferta') {
      const ofertaId = bodyJson?.p_oferta_id
      const oferta = db.ofertas.find((o) => o.id === ofertaId)
      if (!oferta) {
        return new Response(JSON.stringify({ message: 'Oferta no encontrada' }), { status: 400 })
      }
      oferta.estado = 'aceptada'
      oferta.updated_at = now
      for (const o of db.ofertas) {
        if (o.carga_id === oferta.carga_id && o.id !== oferta.id) {
          o.estado = 'rechazada'
        }
      }
      const carga = db.cargas.find((c) => c.id === oferta.carga_id)
      if (carga) {
        carga.estado = 'asignada'
        carga.updated_at = now
      }
      const comisionMonto = Math.round(oferta.precio * 0.12)
      const nuevoViaje: Tables<'viajes'> = {
        id: 'viaje-' + Math.random().toString(36).slice(2, 9),
        carga_id: oferta.carga_id,
        oferta_id: oferta.id,
        cliente_id: carga?.cliente_id || activeUserId,
        camionero_id: oferta.camionero_id,
        camion_id: oferta.camion_id,
        precio_final: oferta.precio,
        comision_pct: 12,
        comision_monto: comisionMonto,
        pagado: false,
        estado: 'asignado',
        fecha_inicio: null,
        fecha_entrega: null,
        created_at: now,
        updated_at: now,
      }
      db.viajes.unshift(nuevoViaje)
      saveDb(db)
      return new Response(JSON.stringify(nuevoViaje.id), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (rpcName === 'marcar_entregado') {
      const viajeId = bodyJson?.p_viaje_id
      const viaje = db.viajes.find((v) => v.id === viajeId)
      if (viaje) {
        viaje.estado = 'entregado'
        viaje.fecha_entrega = now
        viaje.updated_at = now
        const carga = db.cargas.find((c) => c.id === viaje.carga_id)
        if (carga) {
          carga.estado = 'entregada'
          carga.updated_at = now
        }
        saveDb(db)
      }
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (rpcName === 'cancelar_carga') {
      const carga = db.cargas.find((c) => c.id === bodyJson?.p_carga_id)
      if (carga) {
        carga.estado = 'cancelada'
        carga.updated_at = now
        saveDb(db)
      }
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (rpcName === 'retirar_oferta') {
      const oferta = db.ofertas.find((o) => o.id === bodyJson?.p_oferta_id)
      if (oferta) {
        oferta.estado = 'retirada'
        oferta.updated_at = now
        saveDb(db)
      }
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (rpcName === 'cancelar_viaje') {
      const viaje = db.viajes.find((v) => v.id === bodyJson?.p_viaje_id)
      if (viaje) {
        viaje.estado = 'cancelado'
        viaje.updated_at = now
        const carga = db.cargas.find((c) => c.id === viaje.carga_id)
        if (carga) carga.estado = 'publicada'
        saveDb(db)
      }
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // 4. Standard Table REST operations (/rest/v1/<table>)
  const tableMatch = url.pathname.match(/\/rest\/v1\/([a-z_]+)/)
  const tableName = (tableMatch?.[1] || '') as keyof HybridDb

  if (!tableName || !(tableName in db)) {
    return new Response(JSON.stringify(isSingle ? null : []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tableRows = db[tableName] as unknown as Record<string, unknown>[]
  const selectParam = url.searchParams.get('select') || '*'
  const now = new Date().toISOString()

  if (method === 'GET' || method === 'HEAD') {
    const matched = applyFilters(tableRows, url.searchParams).map((r) => enrichRow(tableName, r, selectParam, db))

    // Si un negocio nuevo aún no ha publicado cargas, mostrar también las cargas de ejemplo o las suyas
    if (isHeadCount && method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${Math.max(0, matched.length - 1)}/${matched.length}`,
        },
      })
    }

    if (isSingle) {
      const first = matched[0] ?? null
      return new Response(JSON.stringify(first), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(matched), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': `0-${Math.max(0, matched.length - 1)}/${matched.length}`,
      },
    })
  }

  if (method === 'POST') {
    const items = Array.isArray(bodyJson) ? bodyJson : [bodyJson]
    const inserted: Record<string, unknown>[] = []

    for (const item of items) {
      const newRow: Record<string, unknown> = {
        id: item.id || `${tableName.slice(0, 4)}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: now,
        updated_at: now,
        ...item,
      }
      if (tableName === 'cargas') {
        newRow.estado = item.estado || 'publicada'
        newRow.requiere_frio = Boolean(item.requiere_frio)
        newRow.requiere_rampa = Boolean(item.requiere_rampa)
        newRow.requiere_grua = Boolean(item.requiere_grua)
        newRow.requiere_ayuda = Boolean(item.requiere_ayuda)
        // Generar oferta automática de transportista verificado en corredor para permitir probar aceptación de inmediato
        const precioRef = Number(item.precio_referencia) || 450000
        db.ofertas.unshift({
          id: `ofer-${Math.random().toString(36).slice(2, 9)}`,
          carga_id: String(newRow.id),
          camionero_id: 'seed-camionero-1',
          camion_id: 'seed-camion-1',
          precio: precioRef,
          mensaje: 'Disponible en ruta con documentación SII y seguro de carga al día. Puedo retirar puntualmente.',
          estado: 'pendiente',
          created_at: now,
          updated_at: now,
        })
      }
      if (tableName === 'ofertas') {
        newRow.estado = item.estado || 'pendiente'
      }
      if (tableName === 'camiones') {
        newRow.activo = item.activo ?? true
        newRow.disponible = item.disponible ?? true
        newRow.documentos_al_dia = item.documentos_al_dia ?? true
      }
      tableRows.unshift(newRow)
      inserted.push(enrichRow(tableName, newRow, selectParam, db))
    }

    saveDb(db)
    const payload = isSingle ? inserted[0] ?? null : inserted
    return new Response(JSON.stringify(payload), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (method === 'PATCH') {
    const matched = applyFilters(tableRows, url.searchParams)
    for (const row of matched) {
      Object.assign(row, bodyJson, { updated_at: now })
      // Si un viaje pasa a en_ruta, actualizar también la carga asociada
      if (tableName === 'viajes' && bodyJson?.estado === 'en_ruta') {
        const carga = db.cargas.find((c) => c.id === row.carga_id)
        if (carga) {
          carga.estado = 'en_ruta'
          carga.updated_at = now
        }
      }
    }
    saveDb(db)
    const payload = isSingle ? matched[0] ?? null : matched
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (method === 'DELETE') {
    const matchedIds = new Set(applyFilters(tableRows, url.searchParams).map((r) => r.id))
    const remaining = tableRows.filter((r) => !matchedIds.has(r.id))
    ;(db[tableName] as unknown) = remaining
    saveDb(db)
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

let cloudOfflineUntil = 0

export async function hybridSupabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  // Si estamos usando una sesión local o sabemos que Supabase Cloud está en pausa, resolvemos instantáneamente en 0ms
  if (localStorage.getItem('nortia_active_user_email') || Date.now() < cloudOfflineUntil) {
    return handleLocalRequest(urlStr, init)
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2200)
    const res = await window.fetch(input, {
      ...init,
      signal: init?.signal || controller.signal,
    })
    clearTimeout(timer)
    return res
  } catch {
    // Marcar temporalmente offline por 60s para evitar esperas en cada llamada
    cloudOfflineUntil = Date.now() + 60_000
    return handleLocalRequest(urlStr, init)
  }
}
