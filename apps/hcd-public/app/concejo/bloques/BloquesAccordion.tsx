"use client"

import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function BloquesAccordion({ bloques }: { bloques: any[] }) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {bloques.map((bloque) => (
        <div key={bloque.id} className="border rounded-lg shadow-md">
          <button
            className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
            onClick={() => setOpenId(openId === bloque.id ? null : bloque.id)}
            type="button"
          >
            <div className="flex items-center gap-4">
              <div className="w-3 h-12 rounded bg-gray-300" style={{ backgroundColor: bloque.color || "#ccc" }} />
              <div>
                <div className="text-xl font-semibold text-[#0e4c7d]">{bloque.name}</div>
                <div className="text-sm text-gray-600">{bloque.description}</div>
                <div className="text-xs text-gray-500 mt-1">Miembros activos: {bloque.memberCount}</div>
                {bloque.president && (
                  <div className="text-xs text-gray-700 mt-1 font-medium">Presidente: {bloque.president.name}</div>
                )}
              </div>
            </div>
            <span className="ml-4 text-2xl">{openId === bloque.id ? "−" : "+"}</span>
          </button>
          {openId === bloque.id && (
            <div className="p-6 bg-white border-t">
              <div className="flex flex-col gap-4">
                {bloque.concejales.map((concejal: any) => (
                  <div key={concejal.id} className="bg-gray-50 rounded-lg shadow p-4 flex items-center gap-4">
                    <Image
                      src={concejal.imageUrl || "/placeholder-user.jpg"}
                      alt={concejal.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{concejal.name}</div>
                      <div className="text-sm text-gray-600 mb-1">{concejal.position || "Concejal"}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                        {concejal.email && (
                          <a href={`mailto:${concejal.email}`} className="text-blue-700 flex items-center gap-1 text-sm hover:underline"><Mail className="w-4 h-4" />{concejal.email}</a>
                        )}
                        {concejal.telefono && (
                          <a href={`tel:${concejal.telefono}`} className="text-blue-700 flex items-center gap-1 text-sm hover:underline"><Phone className="w-4 h-4" />{concejal.telefono}</a>
                        )}
                        <div className="flex gap-2 mt-1">
                          {concejal.facebook && (
                            <a href={concejal.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Facebook className="w-5 h-5" /></a>
                          )}
                          {concejal.instagram && (
                            <a href={concejal.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800"><Instagram className="w-5 h-5" /></a>
                          )}
                          {concejal.twitter && (
                            <a href={concejal.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700"><Twitter className="w-5 h-5" /></a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Ficha del secretario de bloque */}
                {bloque.secretario && (
                  <div className="bg-blue-50 rounded-lg shadow p-4 flex items-center gap-4 mt-4">
                    <Image
                      src={bloque.secretario.imageUrl || "/placeholder-user.jpg"}
                      alt={bloque.secretario.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{bloque.secretario.name}</div>
                      <div className="text-sm text-blue-800 mb-1 font-medium">Secretario/a de bloque</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                        {bloque.secretario.email && (
                          <a href={`mailto:${bloque.secretario.email}`} className="text-blue-700 flex items-center gap-1 text-sm hover:underline"><Mail className="w-4 h-4" />{bloque.secretario.email}</a>
                        )}
                        {bloque.secretario.telefono && (
                          <a href={`tel:${bloque.secretario.telefono}`} className="text-blue-700 flex items-center gap-1 text-sm hover:underline"><Phone className="w-4 h-4" />{bloque.secretario.telefono}</a>
                        )}
                        <div className="flex gap-2 mt-1">
                          {bloque.secretario.facebook && (
                            <a href={bloque.secretario.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Facebook className="w-5 h-5" /></a>
                          )}
                          {bloque.secretario.instagram && (
                            <a href={bloque.secretario.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800"><Instagram className="w-5 h-5" /></a>
                          )}
                          {bloque.secretario.twitter && (
                            <a href={bloque.secretario.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700"><Twitter className="w-5 h-5" /></a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}