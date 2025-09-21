#!/usr/bin/env tsx

/**
 * Script para agregar el campo autor a la tabla session_files
 */

import { db } from '../lib/db-singleton'
import { sql } from 'drizzle-orm'

async function addAuthorField() {
  console.log('🔄 Agregando campo autor a session_files...')
  
  try {
    // Agregar columna autor a la tabla session_files
    await db.execute(sql`
      ALTER TABLE session_files 
      ADD COLUMN IF NOT EXISTS autor VARCHAR(255)
    `)
    
    console.log('✅ Campo autor agregado exitosamente')
    
  } catch (error) {
    console.error('❌ Error agregando campo autor:', error)
    process.exit(1)
  }
}

addAuthorField()
  .then(() => {
    console.log('🏁 Migración completada')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })