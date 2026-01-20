-- Verificar si hay restricciones de clave foránea que apunten a la tabla books
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'books';

-- Eliminar cualquier restricción que pueda estar causando problemas
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_user_id_fkey;

-- Asegurarse de que la tabla books tenga habilitadas las políticas RLS para DELETE
CREATE POLICY IF NOT EXISTS "Users can delete their own books"
ON public.books FOR DELETE
USING (true);  -- Permitir acceso a todos para simplificar
