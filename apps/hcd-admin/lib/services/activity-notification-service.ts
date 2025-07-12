import { and, eq, gte } from "drizzle-orm"
import { db } from "../db-singleton"
import { activities } from "../db/schema"
import { sendEmail } from "../email"

interface Activity {
  id: number
  title: string
  description: string
  location?: string
  date: string
  imageUrl?: string
  isPublished: boolean
  enableNotifications: boolean
  notificationAdvance: string
  notificationEmails?: string
  lastNotificationSent?: string
}

export class ActivityNotificationService {
  /**
   * Envía notificaciones para actividades próximas
   */
  static async sendUpcomingActivityNotifications() {
    try {
      const nowUTC = new Date()
      const now = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))

      // Obtener actividades que necesitan notificación
      const activitiesToNotify = await this.getActivitiesNeedingNotification()

      console.log(`Enviando notificaciones para ${activitiesToNotify.length} actividades`)

      for (const activity of activitiesToNotify) {
        await this.sendActivityNotification(activity)

        // Marcar como notificada
        await this.markActivityAsNotified(activity.id)
      }

      return { success: true, notified: activitiesToNotify.length }
    } catch (error) {
      console.error("Error enviando notificaciones de actividades:", error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  /**
   * Obtiene actividades que necesitan notificación
   */
  private static async getActivitiesNeedingNotification(): Promise<Activity[]> {
    const nowUTC = new Date()
    const now = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))

    // Obtener todas las actividades futuras con notificaciones habilitadas
    const allActivities = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.isPublished, true),
          eq(activities.enableNotifications, true),
          gte(activities.date, now)
        )
      )

    const activitiesNeedingNotification: Activity[] = []

    for (const activity of allActivities) {
      const activityDateUTC = new Date(activity.date)
      const activityDateArgentina = new Date(activityDateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))

      // Procesar múltiples anticipaciones
      const advances = activity.notificationAdvance.split(',').map(a => a.trim()).filter(a => a)

      for (const advance of advances) {
        // Soporta formatos como "10_minutes", "1_hours", "1_days"
        let advanceMs = 0
        const match = advance.match(/(\d+)_?(minutes|hours|days)?/)
        if (match && match[1]) {
          const value = parseInt(match[1])
          const unit = match[2] || 'hours'
          if (unit === 'minutes') advanceMs = value * 60 * 1000
          else if (unit === 'hours') advanceMs = value * 60 * 60 * 1000
          else if (unit === 'days') advanceMs = value * 24 * 60 * 60 * 1000
        } else {
          // fallback: tratar como horas
          const value = parseInt(advance)
          if (!isNaN(value)) advanceMs = value * 60 * 60 * 1000
        }
        if (!advanceMs) continue

        const notificationTime = new Date(activityDateArgentina.getTime() - advanceMs)

        // Verificar si es momento de enviar la notificación para esta anticipación (ventana de 1 minuto)
        const windowMs = 60 * 1000; // 1 minuto
        const shouldNotify = Math.abs(now.getTime() - notificationTime.getTime()) < windowMs;

        // Verificar si no se ha enviado notificación recientemente (últimas 2 horas)
        const lastNotification = activity.lastNotificationSent
          ? new Date(activity.lastNotificationSent)
          : null

        const recentlyNotified = lastNotification &&
          (now.getTime() - lastNotification.getTime()) < (2 * 60 * 60 * 1000)

        if (shouldNotify && !recentlyNotified) {
          activitiesNeedingNotification.push({
            ...activity,
            date: activity.date.toISOString(),
            location: activity.location ?? undefined,
            imageUrl: activity.imageUrl ?? undefined,
            notificationEmails: activity.notificationEmails ?? undefined,
            lastNotificationSent: activity.lastNotificationSent?.toISOString()
          })
          break // Solo agregar una vez por actividad
        }
      }
    }

    return activitiesNeedingNotification
  }

  /**
   * Envía notificación por email para una actividad específica
   */
  private static async sendActivityNotification(activity: Activity) {
    try {
      if (!activity.notificationEmails) {
        console.warn(`No hay emails configurados para la actividad ${activity.id}`)
        return
      }

      const emails = activity.notificationEmails.split(',').map(email => email.trim())
      const activityDateUTC = new Date(activity.date)
      const activityDateArgentina = new Date(activityDateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
      const timeUntilActivity = this.getTimeUntilActivity(activityDateArgentina)

      const subject = `Recordatorio: ${activity.title} - ${timeUntilActivity}`

      const html = this.generateNotificationEmail(activity, timeUntilActivity)
      const text = this.generateNotificationEmailText(activity, timeUntilActivity)

      for (const email of emails) {
        await sendEmail({
          to: email,
          subject,
          text,
          html
        })

        console.log(`Notificación enviada a ${email} para actividad: ${activity.title}`)
      }
    } catch (error) {
      console.error(`Error enviando notificación para actividad ${activity.id}:`, error)
    }
  }

  /**
   * Marca una actividad como notificada
   */
  private static async markActivityAsNotified(activityId: number) {
    await db
      .update(activities)
      .set({
        lastNotificationSent: new Date(),
        updatedAt: new Date()
      })
      .where(eq(activities.id, activityId))
  }

  /**
   * Calcula el tiempo hasta la actividad en formato legible
   */
  private static getTimeUntilActivity(activityDate: Date): string {
    const now = new Date()
    const diffMs = activityDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `en ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `en ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      return 'ahora'
    }
  }

  /**
   * Genera el HTML del email de notificación
   */
  private static generateNotificationEmail(activity: Activity, timeUntil: string): string {
    const activityDateUTC = new Date(activity.date)
    const activityDateArgentina = new Date(activityDateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
    const formattedDate = activityDateArgentina.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Actividad</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0e4c7d; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .activity { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .time { color: #0e4c7d; font-weight: bold; }
          .location { color: #666; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Recordatorio de Actividad</h1>
            <p>Honorable Concejo Deliberante de Las Flores</p>
          </div>

          <div class="content">
            <div class="activity">
              <h2>${activity.title}</h2>
              <p><strong>${activity.description}</strong></p>

              <div class="time">
                📅 ${formattedDate}
              </div>

              ${activity.location ? `<div class="location">📍 ${activity.location}</div>` : ''}

              <p style="margin-top: 20px; padding: 10px; background: #e3f2fd; border-radius: 4px;">
                ⏰ Esta actividad comienza <strong>${timeUntil}</strong>
              </p>
            </div>
          </div>

          <div class="footer">
            <p>Este es un recordatorio automático del sistema de actividades del HCD Las Flores.</p>
            <p>Si tienes alguna pregunta, contacta al administrador del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Genera el texto plano del email de notificación
   */
  private static generateNotificationEmailText(activity: Activity, timeUntil: string): string {
    const activityDateUTC = new Date(activity.date)
    const activityDateArgentina = new Date(activityDateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
    const formattedDate = activityDateArgentina.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return `
RECORDATORIO DE ACTIVIDAD - HCD Las Flores

Título: ${activity.title}
Descripción: ${activity.description}
Fecha y Hora: ${formattedDate}
${activity.location ? `Ubicación: ${activity.location}` : ''}

Esta actividad comienza ${timeUntil}.

---
Este es un recordatorio automático del sistema de actividades del HCD Las Flores.
Si tienes alguna pregunta, contacta al administrador del sistema.
    `.trim()
  }

  /**
   * Envía notificación inmediata para una actividad específica
   */
  static async sendImmediateNotification(activityId: number) {
    try {
      const activity = await db
        .select()
        .from(activities)
        .where(eq(activities.id, activityId))
        .limit(1)

      if (activity.length === 0) {
        throw new Error('Actividad no encontrada')
      }

      const activityData = activity[0]
      if (!activityData) {
        throw new Error('Actividad no encontrada')
      }

      const activityForNotification: Activity = {
        ...activityData,
        date: activityData.date.toISOString(),
        location: activityData.location ?? undefined,
        imageUrl: activityData.imageUrl ?? undefined,
        notificationEmails: activityData.notificationEmails ?? undefined,
        lastNotificationSent: activityData.lastNotificationSent?.toISOString()
      }

      await this.sendActivityNotification(activityForNotification)
      await this.markActivityAsNotified(activityId)

      return { success: true }
    } catch (error) {
      console.error('Error enviando notificación inmediata:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  /**
   * Prueba el envío de notificación para una actividad
   */
  static async testNotification(activityId: number, testEmail: string) {
    try {
      const activity = await db
        .select()
        .from(activities)
        .where(eq(activities.id, activityId))
        .limit(1)

      if (activity.length === 0) {
        throw new Error('Actividad no encontrada')
      }

      const activityData = activity[0]
      if (!activityData) {
        throw new Error('Actividad no encontrada')
      }

      const testActivity: Activity = {
        ...activityData,
        date: activityData.date.toISOString(),
        location: activityData.location ?? undefined,
        imageUrl: activityData.imageUrl ?? undefined,
        notificationEmails: testEmail,
        lastNotificationSent: activityData.lastNotificationSent?.toISOString()
      }

      await this.sendActivityNotification(testActivity)

      return { success: true }
    } catch (error) {
      console.error('Error en prueba de notificación:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }
}