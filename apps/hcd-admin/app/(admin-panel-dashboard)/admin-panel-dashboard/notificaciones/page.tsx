"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  enableNotifications: boolean;
  notificationEmails: string;
  lastNotificationSent?: string;
}

export default function NotificationsTestPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [smtpStatus, setSMTPStatus] = useState<any>(null);

  useEffect(() => {
    fetchActivities();
    checkSMTPConfig();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities?showAll=true&onlyPublished=false");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.filter((a: Activity) => a.enableNotifications && a.notificationEmails));
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const checkSMTPConfig = async () => {
    try {
      const response = await fetch("/api/test-email");
      if (response.ok) {
        const data = await response.json();
        setSMTPStatus(data);
      }
    } catch (error) {
      console.error("Error checking SMTP config:", error);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setMessage("❌ Ingresa un email de prueba");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("✅ Email de prueba enviado correctamente");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error al enviar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testActivityNotification = async (activityId: number) => {
    if (!testEmail) {
      setMessage("❌ Ingresa un email de prueba primero");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/activities/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "test", 
          activityId, 
          testEmail 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Notificación de actividad enviada a ${testEmail}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error al enviar notificación: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendAllNotifications = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/activities/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_all" })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Proceso completado. Notificaciones enviadas: ${data.notified}`);
        fetchActivities(); // Refrescar lista
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error al procesar notificaciones: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runNotificationScript = async () => {
    setLoading(true);
    setMessage("🚀 Ejecutando script de notificaciones...");

    try {
      const response = await fetch("/api/activities/notifications");
      const data = await response.json();
      
      if (data.result.success) {
        setMessage(`✅ Script ejecutado. Notificaciones enviadas: ${data.result.notified}`);
      } else {
        setMessage(`❌ Error en script: ${data.result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error ejecutando script: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Panel de Pruebas de Notificaciones</h1>

      {/* Estado SMTP */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Estado de Configuración SMTP</h2>
        {smtpStatus ? (
          <div className={`p-3 rounded ${smtpStatus.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-medium">
              {smtpStatus.configured ? '✅ SMTP Configurado' : '❌ SMTP No Configurado'}
            </div>
            <div className="text-sm mt-2">
              {smtpStatus.message}
            </div>
            {!smtpStatus.configured && (
              <details className="mt-2">
                <summary className="cursor-pointer">Ver configuración actual</summary>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                  {JSON.stringify(smtpStatus.config, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Verificando configuración...</div>
        )}
      </Card>

      {/* Prueba de Email Básico */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Prueba de Email Básico</h2>
        <div className="flex gap-3 mb-3">
          <Input
            type="email"
            placeholder="email@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !smtpStatus?.configured}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Enviando..." : "Enviar Prueba"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Envía un email de prueba básico para verificar la configuración SMTP.
        </p>
      </Card>

      {/* Controles de Notificaciones */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Controles de Notificaciones</h2>
        <div className="flex gap-3 mb-3">
          <Button 
            onClick={sendAllNotifications} 
            disabled={loading || !smtpStatus?.configured}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Procesando..." : "📧 Enviar Notificaciones Pendientes"}
          </Button>
          <Button 
            onClick={runNotificationScript} 
            disabled={loading || !smtpStatus?.configured}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {loading ? "Ejecutando..." : "🚀 Ejecutar Script Manual"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Procesa todas las actividades y envía notificaciones según la configuración de cada una.
        </p>
      </Card>

      {/* Lista de Actividades con Notificaciones */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-3">Actividades con Notificaciones Habilitadas</h2>
        {activities.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">
            No hay actividades con notificaciones configuradas
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>📅 {new Date(activity.date).toLocaleString('es-AR')}</div>
                      <div>📧 {activity.notificationEmails}</div>
                      {activity.lastNotificationSent && (
                        <div>⏰ Última notificación: {new Date(activity.lastNotificationSent).toLocaleString('es-AR')}</div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => testActivityNotification(activity.id)}
                    disabled={loading || !testEmail || !smtpStatus?.configured}
                    size="sm"
                    variant="outline"
                    className="ml-3"
                  >
                    Probar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mensajes */}
      {message && (
        <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-200">
          <div className="text-sm">{message}</div>
        </div>
      )}

      {/* Instrucciones */}
      <Card className="p-4 mt-6 bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">📝 Instrucciones de Uso</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li><strong>1.</strong> Verifica que la configuración SMTP esté completa</li>
          <li><strong>2.</strong> Ingresa tu email en el campo de prueba</li>
          <li><strong>3.</strong> Prueba el envío básico de emails</li>
          <li><strong>4.</strong> Prueba notificaciones específicas de actividades</li>
          <li><strong>5.</strong> Ejecuta el proceso completo de notificaciones</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
          <strong>Nota:</strong> Para que las notificaciones se envíen automáticamente, configura un cron job:
          <code className="block mt-1 bg-white p-1 rounded">
            0 * * * * cd /path/to/hcd-admin && npm run send-notifications
          </code>
        </div>
      </Card>
    </div>
  );
}