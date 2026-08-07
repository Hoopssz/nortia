export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      camiones: {
        Row: {
          activo: boolean
          alto_m: number | null
          ancho_m: number | null
          anio: number | null
          ayuda_carga: boolean
          carga_max_kg: number
          carroceria: Database["public"]["Enums"]["tipo_carroceria"] | null
          created_at: string
          disponible: boolean
          documentos_al_dia: boolean
          foto_url: string | null
          id: string
          largo_m: number | null
          marca: string | null
          modelo: string | null
          pallets: number | null
          patente: string
          perfil_id: string
          permiso_circulacion_url: string | null
          revision_tecnica_url: string | null
          soap_url: string | null
          tiene_grua: boolean
          tiene_pulpo: boolean
          tiene_rampa: boolean
          tiene_refrigeracion: boolean
          tipo: Database["public"]["Enums"]["tipo_vehiculo"]
          updated_at: string
          volumen_m3: number | null
        }
        Insert: {
          activo?: boolean
          alto_m?: number | null
          ancho_m?: number | null
          anio?: number | null
          ayuda_carga?: boolean
          carga_max_kg: number
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          created_at?: string
          disponible?: boolean
          documentos_al_dia?: boolean
          foto_url?: string | null
          id?: string
          largo_m?: number | null
          marca?: string | null
          modelo?: string | null
          pallets?: number | null
          patente: string
          perfil_id: string
          permiso_circulacion_url?: string | null
          revision_tecnica_url?: string | null
          soap_url?: string | null
          tiene_grua?: boolean
          tiene_pulpo?: boolean
          tiene_rampa?: boolean
          tiene_refrigeracion?: boolean
          tipo: Database["public"]["Enums"]["tipo_vehiculo"]
          updated_at?: string
          volumen_m3?: number | null
        }
        Update: {
          activo?: boolean
          alto_m?: number | null
          ancho_m?: number | null
          anio?: number | null
          ayuda_carga?: boolean
          carga_max_kg?: number
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          created_at?: string
          disponible?: boolean
          documentos_al_dia?: boolean
          foto_url?: string | null
          id?: string
          largo_m?: number | null
          marca?: string | null
          modelo?: string | null
          pallets?: number | null
          patente?: string
          perfil_id?: string
          permiso_circulacion_url?: string | null
          revision_tecnica_url?: string | null
          soap_url?: string | null
          tiene_grua?: boolean
          tiene_pulpo?: boolean
          tiene_rampa?: boolean
          tiene_refrigeracion?: boolean
          tipo?: Database["public"]["Enums"]["tipo_vehiculo"]
          updated_at?: string
          volumen_m3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "camiones_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cargas: {
        Row: {
          alto_m: number | null
          ancho_m: number | null
          cliente_id: string
          created_at: string
          descripcion: string | null
          destino_lat: number | null
          destino_lng: number | null
          destino_region: number | null
          destino_texto: string
          distancia_km: number | null
          estado: Database["public"]["Enums"]["estado_carga"]
          fecha_retiro: string | null
          id: string
          largo_m: number | null
          origen_lat: number | null
          origen_lng: number | null
          origen_region: number | null
          origen_texto: string
          pallets: number | null
          peso_kg: number
          precio_referencia: number | null
          requiere_ayuda: boolean
          requiere_frio: boolean
          requiere_grua: boolean
          requiere_rampa: boolean
          ruta_id: string | null
          tipo_carga: string | null
          tipo_vehiculo_sugerido:
            | Database["public"]["Enums"]["tipo_vehiculo"]
            | null
          updated_at: string
          volumen_m3: number | null
        }
        Insert: {
          alto_m?: number | null
          ancho_m?: number | null
          cliente_id: string
          created_at?: string
          descripcion?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_region?: number | null
          destino_texto: string
          distancia_km?: number | null
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha_retiro?: string | null
          id?: string
          largo_m?: number | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_region?: number | null
          origen_texto: string
          pallets?: number | null
          peso_kg: number
          precio_referencia?: number | null
          requiere_ayuda?: boolean
          requiere_frio?: boolean
          requiere_grua?: boolean
          requiere_rampa?: boolean
          ruta_id?: string | null
          tipo_carga?: string | null
          tipo_vehiculo_sugerido?:
            | Database["public"]["Enums"]["tipo_vehiculo"]
            | null
          updated_at?: string
          volumen_m3?: number | null
        }
        Update: {
          alto_m?: number | null
          ancho_m?: number | null
          cliente_id?: string
          created_at?: string
          descripcion?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_region?: number | null
          destino_texto?: string
          distancia_km?: number | null
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha_retiro?: string | null
          id?: string
          largo_m?: number | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_region?: number | null
          origen_texto?: string
          pallets?: number | null
          peso_kg?: number
          precio_referencia?: number | null
          requiere_ayuda?: boolean
          requiere_frio?: boolean
          requiere_grua?: boolean
          requiere_rampa?: boolean
          ruta_id?: string | null
          tipo_carga?: string | null
          tipo_vehiculo_sugerido?:
            | Database["public"]["Enums"]["tipo_vehiculo"]
            | null
          updated_at?: string
          volumen_m3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cargas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargas_destino_region_fkey"
            columns: ["destino_region"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "cargas_origen_region_fkey"
            columns: ["origen_region"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "cargas_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas_recurrentes"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          camion_id: string | null
          camionero_id: string
          carga_id: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_oferta"]
          id: string
          mensaje: string | null
          precio: number
          updated_at: string
        }
        Insert: {
          camion_id?: string | null
          camionero_id: string
          carga_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          id?: string
          mensaje?: string | null
          precio: number
          updated_at?: string
        }
        Update: {
          camion_id?: string | null
          camionero_id?: string
          carga_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          id?: string
          mensaje?: string | null
          precio?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_camion_id_fkey"
            columns: ["camion_id"]
            isOneToOne: false
            referencedRelation: "camiones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_camionero_id_fkey"
            columns: ["camionero_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_regiones: {
        Row: {
          perfil_id: string
          region_codigo: number
        }
        Insert: {
          perfil_id: string
          region_codigo: number
        }
        Update: {
          perfil_id?: string
          region_codigo?: number
        }
        Relationships: [
          {
            foreignKeyName: "perfil_regiones_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_regiones_region_codigo_fkey"
            columns: ["region_codigo"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["codigo"]
          },
        ]
      }
      perfil_roles: {
        Row: {
          created_at: string
          perfil_id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          created_at?: string
          perfil_id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          created_at?: string
          perfil_id?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: [
          {
            foreignKeyName: "perfil_roles_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          emite_factura: boolean | null
          id: string
          nombre: string | null
          rating_prom: number | null
          razon_social: string | null
          rol: Database["public"]["Enums"]["rol_usuario"] | null
          rubro: string | null
          rut: string | null
          telefono: string | null
          total_resenas: number
          updated_at: string
          verificado: boolean
        }
        Insert: {
          activo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          emite_factura?: boolean | null
          id: string
          nombre?: string | null
          rating_prom?: number | null
          razon_social?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"] | null
          rubro?: string | null
          rut?: string | null
          telefono?: string | null
          total_resenas?: number
          updated_at?: string
          verificado?: boolean
        }
        Update: {
          activo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          emite_factura?: boolean | null
          id?: string
          nombre?: string | null
          rating_prom?: number | null
          razon_social?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"] | null
          rubro?: string | null
          rut?: string | null
          telefono?: string | null
          total_resenas?: number
          updated_at?: string
          verificado?: boolean
        }
        Relationships: []
      }
      regiones: {
        Row: {
          codigo: number
          nombre: string
          orden: number
        }
        Insert: {
          codigo: number
          nombre: string
          orden: number
        }
        Update: {
          codigo?: number
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      resenas: {
        Row: {
          autor_id: string
          comentario: string | null
          created_at: string
          destinatario_id: string
          id: string
          puntuacion: number
          viaje_id: string
        }
        Insert: {
          autor_id: string
          comentario?: string | null
          created_at?: string
          destinatario_id: string
          id?: string
          puntuacion: number
          viaje_id: string
        }
        Update: {
          autor_id?: string
          comentario?: string | null
          created_at?: string
          destinatario_id?: string
          id?: string
          puntuacion?: number
          viaje_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resenas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas_recurrentes: {
        Row: {
          activa: boolean
          created_at: string
          dias_semana: number[]
          hora_inicio: string | null
          id: string
          n_paradas: number | null
          nombre: string
          proveedor_id: string
          region_codigo: number | null
          requiere_frio: boolean
          updated_at: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          dias_semana?: number[]
          hora_inicio?: string | null
          id?: string
          n_paradas?: number | null
          nombre: string
          proveedor_id: string
          region_codigo?: number | null
          requiere_frio?: boolean
          updated_at?: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          dias_semana?: number[]
          hora_inicio?: string | null
          id?: string
          n_paradas?: number | null
          nombre?: string
          proveedor_id?: string
          region_codigo?: number | null
          requiere_frio?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rutas_recurrentes_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_recurrentes_region_codigo_fkey"
            columns: ["region_codigo"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["codigo"]
          },
        ]
      }
      viajes: {
        Row: {
          camion_id: string | null
          camionero_id: string
          carga_id: string
          cliente_id: string
          comision_monto: number | null
          comision_pct: number
          created_at: string
          estado: Database["public"]["Enums"]["estado_viaje"]
          fecha_entrega: string | null
          fecha_inicio: string | null
          id: string
          oferta_id: string | null
          pagado: boolean
          precio_final: number
          updated_at: string
        }
        Insert: {
          camion_id?: string | null
          camionero_id: string
          carga_id: string
          cliente_id: string
          comision_monto?: number | null
          comision_pct?: number
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_viaje"]
          fecha_entrega?: string | null
          fecha_inicio?: string | null
          id?: string
          oferta_id?: string | null
          pagado?: boolean
          precio_final: number
          updated_at?: string
        }
        Update: {
          camion_id?: string | null
          camionero_id?: string
          carga_id?: string
          cliente_id?: string
          comision_monto?: number | null
          comision_pct?: number
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_viaje"]
          fecha_entrega?: string | null
          fecha_inicio?: string | null
          id?: string
          oferta_id?: string | null
          pagado?: boolean
          precio_final?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viajes_camion_id_fkey"
            columns: ["camion_id"]
            isOneToOne: false
            referencedRelation: "camiones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_camionero_id_fkey"
            columns: ["camionero_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: true
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceptar_oferta: { Args: { p_oferta_id: string }; Returns: string }
      agregar_rol: {
        Args: {
          p_razon_social?: string
          p_rol: Database["public"]["Enums"]["rol_usuario"]
          p_rubro?: string
          p_rut?: string
        }
        Returns: undefined
      }
      cambiar_rol_activo: {
        Args: { p_rol: Database["public"]["Enums"]["rol_usuario"] }
        Returns: undefined
      }
      cancelar_carga: { Args: { p_carga_id: string }; Returns: undefined }
      cancelar_viaje: { Args: { p_viaje_id: string }; Returns: undefined }
      cargas_compatibles: {
        Args: { p_camion_id: string }
        Returns: {
          alto_m: number | null
          ancho_m: number | null
          cliente_id: string
          created_at: string
          descripcion: string | null
          destino_lat: number | null
          destino_lng: number | null
          destino_region: number | null
          destino_texto: string
          distancia_km: number | null
          estado: Database["public"]["Enums"]["estado_carga"]
          fecha_retiro: string | null
          id: string
          largo_m: number | null
          origen_lat: number | null
          origen_lng: number | null
          origen_region: number | null
          origen_texto: string
          pallets: number | null
          peso_kg: number
          precio_referencia: number | null
          requiere_ayuda: boolean
          requiere_frio: boolean
          requiere_grua: boolean
          requiere_rampa: boolean
          ruta_id: string | null
          tipo_carga: string | null
          tipo_vehiculo_sugerido:
            | Database["public"]["Enums"]["tipo_vehiculo"]
            | null
          updated_at: string
          volumen_m3: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "cargas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      completar_registro: {
        Args: {
          p_nombre: string
          p_razon_social?: string
          p_regiones: number[]
          p_rol: Database["public"]["Enums"]["rol_usuario"]
          p_rubro?: string
          p_rut?: string
          p_telefono: string
        }
        Returns: undefined
      }
      marcar_entregado: { Args: { p_viaje_id: string }; Returns: undefined }
      mis_ganancias: {
        Args: never
        Returns: {
          ganancia_mes: number
          ganancia_semana: number
          viajes_semana: number
          viajes_totales: number
        }[]
      }
      retirar_oferta: { Args: { p_oferta_id: string }; Returns: undefined }
    }
    Enums: {
      estado_carga:
        | "borrador"
        | "publicada"
        | "asignada"
        | "en_ruta"
        | "entregada"
        | "cancelada"
      estado_oferta: "pendiente" | "aceptada" | "rechazada" | "retirada"
      estado_viaje: "asignado" | "en_ruta" | "entregado" | "cancelado"
      rol_usuario: "negocio" | "camionero" | "proveedor"
      tipo_carroceria: "cerrada" | "abierta" | "toldo"
      tipo_vehiculo:
        | "camioneta"
        | "tres_cuartos"
        | "camion"
        | "rampla"
        | "refrigerado"
        | "plano"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_carga: [
        "borrador",
        "publicada",
        "asignada",
        "en_ruta",
        "entregada",
        "cancelada",
      ],
      estado_oferta: ["pendiente", "aceptada", "rechazada", "retirada"],
      estado_viaje: ["asignado", "en_ruta", "entregado", "cancelado"],
      rol_usuario: ["negocio", "camionero", "proveedor"],
      tipo_carroceria: ["cerrada", "abierta", "toldo"],
      tipo_vehiculo: [
        "camioneta",
        "tres_cuartos",
        "camion",
        "rampla",
        "refrigerado",
        "plano",
      ],
    },
  },
} as const
