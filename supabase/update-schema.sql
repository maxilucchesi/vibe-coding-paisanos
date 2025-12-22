-- Agregar la columna local_id a la tabla books si no existe
ALTER TABLE books ADD COLUMN IF NOT EXISTS local_id TEXT;

-- Verificar la estructura de la tabla después de la modificación
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' 
ORDER BY ordinal_position;
