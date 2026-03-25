-- Corrección para el problema donde el Superadmin solo ve sus propios registros
-- Esto reemplaza la política actual con una que usa SECURITY DEFINER
-- para evitar conflictos con otras políticas RLS en la tabla users.

-- 1. Crear una función auxiliar que verifica si el usuario actual es superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  role_status text;
BEGIN
  SELECT role INTO role_status FROM public.users WHERE id = auth.uid();
  RETURN role_status = 'SUPERADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Eliminar la política anterior (es posible que el nombre varíe si lo cambiaste)
DROP POLICY IF EXISTS "Superadmins pueden ver todos los registros de acceso" ON public.access_logs;

-- 3. Crear la nueva política utilizando la función
CREATE POLICY "Superadmins pueden ver todos los registros de acceso"
ON public.access_logs
FOR SELECT
USING ( public.is_superadmin() );
