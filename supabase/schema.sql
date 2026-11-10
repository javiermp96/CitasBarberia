-- ==============================================================================
-- CHERI BARBER - ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Ejecuta este script en el 'SQL Editor' de tu panel de Supabase para inicializar
-- completamente todas las tablas, relaciones, triggers y políticas RLS del proyecto.
-- ==============================================================================

-- 1. HABILITAR EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREACIÓN DE TABLAS
-- ==============================================================================

-- 2.1 TABLA DE USUARIOS (Extensión del perfil auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'ADMIN', 'SUPERADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 TABLA DE SERVICIOS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- Duración en minutos
    price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 TABLA DE DISPONIBILIDAD Y DESCANSOS
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BREAK')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 TABLA DE CITAS / RESERVAS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 TABLA DE REGISTROS DE ACCESO (AUDITORÍA PARA SUPERADMIN)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL DEFAULT 'LOGIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 TABLA DE NOTIFICACIONES (REALTIME PARA BARBERO / ADMINS)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. FUNCIONES AUXILIARES Y TRIGGERS DE AUTENTICACIÓN
-- ==============================================================================

-- Función para obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger automático para crear perfil público cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, date_of_birth, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'dob' IS NOT NULL AND NEW.raw_user_meta_data->>'dob' <> '' 
      THEN (NEW.raw_user_meta_data->>'dob')::DATE 
      ELSE NULL 
    END,
    'CLIENT'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. SEGURIDAD DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4.1 Políticas para public.users
CREATE POLICY "Lectura de perfiles de usuario"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su perfil"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4.2 Políticas para public.services
CREATE POLICY "Cualquiera puede consultar los servicios"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Solo administradores pueden crear o modificar servicios"
  ON public.services FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPERADMIN'));

-- 4.3 Políticas para public.availability
CREATE POLICY "Cualquiera puede consultar la disponibilidad"
  ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "Solo administradores pueden modificar disponibilidad"
  ON public.availability FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPERADMIN'));

-- 4.4 Políticas para public.appointments
CREATE POLICY "Clientes ven sus citas, administradores ven todas"
  ON public.appointments FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY "Usuarios autenticados pueden crear citas"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios y administradores pueden actualizar citas"
  ON public.appointments FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY "Usuarios y administradores pueden eliminar citas"
  ON public.appointments FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('ADMIN', 'SUPERADMIN')
  );

-- 4.5 Políticas para public.access_logs
CREATE POLICY "Dueño o Superadmin pueden ver logs de acceso"
  ON public.access_logs FOR SELECT
  USING (
    user_id = auth.uid() 
    OR public.get_my_role() = 'SUPERADMIN'
  );

CREATE POLICY "Inserción de log de acceso al iniciar sesión"
  ON public.access_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 4.6 Políticas para public.notifications
CREATE POLICY "Usuarios ven sus propias notificaciones"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios marcan sus notificaciones como leídas"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Cualquier usuario autenticado puede emitir notificaciones a administradores"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Habilitar Realtime para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- 5. DATOS SEMILLA / SERVICIOS POR DEFECTO
-- ==============================================================================
INSERT INTO public.services (name, duration, price) VALUES
  ('Corte Clásico', 30, 12.00),
  ('Arreglo de Barba', 20, 8.00),
  ('Corte + Barba Completo', 45, 18.00),
  ('Corte Infantil', 25, 10.00),
  ('Afeitado Tradicional con Toalla Caliente', 30, 14.00)
ON CONFLICT DO NOTHING;
