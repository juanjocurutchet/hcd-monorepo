import { ActivityNotificationService } from "@/lib/services/activity-notification-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, activityId, testEmail } = body

    switch (action) {
      case 'send_all':
        // Enviar todas las notificaciones pendientes
        const result = await ActivityNotificationService.sendUpcomingActivityNotifications()
        return NextResponse.json(result)

      case 'send_immediate':
        // Enviar notificación inmediata para una actividad específica
        if (!activityId) {
          return NextResponse.json({ error: "Se requiere activityId" }, { status: 400 })
        }
        const immediateResult = await ActivityNotificationService.sendImmediateNotification(activityId)
        return NextResponse.json(immediateResult)

      case 'test':
        // Probar notificación para una actividad
        if (!activityId || !testEmail) {
          return NextResponse.json({ error: "Se requiere activityId y testEmail" }, { status: 400 })
        }
        const testResult = await ActivityNotificationService.testNotification(activityId, testEmail)
        return NextResponse.json(testResult)

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en API de notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Obtener estadísticas de notificaciones
    const result = await ActivityNotificationService.sendUpcomingActivityNotifications()
    return NextResponse.json({
      message: "Verificación de notificaciones completada",
      result
    })
  } catch (error) {
    console.error("Error verificando notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}