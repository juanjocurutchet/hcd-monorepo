"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("admin@hcdlasflores.gob.ar")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Credenciales inválidas")
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de autenticación</h1>

      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">Estado de la sesión</h2>
        <p className="font-medium">
          Estado: <span className={status === "authenticated" ? "text-green-600" : "text-yellow-600"}>{status}</span>
        </p>
      </div>

      {status === "authenticated" ? (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Sesión activa</CardTitle>
              <CardDescription>Estás autenticado como:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Nombre:</strong> {session.user.name}
                </p>
                <p>
                  <strong>Email:</strong> {session.user.email}
                </p>
                <p>
                  <strong>Rol:</strong> {session.user.role}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogout} variant="destructive">
                Cerrar sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para probar la autenticación</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Contraseña predeterminada para el usuario admin: admin123</p>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="mt-4">
        <p className="text-gray-600">
          Esta página te permite probar la autenticación con NextAuth. Si inicias sesión correctamente, verás los
          detalles de tu sesión. Si hay algún error, verás un mensaje de error.
        </p>
      </div>
    </div>
  )
}
