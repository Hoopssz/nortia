# CLAUDE.md — Contexto maestro del proyecto NORTIA

> Este archivo es el manual de contexto para Claude Code. Léelo completo antes de
> escribir cualquier código. Contiene el negocio, la estrategia, el diseño, la
> arquitectura técnica y las decisiones ya tomadas. Si algo en el código contradice
> este documento, este documento manda (salvo que el usuario indique lo contrario).

---

## 1. QUÉ ES NORTIA (resumen de una línea)

NORTIA es una plataforma marketplace que conecta a quienes necesitan mover carga
(negocios y proveedores) con transportistas independientes (camioneros) en Chile,
cobrando una comisión por cada flete concretado.

**Tagline oficial:** "Cada carga encuentra su norte."

**Nombre:** NORTIA (se escribe con punto en el logo: "NORTIA."). Juega con "norte",
"orientación" y logística.

---

## 2. EL PROBLEMA QUE RESOLVEMOS

En Chile, el transporte de carga para pequeñas y medianas necesidades sigue funcionando
de forma informal: por teléfono, contactos personales y boca a boca. Esto genera:

- Camioneros independientes (más de 30.000 en Chile) que pelean por migajas de carga
  mientras las grandes empresas capturan el 95% del negocio formal.
- Alto porcentaje de camiones viajando vacíos o a media capacidad.
- Negocios que no saben a quién recurrir para un flete puntual y confiable.
- Falta total de transparencia: no se sabe el peso real de la carga, si el camión es
  adecuado, quién paga qué, si el transportista es confiable.

**El competidor principal es FEX** ("el Uber de los fletes"), más inDrive y Fleteretorno.
La debilidad documentada de FEX, que es nuestra oportunidad, es la FALTA DE INFORMACIÓN
Y TRANSPARENCIA: el camionero no sabe el peso/volumen de la carga, el cliente no sabe si
el camión sirve, no hay claridad de pagos ni de quién ayuda en la carga/descarga.

---

## 3. NUESTRA VENTAJA COMPETITIVA (el corazón de todo)

**CONFIANZA Y TRANSPARENCIA TOTAL.** Todo lo que construyamos debe reforzar esto:

1. **Match preciso por specs reales del camión.** Un camionero NUNCA debe ver una carga
   que no le cabe físicamente. Cruzamos peso, volumen, dimensiones, equipamiento
   (frío, rampa, grúa) y región. Esto ya está implementado en la base de datos
   (función `cargas_compatibles`). Es el diferenciador #1 contra FEX.

2. **Perfiles verificados y reseñas bidireccionales.** El cliente califica al camionero
   y el camionero califica al cliente. Ambos lados construyen reputación. Documentos del
   vehículo (permiso de circulación, revisión técnica, SOAP) suben para verificación.

3. **Transparencia de pago.** El perfil del negocio muestra su seriedad de pago
   (rapidez, si emite factura). El camionero sabe con quién se mete antes de aceptar.

---

## 4. MODELO DE NEGOCIO

- **Ingreso:** comisión por transacción sobre cada flete concretado.
- **Comisión actual:** 12% (configurable; está en la columna `comision_pct` de la tabla
  `viajes`, con default 12.00). Se calcula automáticamente en `comision_monto`.
- **Quién paga la comisión:** se descuenta del pago al camionero (para bajar la fricción
  de adopción del lado de la demanda). Esto es una decisión de producto, revisable.
- **Futuro:** plan de suscripción para clientes con volumen recurrente (proveedores),
  con comisión reducida + tarifa mensual fija.

---

## 5. LOS TRES ROLES (arquitectura central del producto)

NORTIA es un marketplace de DOS LADOS con TRES roles. Un mismo login, tres experiencias
distintas. El campo `rol` en la tabla `perfiles` decide qué interfaz carga la app.

### LADO DEMANDA (publican carga, necesitan camión)

**NEGOCIO** (`rol = 'negocio'`)
- Necesita mover carga, generalmente en fletes PUNTUALES.
- Acción principal de su home: "Publicar una carga".
- Registro corto (menos fricción = más conversión): datos empresa, rubro, facturación
  (RUT, forma de pago, frecuencia), región. NO registra camión.
- Ve: publicar carga, seguir envíos activos, recibir y elegir ofertas.

**PROVEEDOR** (`rol = 'proveedor'`)
- Ej: distribuidor de alimentos. En el fondo TAMBIÉN necesita camión (como el negocio),
  pero su necesidad es DISTRIBUCIÓN RECURRENTE, no fletes sueltos.
