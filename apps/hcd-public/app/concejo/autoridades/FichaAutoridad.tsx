"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react"
import Image from "next/image"

export type Autoridad = {
  id: number
  name: string
  position: string | null
  email: string | null
  telefono?: string | null
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  blockName: string | null
  imageUrl?: string | null
  seniorPosition?: string | null
  bio?: string | null
}

export function FichaAutoridad({ autoridad, cargo }: { autoridad: Autoridad, cargo: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition">
          <div className="w-32 h-32 mb-4">
            <Image
              src={autoridad.imageUrl || "/placeholder-user.jpg"}
              alt={autoridad.name}
              width={128}
              height={128}
              className="rounded-full object-cover w-32 h-32 border"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{cargo}</h2>
            <div className="font-medium text-lg mt-1">{autoridad.name}</div>
            {Boolean(autoridad.blockName && autoridad.blockName.trim()) && (
              <div className="text-gray-500 text-sm">{autoridad.blockName}</div>
            )}
            <div className="flex justify-center gap-2 mt-2">
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  <Mail className="w-5 h-5" />
                  <span className="underline text-sm">Contacto</span>
                </button>
              </DialogTrigger>
            </div>
          </div>
        </div>
      </DialogTrigger>
      {/* Modal de ficha completa */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cargo}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <Image
            src={autoridad.imageUrl || "/placeholder-user.jpg"}
            alt={autoridad.name}
            width={128}
            height={128}
            className="rounded-full object-cover w-32 h-32 border mb-2"
          />
          <div className="font-bold text-lg mb-1">{autoridad.name}</div>
          {Boolean(autoridad.blockName && autoridad.blockName.trim()) && (
            <div className="text-gray-500 text-sm mb-1">{autoridad.blockName}</div>
          )}
          <div className="text-sm mb-2">
            <strong>Contacto:</strong> {autoridad.email || autoridad.telefono ? "" : "No disponible"}
            {autoridad.email && (
              <a href={`mailto:${autoridad.email}`} className="ml-2 text-blue-600 hover:underline inline-flex items-center"><Mail className="w-4 h-4 mr-1" />{autoridad.email}</a>
            )}
            {autoridad.telefono && (
              <a href={`tel:${autoridad.telefono}`} className="ml-2 text-blue-600 hover:underline inline-flex items-center"><Phone className="w-4 h-4 mr-1" />{autoridad.telefono}</a>
            )}
          </div>
          <div className="flex gap-2 mb-2">
            {autoridad.facebook && (
              <a href={autoridad.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Facebook className="w-5 h-5" /></a>
            )}
            {autoridad.instagram && (
              <a href={autoridad.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800"><Instagram className="w-5 h-5" /></a>
            )}
            {autoridad.twitter && (
              <a href={autoridad.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700"><Twitter className="w-5 h-5" /></a>
            )}
          </div>
          {autoridad.bio && (
            <div className="mt-2 text-sm text-gray-700 max-w-md text-center whitespace-pre-line">{autoridad.bio}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}