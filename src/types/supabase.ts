export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      barberias: {
        Row: {
          id: string;
          nombre: string;
          telefono: string | null;
          slug: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          telefono?: string | null;
          slug: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          telefono?: string | null;
          slug?: string;
        };
      };
      servicios: {
        Row: {
          id: string;
          nombre: string;
          precio: number;
          duracion: number;
          barberia_id: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          precio: number;
          duracion: number;
          barberia_id: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          precio?: number;
          duracion?: number;
          barberia_id?: string;
        };
      };
      turnos: {
        Row: {
          id: string;
          fecha: string;
          hora: string;
          barberia_id: string;
          servicio_id: string;
          cliente_nombre: string;
          cliente_whatsapp: string;
          estado: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          fecha: string;
          hora: string;
          barberia_id: string;
          servicio_id: string;
          cliente_nombre: string;
          cliente_whatsapp: string;
          estado: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          fecha?: string;
          hora?: string;
          barberia_id?: string;
          servicio_id?: string;
          cliente_nombre?: string;
          cliente_whatsapp?: string;
          estado?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}