- Diferencia clave: rutas fijas (Lun/Mié/Vie), multi-parada, horarios, cadena de frío.
- Acción principal de su home: "Programar una ruta".
- Registro: datos, producto (alimentos frescos/congelados/etc.), requisitos (cadena de
  frío, multi-parada, horario), configurar primera ruta recurrente, región.
- Ve: gestor de rutas recurrentes, camioneros de confianza, cadena de frío.

### LADO OFERTA (busca carga, tiene camión)

**CAMIONERO** (`rol = 'camionero'`)
- Tiene camión y busca carga. Es el opuesto exacto del negocio.
- Acción principal de su home: "Buscar carga" + widget de GANANCIAS + toggle
  Disponible/No disponible.
- Registro MÁS LARGO (justificado, porque estos datos alimentan el match):
  1. Datos personales
  2. Tipo y medidas del camión (tipo, dimensiones de carga L×A×H, volumen)
  3. Capacidad y equipamiento (carga máx kg, pallets, rampa, pulpo/amarras, grúa,
     refrigeración, ayuda en carga/descarga)
  4. Documentos (patente, permiso circulación, revisión técnica, SOAP, foto del camión)
  5. Región donde opera
- Nunca ve "publicar carga". Ve cargas compatibles con SU camión.

**REGLA DE ORO DE PROGRAMACIÓN:** las specs del camión y los requisitos de la carga NO
son texto libre — son campos estructurados (números, booleanos) porque de ellos depende
el motor de match. Respetar los tipos definidos en la base de datos.

---

## 6. ESTRATEGIA DE LANZAMIENTO (contexto de negocio crítico)

- **Validación primero, app después.** El fundador (Ernesto) valida en terreno en
  CHILLÁN, región de Ñuble, durante vacaciones de universidad. Tiene casa gratis allá
  (de su socio) y auto propio, así que costos casi cero.
- **Ñuble es agrícola y forestal**, con camioneros que trabajan a la antigua. FEX casi
  no existe ahí. Terreno sin competencia real. Por eso Ñuble (código de región 16) es
  el mercado de arranque y aparece preseleccionado en los diseños.
- **Enfoque inicial: B2B regional**, no B2C urbano masivo. Un cliente B2B vale ~10x uno
  B2C, paga mejor y es más leal.
- **Construir primero la OFERTA** (camioneros): están desesperados por carga, si les das
  trabajo real son leales y atraen a más camioneros.
- **MVP recomendado:** lanzar Negocio + Camionero funcionando 100% primero. El módulo de
  rutas recurrentes del Proveedor (lo más complejo) se deja para v2; mientras tanto el
  proveedor puede usar el flujo de "publicar carga" puntual del negocio.
- **Meta del viaje de validación:** salir de Chillán con ~5 camioneros dispuestos y
  ~3 empresas dispuestas a probar. Los primeros fletes se coordinan a mano (WhatsApp)
  antes de depender de la app.

---

## 7. IDENTIDAD VISUAL Y DISEÑO

**Marca:**
- Color primario (azul marino): `#265370`
- Blanco: `#FFFFFF`
- SIN otros colores de marca. Todo el diseño es azul marino + blanco + neutros/grises.

**Estética (estilo Apple):**
- Limpio, mucho espacio en blanco, minimalista, profesional.
- Esquinas MUY redondeadas (radios generosos: tarjetas ~24-26px, botones ~18px,
  teléfono ~44px).
- Botones circulares negros/azul marino para acciones principales.
- Tarjetas tipo "pill" para datos (capacidad, distancia, rating).
- Tipografía sans-serif del sistema (-apple-system / SF Pro), pesos bien diferenciados.
- Tabs con subrayado en el activo.
- Debe ser tan simple que un camionero de 50 años lo entienda sin tutorial.

**Pantallas ya diseñadas (existen como prototipos HTML de referencia):**
1. Bienvenida / splash (azul marino, la N, "Mueve tu carga con confianza", botón Comenzar)
2. Selección de rol (Negocio / Camionero / Proveedor)
3. Mapa interactivo de Chile por regiones — SILUETAS GEOGRÁFICAS REALES de las 16
   regiones, cada una clickeable, se pintan de azul al seleccionar. Chile es largo y
   angosto → el mapa va en scroll vertical, con lista lateral de regiones + conteo de
   transportistas.
4. Paso "regiones se desprenden": las regiones elegidas se separan del mapa y crecen
   como siluetas libres (SIN recuadro/marco), con animación minimalista estilo Apple
   (fade del mapa + rise escalonado). Los textos no se solapan, cada uno con su aire.
