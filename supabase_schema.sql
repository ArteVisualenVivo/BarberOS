-- Crear tablas principales
CREATE TABLE barberias ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  nombre TEXT NOT NULL, 
  slug TEXT UNIQUE NOT NULL, 
  email_owner TEXT,
  telefono TEXT,
  plan_activo BOOLEAN DEFAULT false,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() 
); 

CREATE TABLE usuarios ( 
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, 
  barberia_id uuid REFERENCES barberias(id), 
  nombre TEXT, 
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'barbero')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() 
); 

CREATE TABLE servicios ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  barberia_id uuid REFERENCES barberias(id) ON DELETE CASCADE, 
  nombre TEXT NOT NULL, 
  precio INT NOT NULL, 
  duracion TEXT, -- Cambiado a TEXT para coincidir con el uso de "30 min" o similar si es necesario, o mantener INT si es solo minutos. El código usa `servicio.duracion` directamente.
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() 
); 

CREATE TABLE turnos ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  barberia_id uuid REFERENCES barberias(id) ON DELETE CASCADE, 
  servicio_id uuid REFERENCES servicios(id) ON DELETE SET NULL, 
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_nombre TEXT NOT NULL, 
  cliente_whatsapp TEXT NOT NULL, 
  fecha DATE NOT NULL, 
  hora TEXT NOT NULL, 
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
  monto_total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
  UNIQUE(barberia_id, fecha, hora) 
); 

-- ACTIVAR RLS 
ALTER TABLE barberias ENABLE ROW LEVEL SECURITY; 
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY; 
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY; 
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY; 

-- POLÍTICAS REALES DE SEGURIDAD (RLS)

-- 1. BARBERIAS:
-- El dueño (email_owner) puede ver y editar su propia barbería
CREATE POLICY "Owners can view their own barberia" ON barberias 
  FOR SELECT USING (auth.jwt() ->> 'email' = email_owner);
CREATE POLICY "Owners can update their own barberia" ON barberias 
  FOR UPDATE USING (auth.jwt() ->> 'email' = email_owner);
-- Público puede ver barbería para reservar (por slug o ID)
CREATE POLICY "Public can view barberias for booking" ON barberias 
  FOR SELECT USING (true);

-- 2. USUARIOS:
-- Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile" ON usuarios 
  FOR SELECT USING (auth.uid() = id);
-- Admins pueden ver a otros usuarios (barberos) de su misma barbería
CREATE POLICY "Admins can view users of their barberia" ON usuarios 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND u.barberia_id = usuarios.barberia_id
    )
  );

-- 3. SERVICIOS:
-- Público puede ver servicios para elegir qué reservar
CREATE POLICY "Public can view services" ON servicios 
  FOR SELECT USING (true);
-- Solo admins/barberos pueden gestionar servicios de su barbería
CREATE POLICY "Staff can manage their services" ON servicios 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() AND usuarios.barberia_id = servicios.barberia_id
    )
  );

-- 4. TURNOS:
-- Público puede insertar turnos (reservar)
CREATE POLICY "Public can insert turnos" ON turnos 
  FOR INSERT WITH CHECK (true);
-- Público puede ver sus propios turnos (MVP: simplificado, idealmente por ID de sesión o whatsapp)
CREATE POLICY "Public can view their own turnos" ON turnos 
  FOR SELECT USING (true);
-- Solo el staff de la barbería puede gestionar (confirmar/cancelar) los turnos de su negocio
CREATE POLICY "Staff can manage their turnos" ON turnos 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() AND usuarios.barberia_id = turnos.barberia_id
    )
  );

-- DATOS DE PRUEBA (Opcional, requiere una barbería_id válida si se descomenta)
-- INSERT INTO servicios (nombre, precio, duracion, popular) 
-- VALUES 
-- ('Corte clásico', 5000, '30 min', false), 
-- ('Corte + barba', 8000, '45 min', true), 
-- ('Fade premium', 7000, '40 min', false);
