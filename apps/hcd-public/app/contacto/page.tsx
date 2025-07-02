"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    motivo: "",
    nombre: "",
    telefono: "",
    email: "",
    organizacion: "",
    asunto: "",
    mensaje: "",
  })

  const [status, setStatus] = useState<{
    message: string
    type: "success" | "error" | ""
  }>({
    message: "",
    type: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    setStatus({ message: "", type: "" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          organization: formData.organizacion,
          subject: formData.asunto,
          message: formData.mensaje,
          type: formData.motivo,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus({
          message:
            "Gracias por contactarnos. Te responderemos a la brevedad. Se ha enviado una copia a tu correo electrónico.",
          type: "success",
        })

        setFormData({
          motivo: "",
          nombre: "",
          telefono: "",
          email: "",
          organizacion: "",
          asunto: "",
          mensaje: "",
        })
      } else {
        setStatus({
          message: result.error || "Ha ocurrido un error. Por favor, inténtelo de nuevo.",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setStatus({
        message: "Ha ocurrido un error. Por favor, inténtelo de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contacto</h1>

        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <p className="text-lg mb-6">Contáctanos por cualquier inquietud, a la brevedad te responderemos.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {status.message && (
                <Alert
                  className={`mb-4 ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  <AlertDescription>{status.message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="motivo" className="block font-medium mb-2">
                    Motivo del Contacto
                  </label>
                  <select
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="" disabled>
                      Seleccione un motivo
                    </option>
                    <option value="Solicitar información">Solicitar información</option>
                    <option value="Realizar consulta">Realizar consulta</option>
                    <option value="Presentar reclamo">Presentar reclamo</option>
                    <option value="Sugerir iniciativa">Sugerir iniciativa</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="nombre" className="block font-medium mb-2">
                    Nombre y apellido
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ingrese su nombre y apellido..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="telefono" className="block font-medium mb-2">
                    Teléfono
                  </label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ingrese su teléfono..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingrese su E-Mail..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="organizacion" className="block font-medium mb-2">
                    Organización
                  </label>
                  <Input
                    id="organizacion"
                    name="organizacion"
                    value={formData.organizacion}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre de la organización..."
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="asunto" className="block font-medium mb-2">
                    Asunto
                  </label>
                  <Input
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="Ingrese el asunto..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="mensaje" className="block font-medium mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Escriba su mensaje aquí..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="bg-[#29ABE2] hover:bg-[#1D8BB7] text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Contactar"}
                </Button>
              </form>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-800 text-white p-3 mb-2">
                <h3 className="font-medium">Datos del contacto</h3>
              </div>

              <div className="bg-[#29ABE2] text-white p-4">
                <p className="mb-2">Av. San Martín 320, Las Flores</p>
                <p className="mb-2">TE: (2244) 452-123</p>
                <p className="mb-4">secretaria@hcdlasflores.gob.ar</p>

                <div>
                  <p className="mb-2">Seguinos en</p>
                  <div className="flex space-x-2">
                    <Link
                      href="https://youtube.com/channel/UCRVvtXaJETjQvbqUVvOkZAQ"
                      target="_blank"
                      className="hover:text-blue-300"
                    >
                      YouTube
                    </Link>
                    <Link href="https://facebook.com" target="_blank" className="hover:text-blue-300 ml-3">
                      Facebook
                    </Link>
                    <Link href="https://twitter.com" target="_blank" className="hover:text-blue-300 ml-3">
                      Twitter
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
