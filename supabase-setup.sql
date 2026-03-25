-- Ejecuta este script en el editor SQL (SQL Editor) de tu panel de Supabase
-- Esto creará la tabla requerida para las Notificaciones Web

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si tienes RLS (Row Level Security) activado, usa las siguientes políticas:
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar (marcar como leídas) sus notificaciones"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "El sistema puede insertar notificaciones a cualquier usuario"
ON public.notifications
FOR INSERT
WITH CHECK (true);
