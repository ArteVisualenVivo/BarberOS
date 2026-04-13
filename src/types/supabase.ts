export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      barberias: {
        Row: {
          id: string
          nombre: string
          slug: string
          email_owner: string | null
          telefono: string | null

          // ✅ FIX IMPORTANTE: en runtime puede venir null desde Supabase
          plan_activo: boolean | null

          fecha_expiracion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          email_owner?: string | null
          telefono?: string | null
          plan_activo?: boolean | null
          fecha_expiracion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          email_owner?: string | null
          telefono?: string | null
          plan_activo?: boolean | null
          fecha_expiracion?: string | null
          created_at?: string
        }
      }

      usuarios: {
        Row: {
          id: string
          barberia_id: string | null
          nombre: string | null
          rol: 'admin' | 'barbero'
          created_at: string
        }
        Insert: {
          id: string
          barberia_id?: string | null
          nombre?: string | null
          rol?: 'admin' | 'barbero'
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string | null
          nombre?: string | null
          rol?: 'admin' | 'barbero'
          created_at?: string
        }
      }

      servicios: {
        Row: {
          id: string
          barberia_id: string
          nombre: string
          precio: number
          duracion: string | null
          popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          barberia_id: string
          nombre: string
          precio: number
          duracion?: string | null
          popular?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string
          nombre?: string
          precio?: number
          duracion?: string | null
          popular?: boolean
          created_at?: string
        }
      }

      turnos: {
        Row: {
          id: string
          barberia_id: string
          servicio_id: string | null
          usuario_id: string | null
          cliente_nombre: string
          cliente_whatsapp: string
          fecha: string
          hora: string
          estado: 'pendiente' | 'confirmado' | 'cancelado'
          monto_total: number
          created_at: string
        }
        Insert: {
          id?: string
          barberia_id: string
          servicio_id?: string | null
          usuario_id?: string | null
          cliente_nombre: string
          cliente_whatsapp: string
          fecha: string
          hora: string
          estado?: 'pendiente' | 'confirmado' | 'cancelado'
          monto_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string
          servicio_id?: string | null
          usuario_id?: string | null
          cliente_nombre?: string
          cliente_whatsapp?: string
          fecha?: string
          hora?: string
          estado?: 'pendiente' | 'confirmado' | 'cancelado'
          monto_total?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}