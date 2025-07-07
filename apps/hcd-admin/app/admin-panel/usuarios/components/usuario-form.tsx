"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Usuario {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export function UsuarioForm({ usuario }: { usuario?: Usuario | null }) {
  const router = useRouter()
  const pathname = usePathname();

  // Estado inicial forzado
  const initialFormData = usuario
    ? {
        name: usuario.name || "",
        email: usuario.email || "",
        password: "",
        confirmPassword: "",
        role: usuario.role || "ADMIN",
      }
    : {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ADMIN",
      };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
    if (!usuario) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ADMIN",
      });
    }
    if (pathname.endsWith("/usuarios/nuevo")) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ADMIN",
      });
    }
    // eslint-disable-next-line
  }, [usuario, pathname]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsSubmitting(false)
      return
    }

    try {
      const data: { name: string; email: string; role: string; password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      // Solo incluir la contraseña si se está creando un nuevo usuario o si se ha ingresado una nueva contraseña
      if (!usuario || formData.password) {
        data.password = formData.password
      }

      const url = usuario ? `/api/users/${usuario.id}` : "/api/auth/register"
      const method = usuario ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el usuario")
      }

      router.push("/admin-panel/usuarios")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!usuario?.id) return
    setDeleting(true)
    setError("")
    try {
      const response = await fetch(`/api/users/${usuario.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el usuario")
      }
      router.push("/admin-panel/usuarios")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido")
      }
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleUpdateClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUpdateModal(true);
  }

  const handleConfirmUpdate = async () => {
    setShowUpdateModal(false);
    setIsSubmitting(true);
    setError("");

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    try {
      const data: { name: string; email: string; role: string; password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (!usuario || formData.password) {
        data.password = formData.password;
      }
      const url = usuario ? `/api/users/${usuario.id}` : "/api/auth/register";
      const method = usuario ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el usuario");
      }
      router.push("/admin-panel/usuarios");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={usuario ? handleUpdateClick : handleSubmit} className="space-y-6" autoComplete="off">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="correo@ejemplo.com"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {usuario ? "Nueva contraseña (dejar en blanco para mantener la actual)" : "Contraseña"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required={!usuario}
                placeholder="Contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!usuario || formData.password.length > 0}
                placeholder="Confirmar contraseña"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value: any) => handleSelectChange("role", value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="BLOQUE">Bloque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#0e4c7d] hover:bg-[#0a3d68]" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : usuario ? "Actualizar" : "Crear"}
            </Button>
            {usuario?.id && (
              <Button
                type="button"
                variant="destructive"
                className="ml-2"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting || deleting}
              >
                Eliminar usuario
              </Button>
            )}
          </div>
        </form>
        {/* Modal de confirmación de actualización */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Confirmar actualización</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres actualizar los datos del usuario <strong>{formData.name}</strong>?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-[#0e4c7d] hover:bg-[#0a3d68]"
                  onClick={handleConfirmUpdate}
                  disabled={isSubmitting}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar el usuario <strong>{formData.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