5. Registro del camión (3 pantallas de specs) — SOLO para camionero.
6. Menús por rol (los 3 homes lado a lado, cada uno distinto).
7. Perfiles de los 3 roles (camionero muestra camión+specs, negocio muestra volumen y
   seriedad de pago, proveedor muestra rutas y cadena de frío). El detalle de perfil se
   abre al TOCAR un usuario, no es una pantalla de inicio.

**Prototipos de flujo completo (registro → app funcional) existen como 3 archivos HTML
interactivos y animados, uno por rol.** Úsalos como referencia viva de UX y transiciones.

**Nota sobre las siluetas del mapa:** se generaron desde geojson oficial de las 16
regiones de Chile (fuente: repos públicos de geometría de Chile), unidas por región,
recortadas a Chile continental (se excluyó Isla de Pascua y la Antártica), simplificadas
(~1km de tolerancia) y proyectadas a SVG. El SVG resultante mide 380×1897 aprox.

---

## 8. ARQUITECTURA TÉCNICA

### Stack recomendado
- **Frontend:** empezar como app web (PWA) para validar rápido en Chillán sin pasar por
  App Store / Google Play. Se comparte por link de WhatsApp, se instala en pantalla de
  inicio. Cuando se valide, migrar/expandir a React Native + Expo para nativo iOS+Android.
  Framework web sugerido: React (Vite) o Next.js. Decisión final del desarrollador.
- **Backend / DB / Auth / Storage:** Supabase (YA CONFIGURADO, ver abajo).
- **Mapas y rutas:** Mapbox o Google Maps (pendiente de integrar).
- **Pagos / comisión en Chile:** Transbank o Mercado Pago (pendiente, fase posterior).

### Supabase — YA ESTÁ CONSTRUIDO
- **Proyecto:** "Nortia", región `sa-east-1` (São Paulo, la más cercana a Chile).
- **Project ref/id:** `rivnzbqnugqwgqcxpxxd`
- **URL:** `https://rivnzbqnugqwgqcxpxxd.supabase.co`
- **Publishable key (para el cliente):** `sb_publishable_V0vg6OQXQUoAxbrFoUOJ2A_4gL8LBaX`
  (Nunca pongas la service_role key en el frontend. La publishable/anon es la correcta
  para la app cliente.)
- **Plan:** Free (suficiente para validar: 50.000 usuarios activos/mes, 500MB DB, 1GB
  storage).
- **Auth:** Email habilitado. Para validación conviene desactivar "Confirm email" para
  que el registro sea inmediato. A futuro: login por teléfono/SMS (ideal para camioneros,
  pero tiene costo por mensaje).

### Esquema de base de datos (9 tablas, todas con RLS activado)

Enums definidos:
- `rol_usuario`: negocio | camionero | proveedor
- `tipo_vehiculo`: camioneta | tres_cuartos | camion | rampla | refrigerado | plano
- `tipo_carroceria`: cerrada | abierta | toldo
- `estado_carga`: borrador | publicada | asignada | en_ruta | entregada | cancelada
- `estado_oferta`: pendiente | aceptada | rechazada | retirada
- `estado_viaje`: asignado | en_ruta | entregado | cancelado

Tablas:
- `regiones` — 16 regiones de Chile (código, nombre, orden norte-sur). Ya pobladas.
- `perfiles` — 1:1 con auth.users. rol, nombre, teléfono, razón social, RUT, rubro,
  emite_factura, verificado, rating_prom, total_resenas. Se crea solo al registrarse
  (trigger handle_new_user).
- `perfil_regiones` — regiones donde opera cada usuario (N:N con regiones).
- `camiones` — specs completas: tipo, patente, dimensiones (largo/ancho/alto/volumen),
  carga_max_kg, pallets, carrocería, booleanos de equipamiento (tiene_rampa, tiene_pulpo,
  tiene_grua, tiene_refrigeracion, ayuda_carga), URLs de documentos, disponible.
- `cargas` — publicadas por negocio/proveedor: origen/destino (texto + región + lat/lng),
  distancia, descripción, peso_kg, volumen, dimensiones, pallets, requisitos
  (requiere_frio/rampa/grua/ayuda), tipo_vehiculo_sugerido, fecha_retiro,
  precio_referencia, estado.
- `rutas_recurrentes` — rutas fijas del proveedor: días de semana (array), hora, paradas,
  región, requiere_frio.
- `ofertas` — camionero postula a una carga: precio, mensaje, estado. Única por
  (carga, camionero).
- `viajes` — el match cerrado. precio_final, comision_pct (default 12), comision_monto
  (calculado), pagado, estado, fechas. Único por carga.
- `resenas` — bidireccional. viaje, autor, destinatario, puntuación 1-5, comentario.
  No autoreseña. Solo tras viaje 'entregado'.

