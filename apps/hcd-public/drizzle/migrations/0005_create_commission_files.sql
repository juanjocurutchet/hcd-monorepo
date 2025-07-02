-- Migración: Crear tabla commission_files para proyectos en comisión
CREATE TABLE commission_files (
  id SERIAL PRIMARY KEY,
  committee_id INTEGER NOT NULL REFERENCES committees(id),
  expediente_number VARCHAR(100) NOT NULL,
  fecha_entrada TIMESTAMP NOT NULL,
  descripcion TEXT NOT NULL,
  despacho BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_despacho TIMESTAMP,
  file_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);