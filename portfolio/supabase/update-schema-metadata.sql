-- Añadir columnas para la metadata de Google Books
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS published_date TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS isbn TEXT;
