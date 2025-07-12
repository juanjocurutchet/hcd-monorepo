#!/usr/bin/env node

const { config } = require('dotenv');
const { resolve } = require('path');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno ANTES de cualquier require de base de datos
config({ path: resolve(__dirname, '../.env') });

const { db } = require('../lib/db-singleton');

async function checkAndCreateAdmin() {
  console.log("🔄 Verificando usuarios en la base de datos...");
  console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`);

  try {
    // Verificar si hay usuarios
    const users = await db.execute('SELECT id, name, email, role FROM users LIMIT 5');
    console.log('👥 Usuarios existentes:', users.rows);

    if (users.rows.length === 0) {
      console.log('⚠️  No hay usuarios. Creando usuario administrador...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const newUser = await db.execute(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
      `, ['Administrador', 'admin@hcd.com', hashedPassword, 'ADMIN']);

      console.log('✅ Usuario administrador creado:', newUser.rows[0]);
      console.log('🔑 Credenciales: admin@hcd.com / admin123');
    } else {
      console.log('✅ Usuarios encontrados. Puedes usar cualquiera de estos:');
      users.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log("🏁 Script finalizado");
}

checkAndCreateAdmin();