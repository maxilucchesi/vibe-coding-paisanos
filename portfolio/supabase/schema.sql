-- Crear la tabla de libros
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('read', 'wishlist')),
  rating SMALLINT,
  date_finished DATE,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  local_id TEXT
);

-- Crear un índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);

-- Configurar RLS (Row Level Security) para que los usuarios solo puedan ver
-- sus propios libros
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver solo sus propios libros
CREATE POLICY "Users can view their own books"
ON books FOR SELECT
USING (auth.uid() = user_id);

-- Política para permitir a los usuarios insertar sus propios libros
CREATE POLICY "Users can insert their own books"
ON books FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para permitir a los usuarios actualizar sus propios libros
CREATE POLICY "Users can update their own books"
ON books FOR UPDATE
USING (auth.uid() = user_id);

-- Política para permitir a los usuarios eliminar sus propios libros
CREATE POLICY "Users can delete their own books"
ON books FOR DELETE
USING (auth.uid() = user_id);

-- Función para obtener la definición de una tabla (para diagnóstico)
CREATE OR REPLACE FUNCTION get_table_definition(table_name text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable
    )
  ) INTO result
  FROM information_schema.columns
  WHERE table_name = $1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
