import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"
import dotenv from "dotenv"

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" })

async function setupDatabase() {
  try {
    // Verificar que DATABASE_URL esté definido
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no está definido en las variables de entorno")
    }

    console.log("Conectando a la base de datos...")
    const sql = neon(process.env.DATABASE_URL)

    // Crear directorio db si no existe
    const dbDir = path.join(process.cwd(), "db")
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Crear archivo schema.sql si no existe
    const schemaPath = path.join(dbDir, "schema.sql")
    if (!fs.existsSync(schemaPath)) {
      fs.writeFileSync(
        schemaPath,
        `-- Enums
CREATE TYPE document_type AS ENUM ('ordenanza', 'decreto', 'resolucion', 'comunicacion');
CREATE TYPE session_type AS ENUM ('ordinaria', 'extraordinaria', 'especial', 'preparatoria');

-- Tablas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url VARCHAR(255),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  author_id INTEGER REFERENCES users(id),
  slug VARCHAR(255) NOT NULL UNIQUE,
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS political_blocks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  president_id INTEGER,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS council_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  block_id INTEGER REFERENCES political_blocks(id),
  mandate VARCHAR(100),
  image_url VARCHAR(255),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS committees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  president_id INTEGER REFERENCES council_members(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS committee_members (
  id SERIAL PRIMARY KEY,
  committee_id INTEGER REFERENCES committees(id) NOT NULL,
  council_member_id INTEGER REFERENCES council_members(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  number VARCHAR(100),
  type document_type NOT NULL,
  content TEXT,
  file_url VARCHAR(255),
  published_at TIMESTAMP,
  author_id INTEGER REFERENCES users(id),
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  type session_type NOT NULL,
  agenda_file_url VARCHAR(255),
  minutes_file_url VARCHAR(255),
  audio_file_url VARCHAR(255),
  video_url VARCHAR(255),
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(255),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'contact' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  image_url VARCHAR(255),
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_participants (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) NOT NULL,
  council_member_id INTEGER REFERENCES council_members(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`,
      )
    }

    // Crear archivo seed.sql si no existe
    const seedPath = path.join(dbDir, "seed.sql")
    if (!fs.existsSync(seedPath)) {
      fs.writeFileSync(
        seedPath,
        `-- Insertar usuario administrador
INSERT INTO users (name, email, password, role)
VALUES ('Administrador', 'admin@hcdlasflores.gob.ar', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq6jCuMQzlCEGleyPyBdm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar bloques políticos
INSERT INTO political_blocks (name, color)
VALUES 
  ('Unión por la Patria', '#2E86C1'),
  ('Juntos por el Cambio', '#F4D03F'),
  ('La Libertad Avanza', '#8E44AD')
ON CONFLICT DO NOTHING;

-- Insertar concejales
INSERT INTO council_members (name, position, block_id, mandate, is_active)
VALUES 
  ('María Rodríguez', 'Presidente', 1, '2023-2027', true),
  ('Juan Pérez', 'Vicepresidente 1°', 2, '2023-2027', true),
  ('Carlos Gómez', 'Vicepresidente 2°', 3, '2023-2027', true),
  ('Laura Martínez', 'Concejal', 1, '2023-2027', true),
  ('Roberto Sánchez', 'Concejal', 1, '2023-2027', true),
  ('Ana López', 'Concejal', 2, '2023-2027', true),
  ('Miguel Fernández', 'Concejal', 2, '2023-2027', true),
  ('Lucía García', 'Concejal', 3, '2023-2027', true)
ON CONFLICT DO NOTHING;

-- Insertar comisiones
INSERT INTO committees (name, description, president_id)
VALUES 
  ('Hacienda y Presupuesto', 'Comisión encargada de temas financieros y presupuestarios', 1),
  ('Obras Públicas', 'Comisión encargada de infraestructura y obras municipales', 2),
  ('Salud y Medio Ambiente', 'Comisión encargada de temas de salud pública y medio ambiente', 3)
ON CONFLICT DO NOTHING;

-- Insertar miembros de comisiones
INSERT INTO committee_members (committee_id, council_member_id)
VALUES 
  (1, 1), (1, 2), (1, 3),
  (2, 2), (2, 4), (2, 6),
  (3, 3), (3, 5), (3, 7)
ON CONFLICT DO NOTHING;

-- Insertar noticias
INSERT INTO news (title, content, excerpt, slug, author_id, is_published)
VALUES 
  ('Sesión Ordinaria de Mayo', 'El Honorable Concejo Deliberante de Las Flores llevó a cabo su sesión ordinaria correspondiente al mes de mayo, donde se trataron importantes temas para la comunidad. Entre los puntos destacados se encontraron la aprobación del presupuesto para obras públicas y la discusión sobre nuevas ordenanzas de tránsito.', 'El HCD realizó su sesión mensual con importantes avances en temas de interés comunitario.', 'sesion-ordinaria-mayo', 1, true),
  ('Aprobación de Ordenanza Ambiental', 'El Concejo Deliberante aprobó por unanimidad la nueva ordenanza de protección ambiental que establece medidas para reducir la contaminación y promover prácticas sustentables en el municipio. La normativa incluye restricciones al uso de plásticos de un solo uso y fomenta el reciclaje.', 'Nueva normativa busca reducir la contaminación y promover prácticas sustentables.', 'aprobacion-ordenanza-ambiental', 1, true),
  ('Audiencia Pública por Transporte', 'Se llevó a cabo una audiencia pública en el recinto del Concejo Deliberante para discutir mejoras en el sistema de transporte público. Vecinos y concejales debatieron sobre frecuencias, recorridos y tarifas del servicio de colectivos urbanos.', 'Vecinos y concejales debatieron sobre el futuro del transporte público en la ciudad.', 'audiencia-publica-transporte', 1, true)
ON CONFLICT DO NOTHING;

-- Insertar actividades
INSERT INTO activities (title, description, date, is_published)
VALUES 
  ('Visita a Escuelas Rurales', 'Concejales de distintos bloques visitaron escuelas rurales del distrito para conocer sus necesidades y planificar mejoras en infraestructura educativa.', '2025-05-10 09:00:00', true),
  ('Reunión con Vecinos del Barrio Norte', 'Representantes del Concejo Deliberante se reunieron con vecinos del Barrio Norte para escuchar sus inquietudes sobre seguridad y servicios públicos.', '2025-05-08 18:00:00', true),
  ('Participación en Foro de Seguridad', 'Concejales participaron en el Foro de Seguridad Municipal junto a autoridades policiales y representantes vecinales para coordinar acciones contra la inseguridad.', '2025-05-03 10:00:00', true)
ON CONFLICT DO NOTHING;

-- Insertar participantes de actividades
INSERT INTO activity_participants (activity_id, council_member_id)
VALUES 
  (1, 1), (1, 4), (1, 6),
  (2, 2), (2, 5), (2, 8),
  (3, 3), (3, 7), (3, 1)
ON CONFLICT DO NOTHING;

-- Insertar documentos
INSERT INTO documents (title, number, type, content, published_at, author_id, is_published)
VALUES 
  ('Ordenanza de Protección Ambiental', '2025/01', 'ordenanza', 'Artículo 1: Prohíbase el uso de bolsas plásticas de un solo uso en comercios...', '2025-05-02', 1, true),
  ('Decreto de Emergencia Sanitaria', '2025/05', 'decreto', 'Artículo 1: Declárase la emergencia sanitaria en todo el distrito...', '2025-04-15', 1, true),
  ('Resolución sobre Transporte Público', '2025/03', 'resolucion', 'Artículo 1: Solicítase al Departamento Ejecutivo la revisión de frecuencias...', '2025-03-20', 1, true),
  ('Comunicación al Ejecutivo Municipal', '2025/02', 'comunicacion', 'Se solicita al Departamento Ejecutivo informe sobre el estado de las obras...', '2025-02-10', 1, true)
ON CONFLICT DO NOTHING;

-- Insertar sesiones
INSERT INTO sessions (date, type, is_published)
VALUES 
  ('2025-05-05 10:00:00', 'ordinaria', true),
  ('2025-04-15 10:00:00', 'ordinaria', true),
  ('2025-03-20 10:00:00', 'extraordinaria', true),
  ('2025-02-10 10:00:00', 'ordinaria', true)
ON CONFLICT DO NOTHING;`,
      )
    }

    // Leer y ejecutar el archivo schema.sql
    console.log("Creando tablas...")
    const schemaSQL = fs.readFileSync(schemaPath, "utf8")

    try {
      await sql(schemaSQL)
      console.log("Tablas creadas exitosamente")
    } catch (error) {
      console.error("Error al crear tablas:", error)
      console.log("Intentando continuar con la inserción de datos...")
    }

    // Leer y ejecutar el archivo seed.sql
    console.log("Insertando datos iniciales...")
    const seedSQL = fs.readFileSync(seedPath, "utf8")

    try {
      await sql(seedSQL)
      console.log("Datos iniciales insertados exitosamente")
    } catch (error) {
      console.error("Error al insertar datos iniciales:", error)
    }

    console.log("¡Base de datos configurada correctamente!")
  } catch (error) {
    console.error("Error al configurar la base de datos:", error)
    process.exit(1)
  }
}

// Ejecutar la función
setupDatabase()