Funciones (RPC) ya creadas:
- `cargas_compatibles(p_camion_id)` — EL MOTOR DE MATCH. Devuelve solo cargas que ese
  camión puede llevar (peso, volumen, equipamiento, región, no propias).
- `aceptar_oferta(p_oferta_id)` — crea el viaje, marca carga asignada, rechaza el resto
  de ofertas. Valida que solo el dueño de la carga acepte.
- `completar_registro(rol, nombre, telefono, regiones[], razon_social, rut, rubro)` —
  cierra el registro en un paso.
- `mis_ganancias()` — resumen de ganancias del camionero (semana, mes, viajes).
- `marcar_entregado(p_viaje_id)` — cierra el viaje y marca la carga entregada.

Storage (buckets):
- `avatares` (público) — fotos de perfil. Ruta: {user_id}/archivo.
- `camiones` (público) — fotos de camión. Ruta: {user_id}/archivo.
- `documentos` (privado) — permiso circulación, revisión técnica, SOAP. Solo el dueño
  los ve; la verificación la hace el equipo NORTIA aparte.

Seguridad (RLS) — ya aplicada y auditada:
- Cada usuario edita solo su perfil, sus camiones, sus cargas, sus rutas.
- Perfiles y camiones son visibles para autenticados (necesario para el marketplace).
- Cargas: las 'publicada' visibles a todos; las propias siempre; el camionero asignado
  ve la suya.
- Ofertas: visibles solo al camionero que ofertó y al dueño de la carga.
- Viajes: solo las dos partes.
- Reseñas: solo se escriben tras viaje entregado; no autoreseña.
- Funciones de la app: solo ejecutables por usuarios autenticados (no anónimos).

---

## 9. QUÉ FALTA CONSTRUIR (roadmap para Claude Code)

Prioridad para el MVP de validación en Chillán (Negocio + Camionero primero):

1. **Auth + onboarding:** pantalla splash, login/registro email, selección de rol,
   selector de regiones con el mapa de Chile, y el registro extra de camión si rol =
   camionero. Usar `completar_registro`.
2. **Home por rol:** cargar interfaz según `perfiles.rol`.
3. **Negocio:** formulario "publicar carga" (con todos los campos que alimentan el match),
   lista de mis cargas, ver ofertas recibidas, aceptar oferta (`aceptar_oferta`).
4. **Camionero:** registrar/editar camión + subir foto y documentos a Storage, toggle
   disponible, lista de cargas compatibles (`cargas_compatibles`), postular oferta,
   panel de ganancias (`mis_ganancias`).
5. **Perfiles** con reseñas y verificación.
6. **Cierre de viaje + reseña bidireccional** (`marcar_entregado`, insertar reseña).
7. **v2:** rutas recurrentes del proveedor, mapas/rutas reales, pagos y cobro de comisión,
   notificaciones (idealmente WhatsApp/SMS), migración a app nativa.

---

## 10. PRINCIPIOS AL PROGRAMAR (léelos siempre)

- **Conéctate a la base existente y respeta su esquema.** No inventes tablas nuevas sin
  necesidad; primero revisa lo que ya existe con las herramientas de Supabase.
- **El match es sagrado:** todo campo de specs/requisitos es estructurado y tipado.
- **Menos fricción en el registro del lado demanda** (negocio/proveedor); está bien pedir
  más al camionero.
- **Diseño:** azul marino #265370 + blanco, estilo Apple, esquinas muy redondeadas,
  simple para usuarios no técnicos. Respeta los prototipos HTML de referencia.
- **Español de Chile** en toda la interfaz. Tono cercano y claro, no corporativo.
- **Mobile-first.** La mayoría de los usuarios entran desde el celular.
- **Seguridad:** nunca exponer la service_role key en el cliente. Confiar en RLS.
- **Pensar siempre en Chillán/Ñuble como el primer mercado real.**

---

## 11. DATOS DEL FUNDADOR / CONTACTO DE PRODUCTO

- Fundador: Ernesto Espindola. Tiene un socio con casa en Chillán.
- Organización Supabase: Nortia.org
- Equipo Vercel: "Nortia" (slug: nortiacl) — listo para desplegar, sin proyectos aún.
- Cuenta Figma: plan Starter, actualmente con asiento "View" (solo lectura); para editar
  diseños en Figma habría que cambiar a asiento Editor.

---

FIN DEL CONTEXTO. Si vas a construir, empieza por leer el esquema real de Supabase para
confirmar que todo lo descrito aquí sigue vigente, y luego arranca por el MVP
(Negocio + Camionero) descrito en la sección 9.
