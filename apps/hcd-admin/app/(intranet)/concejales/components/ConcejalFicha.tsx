"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Phone } from "lucide-react"
import Image from "next/image"

export type Concejal = {
  id: number
  name: string
  position: string | null
  seniorPosition?: string | null
  email?: string | null
  telefono?: string | null
  blockName?: string | null
  imageUrl?: string | null
  bio?: string | null
}

export function ConcejalFicha({ concejal }: { concejal: Concejal }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
          {concejal.imageUrl ? (
            <Image
              src={concejal.imageUrl}
              alt={concejal.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
          )}
          <div>
            <div className="font-medium">{concejal.name}</div>
            <div className="text-sm text-gray-500">{concejal.blockName || "Sin bloque"}</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{concejal.seniorPosition || concejal.position || "Concejal"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <Image
            src={concejal.imageUrl || "/placeholder-user.jpg"}
            alt={concejal.name}
            width={128}
            height={128}
            className="rounded-full object-cover w-32 h-32 border mb-2"
          />
          <div className="font-bold text-lg mb-1">{concejal.name}</div>
          <div className="text-gray-500 text-sm mb-1">{concejal.blockName || "Sin bloque"}</div>
          <div className="text-sm mb-2">
            <strong>Contacto:</strong> {concejal.email || concejal.telefono ? "" : "No disponible"}
            {concejal.email && (
              <a href={`mailto:${concejal.email}`} className="ml-2 text-blue-600 hover:underline inline-flex items-center"><Mail className="w-4 h-4 mr-1" />{concejal.email}</a>
            )}
            {concejal.telefono && (
              <a href={`tel:${concejal.telefono}`} className="ml-2 text-blue-600 hover:underline inline-flex items-center"><Phone className="w-4 h-4 mr-1" />{concejal.telefono}</a>
            )}
          </div>
          {concejal.bio && (
            <div className="mt-2 text-sm text-gray-700 max-w-md text-center whitespace-pre-line">{concejal.bio}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}