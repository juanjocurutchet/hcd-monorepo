"use client"

import { ChevronDown, ChevronUp, Download, Eye, Facebook, Instagram, Mail, Phone, Twitter, FileText } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Concejal {
  id: number
  name: string
  position?: string
  imageUrl?: string
  email?: string
  telefono?: string
  facebook?: string
  instagram?: string
  twitter?: string
}

interface Bloque {
  id: number
  name: string
  description?: string
  color?: string
  memberCount?: number
  president?: { name: string }
  concejales: Concejal[]
  secretario?: Concejal
}

interface ProjectsByYear {
  [year: number]: Array<{
    id: number
    numeroExpediente: string
    fechaEntrada: string
    titulo: string
    descripcion?: string
    tipo: string
    fileUrl?: string
  }>
}

interface CouncilMemberProjects {
  totalProjects: number
  projectsByYear: ProjectsByYear
}

export default function BloquesAccordion({ bloques }: { bloques: Bloque[] }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [openCouncilMemberId, setOpenCouncilMemberId] = useState<number | null>(null)
  const [councilMemberProjects, setCouncilMemberProjects] = useState<Record<number, CouncilMemberProjects>>({})
  const [loadingProjects, setLoadingProjects] = useState<Record<number, boolean>>({})

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
                {(bloque.concejales || []).map((concejal) => {
                  const isExpanded = openCouncilMemberId === concejal.id
                  const projects = councilMemberProjects[concejal.id]
                  const isLoading = loadingProjects[concejal.id]

                  const handleCouncilMemberClick = async () => {
                    if (isExpanded) {
                      setOpenCouncilMemberId(null)
                    } else {
                      setOpenCouncilMemberId(concejal.id)
                      
                      // Cargar proyectos si no están cargados
                      if (!projects && !isLoading) {
                        setLoadingProjects(prev => ({ ...prev, [concejal.id]: true }))
                        try {
                          const response = await fetch(`/api/council-members/${concejal.id}/projects`)
                          const data = await response.json()
                          if (data.success) {
                            setCouncilMemberProjects(prev => ({
                              ...prev,
                              [concejal.id]: {
                                totalProjects: data.totalProjects,
                                projectsByYear: data.projectsByYear
                              }
                            }))
                          }
                        } catch (error) {
                          console.error('Error loading projects:', error)
                        } finally {
                          setLoadingProjects(prev => ({ ...prev, [concejal.id]: false }))
                        }
                      }
                    }
                  }

                  return (
                    <div key={concejal.id} className="bg-gray-50 rounded-lg shadow">
                      {/* Card principal del concejal */}
                      <div 
                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={handleCouncilMemberClick}
                      >
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
                              <a 
                                href={`mailto:${concejal.email}`} 
                                className="text-blue-700 flex items-center gap-1 text-sm hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-4 h-4" />{concejal.email}
                              </a>
                            )}
                            {concejal.telefono && (
                              <a 
                                href={`tel:${concejal.telefono}`} 
                                className="text-blue-700 flex items-center gap-1 text-sm hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-4 h-4" />{concejal.telefono}
                              </a>
                            )}
                            <div className="flex gap-2 mt-1">
                              {concejal.facebook && (
                                <a 
                                  href={concejal.facebook} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Facebook className="w-5 h-5" />
                                </a>
                              )}
                              {concejal.instagram && (
                                <a 
                                  href={concejal.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-pink-600 hover:text-pink-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Instagram className="w-5 h-5" />
                                </a>
                              )}
                              {concejal.twitter && (
                                <a 
                                  href={concejal.twitter} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sky-500 hover:text-sky-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Twitter className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-600">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Desplegable con proyectos */}
                      {isExpanded && (
                        <div className="border-t bg-white p-4">
                          <h4 className="font-semibold text-lg mb-3 text-[#0e4c7d]">Proyectos Presentados</h4>
                          
                          {isLoading ? (
                            <div className="text-center py-4 text-gray-500">Cargando proyectos...</div>
                          ) : projects && projects.totalProjects > 0 ? (
                            <div className="space-y-4">
                              <div className="text-sm text-gray-600 mb-3">
                                Total de proyectos: {projects.totalProjects}
                              </div>
                              
                              {Object.keys(projects.projectsByYear)
                                .sort((a, b) => parseInt(b) - parseInt(a))
                                .map(year => (
                                  <div key={year} className="mb-6">
                                    <h5 className="font-medium text-gray-700 mb-2 border-b pb-1">
                                      Año {year} ({projects.projectsByYear[parseInt(year)].length} proyectos)
                                    </h5>
                                    <div className="space-y-2">
                                      {projects.projectsByYear[parseInt(year)].map(project => (
                                        <div key={project.id} className="bg-gray-50 rounded p-3 border">
                                          <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">{project.numeroExpediente}</div>
                                              <div className="text-sm text-gray-700 mt-1">{project.titulo}</div>
                                              <div className="text-xs text-gray-500 mt-1">
                                                {project.tipo} • {new Date(project.fechaEntrada).toLocaleDateString('es-ES')}
                                              </div>
                                            </div>
                                            {/* Botones a la derecha */}
                                            <div className="flex flex-col gap-2 items-end min-w-[140px] ml-4">
                                              {project.fileUrl && (
                                                <>
                                                  <Dialog>
                                                    <DialogTrigger asChild>
                                                      <Button variant="outline" size="sm">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Previsualizar
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl w-full">
                                                      <DialogHeader>
                                                        <DialogTitle>Previsualización de archivo</DialogTitle>
                                                      </DialogHeader>
                                                      {(() => {
                                                        const ext = project.fileUrl?.split('.').pop()?.toLowerCase() || "";
                                                        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                                                          return <img src={project.fileUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />;
                                                        } else if (ext === 'pdf') {
                                                          return <embed src={project.fileUrl} type="application/pdf" width="100%" height="600px" />;
                                                        } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
                                                          return <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(project.fileUrl)}&embedded=true`} style={{ width: '100%', height: 600 }} frameBorder="0" title="Vista previa DOC" />;
                                                        } else {
                                                          return <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>;
                                                        }
                                                      })()}
                                                    </DialogContent>
                                                  </Dialog>
                                                  <Button variant="outline" size="sm" asChild>
                                                    <a href={project.fileUrl} download target="_blank" rel="noopener noreferrer">
                                                      <Download className="w-4 h-4 mr-2" />
                                                      Descargar
                                                    </a>
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <div className="text-lg mb-2">📋</div>
                              <div>Este concejal aún no ha presentado proyectos</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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