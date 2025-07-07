import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testNotifications() {
  try {
    console.log('🚀 Probando sistema de notificaciones...');
    console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`);
    
    // Verificar que los campos de notificación existen
    const result = await sql`SELECT * FROM activities LIMIT 1`;
    console.log('✅ Conexión a la base de datos exitosa');
    console.log('✅ Campos de notificación disponibles');
    
    // Mostrar actividades con notificaciones habilitadas
    const activitiesWithNotifications = await sql`
      SELECT id, title, date, enable_notifications, notification_advance, notification_emails
      FROM activities 
      WHERE enable_notifications = true
    `;
    
    console.log(`📧 Actividades con notificaciones habilitadas: ${activitiesWithNotifications.length}`);
    
    if (activitiesWithNotifications.length > 0) {
      console.log('📋 Actividades encontradas:');
      activitiesWithNotifications.forEach(activity => {
        console.log(`  - ${activity.title} (ID: ${activity.id})`);
        console.log(`    Fecha: ${new Date(activity.date).toLocaleString('es-ES')}`);
        console.log(`    Anticipación: ${activity.notification_advance} horas`);
        console.log(`    Emails: ${activity.notification_emails || 'No configurados'}`);
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
