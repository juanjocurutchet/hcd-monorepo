import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { activities } from '../lib/db/schema.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testNotifications() {
  try {
    console.log('🚀 Probando sistema de notificaciones...');
    console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`);

    // Verificar que los campos de notificación existen
    const result = await db.select().from(activities).limit(1);
    console.log('✅ Conexión a la base de datos exitosa');
    console.log('✅ Campos de notificación disponibles');

    // Mostrar actividades con notificaciones habilitadas
    const activitiesWithNotifications = await db
      .select({
        id: activities.id,
        title: activities.title,
        date: activities.date,
        enableNotifications: activities.enableNotifications,
        notificationAdvance: activities.notificationAdvance,
        notificationEmails: activities.notificationEmails
      })
      .from(activities)
      .where(sql`${activities.enableNotifications} = true`);

    console.log(`📧 Actividades con notificaciones habilitadas: ${activitiesWithNotifications.length}`);

    if (activitiesWithNotifications.length > 0) {
      console.log('📋 Actividades encontradas:');
      activitiesWithNotifications.forEach(activity => {
        console.log(`  - ${activity.title} (ID: ${activity.id})`);
        console.log(`    Fecha: ${new Date(activity.date).toLocaleString('es-ES')}`);
        console.log(`    Anticipación: ${activity.notificationAdvance} horas`);
        console.log(`    Emails: ${activity.notificationEmails || 'No configurados'}`);
      });
    } else {
      console.log('ℹ️  No hay actividades con notificaciones habilitadas');
    }

    console.log('🏁 Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

testNotifications();