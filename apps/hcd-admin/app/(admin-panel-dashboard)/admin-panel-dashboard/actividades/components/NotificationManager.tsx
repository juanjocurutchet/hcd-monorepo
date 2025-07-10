"use client"

import { Bell, Clock, Mail, Send, TestTube } from "lucide-react"
import { useState } from "react"

interface NotificationManagerProps {
  activityId?: number
}

export default function NotificationManager({ activityId }: NotificationManagerProps) {
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleSendAllNotifications = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch('/api/activities/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'send_all' }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✅ Se enviaron ${result.notified} notificaciones`)
        setMessageType('success')
      } else {
        setMessage(`❌ Error: ${result.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('❌ Error al enviar notificaciones')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendImmediateNotification = async () => {
    if (!activityId) {
      setMessage('❌ Se requiere un ID de actividad')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch('/api/activities/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_immediate',
          activityId
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Notificación enviada inmediatamente')
        setMessageType('success')
      } else {
        setMessage(`❌ Error: ${result.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('❌ Error al enviar notificación')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (!activityId || !testEmail) {
      setMessage('❌ Se requiere ID de actividad y email de prueba')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch('/api/activities/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          activityId,
          testEmail
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Email de prueba enviado correctamente')
        setMessageType('success')
        setTestEmail("")
      } else {
        setMessage(`❌ Error: ${result.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('❌ Error al enviar email de prueba')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center mb-4">
        <Bell className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Notificaciones</h3>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Send All Notifications */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enviar todas las notificaciones pendientes</h4>
              <p className="text-sm text-gray-600">
                Envía notificaciones automáticas para todas las actividades próximas
              </p>
            </div>
            <button
              onClick={handleSendAllNotifications}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Todas"}
            </button>
          </div>
        </div>

        {/* Send Immediate Notification */}
        {activityId && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Enviar notificación inmediata</h4>
                <p className="text-sm text-gray-600">
                  Envía notificación para esta actividad específica
                </p>
              </div>
              <button
                onClick={handleSendImmediateNotification}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                {loading ? "Enviando..." : "Enviar Ahora"}
              </button>
            </div>
          </div>
        )}

        {/* Test Notification */}
        {activityId && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Probar notificación</h4>
                <p className="text-sm text-gray-600">
                  Envía un email de prueba para verificar la configuración
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleTestNotification}
                  disabled={loading || !testEmail}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {loading ? "Enviando..." : "Probar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Mail className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Información sobre notificaciones</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Las notificaciones se envían automáticamente según la configuración de cada actividad</li>
              <li>• Se evita el envío de notificaciones duplicadas (mínimo 2 horas entre envíos)</li>
              <li>• Los emails deben estar configurados en cada actividad</li>
              <li>• Se requiere configuración SMTP válida en el servidor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}