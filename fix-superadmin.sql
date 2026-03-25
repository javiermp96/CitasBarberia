-- 1. Asegurarnos que la tabla tiene RLS activado y crear la función auxiliar
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Eliminar múltiples posibles nombres de políticas antiguas para evitar conflictos
-- Supabase acumula (OR) políticas. Si una falla, u otra restringe de más, ocurren errores.
DROP POLICY IF EXISTS "Superadmins pueden ver todos los registros de acceso" ON public.access_logs;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios registros" ON public.access_logs;
DROP POLICY IF EXISTS "Users can see their own logs" ON public.access_logs;
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Insert access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Lectura access_logs: Dueño o Superadmin" ON public.access_logs;
DROP POLICY IF EXISTS "Insercion de su propio access_log" ON public.access_logs;

-- 3. Crear una única y fuerte política de LECTURA sobre access_logs
-- Permitir leer solo si el registro es tuyo (user_id) O si eres SUPERADMIN en la tabla users
CREATE POLICY "Lectura access_logs: Dueño o Superadmin" 
ON public.access_logs
FOR SELECT
USING (
  user_id = auth.uid() OR public.get_my_role() = 'SUPERADMIN'
);

-- 4. Crear una única política de INSERCIÓN (Para cuando cualquiera inicia sesión)
CREATE POLICY "Insercion de su propio access_log" 
ON public.access_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);
