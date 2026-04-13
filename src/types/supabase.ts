export type Database = {
  public: {
    Tables: {
      barberias: {
        Row: {
          id: string
          nombre: string
          email_owner: string
          created_at: string
          slug: string
          telefono: string | null
          plan_activo: boolean
          fecha_expiracion: string | null
        }
        Insert: {
          id?: string
          nombre: string
          email_owner: string
          created_at?: string
          slug: string
          telefono?: string | null
          plan_activo?: boolean
          fecha_expiracion?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          email_owner?: string
          created_at?: string
          slug?: string
          telefono?: string | null
          plan_activo?: boolean
          fecha_expiracion?: string | null
        }
      }

      usuarios: {
        Row: {
          id: string
          barberia_id: string
          nombre: string
          rol: 'admin' | 'barbero'
          created_at: string
        }
        Insert: {
          id: string
          barberia_id: string
          nombre: string
          rol?: 'admin' | 'barbero'
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string
          nombre?: string
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
          duracion: string
          popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          barberia_id: string
          nombre: string
          precio: number
          duracion: string
          popular?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string
          nombre?: string
          precio?: number
          duracion?: string
          popular?: boolean
          created_at?: string
        }
      }

      turnos: {
        Row: {
          id: string
          barberia_id: string
          usuario_id: string | null
          cliente_nombre: string
          cliente_whatsapp: string
          fecha: string
          hora: string
          estado: 'pendiente' | 'confirmado' | 'cancelado'
          created_at: string
        }
        Insert: {
          id?: string
          barberia_id: string
          usuario_id?: string | null
          cliente_nombre: string
          cliente_whatsapp: string
          fecha: string
          hora: string
          estado?: 'pendiente' | 'confirmado' | 'cancelado'
          created_at?: string
        }
        Update: {
          id?: string
          barberia_id?: string
          usuario_id?: string | null
          cliente_nombre?: string
          cliente_whatsapp?: string
          fecha?: string
          hora?: string
          estado?: 'pendiente' | 'confirmado' | 'cancelado'
          created_at?: string
        }
      }
    }
  }
}