#!/usr/bin/env tsx

/**
 * Script para enviar notificaciones automáticas de actividades
 * Este script puede ser ejecutado manualmente o programado con cron
 *
 * Ejemplo de cron job (cada hora):
 * 0 * * * * cd /path/to/hcd-monorepo/apps/hcd-admin && npm run send-notifications
 */

import { ActivityNotificationService } from "../lib/services/activity-notification-service"

async function main() {
  console.log("🚀 Iniciando envío de notificaciones de actividades...")
  console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`)

  try {
    const result = await ActivityNotificationService.sendUpcomingActivityNotifications()

    if (result.success) {
      console.log(`✅ Proceso completado exitosamente`)
      console.log(`📧 Notificaciones enviadas: ${result.notified}`)
    } else {
      console.error(`❌ Error en el proceso: ${result.error}`)
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error inesperado:", error)
    process.exit(1)
  }

  console.log("🏁 Script finalizado")
}

// Ejecutar el script
main()