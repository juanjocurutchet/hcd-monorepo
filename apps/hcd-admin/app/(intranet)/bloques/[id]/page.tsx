"use client"

import type { CouncilMember } from "@/actions/council-actions"
import { useApiRequest } from "@/hooks/useApiRequest"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import BloqueForm from "../components/bloque-form"

// Función para convertir fechas de string a Date
function convertCouncilMemberDates(member: any): CouncilMember {
  return {
    ...member,
    createdAt: new Date(member.createdAt),
    updatedAt: new Date(member.updatedAt)
  }
}

interface BloqueData {
  id: number
  name: string
  color: string | null
  president: CouncilMember | null
  members: CouncilMember[]
}

export default function EditBloquePage({ params }: { params: Promise<{ id: string }> }) {
  const [bloque, setBloque] = useState<BloqueData | null>(null)
  const [concejales, setConcejales] = useState<CouncilMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [dataLoaded, setDataLoaded] = useState(false)
  const { apiRequest, isAuthenticated } = useApiRequest()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      // Evitar cargar datos múltiples veces
      if (dataLoaded) return

      try {
        console.log("loadData - Iniciando carga de datos")
        const { id } = await params
        const numericId = Number(id)
        console.log("ID numérico:", numericId)

        if (isNaN(numericId)) {
          setError("ID inválido")
          return
        }

        // Cargar el bloque específico
        console.log("Cargando bloque con ID:", numericId)
        const bloqueResponse = await fetch(`/api/political-blocks/${numericId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log("Respuesta del bloque:", bloqueResponse.status, bloqueResponse.statusText)

        if (!bloqueResponse.ok) {
          const errorText = await bloqueResponse.text()
          console.error("Error en respuesta del bloque:", errorText)
          throw new Error("Error al cargar el bloque")
        }

        const bloqueData = await bloqueResponse.json()
        console.log("Datos del bloque recibidos:", bloqueData)

        // Convertir fechas de string a Date
        const bloqueConvertido = {
          ...bloqueData,
          president: bloqueData.president ? convertCouncilMemberDates(bloqueData.president) : null,
          members: bloqueData.members ? bloqueData.members.map(convertCouncilMemberDates) : []
        }

        setBloque(bloqueConvertido)

        // Cargar todos los concejales activos
        console.log("Cargando concejales")
        const concejalesResponse = await fetch("/api/council-members", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log("Respuesta de concejales:", concejalesResponse.status, concejalesResponse.statusText)

        if (!concejalesResponse.ok) {
          const errorText = await concejalesResponse.text()
          console.error("Error en respuesta de concejales:", errorText)
          throw new Error("Error al cargar los concejales")
        }

        const concejalesData = await concejalesResponse.json()
        console.log("Datos de concejales recibidos:", concejalesData.length, "concejales")

        // Convertir fechas de concejales
        const concejalesConvertidos = concejalesData.map(convertCouncilMemberDates)
        setConcejales(concejalesConvertidos)

        setDataLoaded(true)
      } catch (error) {
        console.error("Error cargando datos:", error)
        setError("Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && !dataLoaded) {
      loadData()
    } else if (!isAuthenticated) {
      console.log("Usuario no autenticado")
    }
  }, [params, isAuthenticated, dataLoaded])

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">No autorizado. Por favor, inicia sesión.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Editar Bloque</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Editar Bloque</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!bloque) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Editar Bloque</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-600">Bloque no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar Bloque</h1>
      <BloqueForm
        bloque={bloque}
        concejales={concejales}
        miembrosActuales={bloque.members}
      />
    </div>
  )
}
