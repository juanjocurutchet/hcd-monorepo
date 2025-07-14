"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Eye, Play, Video } from "lucide-react"
import { useState } from "react"

interface Proyecto {
  id: number
  expedienteNumber: string
  descripcion: string
  fileUrl?: string
}

interface Sesion {
  id: number
  fecha: string
  titulo: string
  ordenDiaUrl?: string
  actaUrl?: string
  audioUrl?: string
  videoUrl?: string
  proyectos: Proyecto[]
}

export default function SesionAcordeon({ sesion }: { sesion: Sesion }) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<string | null>(null)
  const [audioOpen, setAudioOpen] = useState(false)

  // Helper para tipo de archivo
  function getFileType(url?: string) {
    if (!url) return 'other'
    const ext = url.split('.').pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) return 'image'
    if (ext === 'pdf') return 'pdf'
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext!)) return 'doc'
    return 'other'
  }

  return (
    <div className="border rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <button
        className="w-full text-left p-6 flex items-center justify-between bg-white hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div>
          <h2 className="text-xl font-bold text-[#0e4c7d] mb-1">{sesion.titulo}</h2>
          <div className="text-gray-600 text-sm">{new Date(sesion.fecha).toLocaleDateString('es-AR')}</div>
        </div>
        <span className="ml-4 text-2xl">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="bg-gray-50 border-t px-6 py-4 space-y-6">
          {/* Orden del día */}
          <div>
            <h3 className="font-semibold text-[#0a3d68] mb-2">Orden del día</h3>
            {sesion.ordenDiaUrl ? (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={() => {
                        setPreviewUrl(sesion.ordenDiaUrl!);
                        setPreviewType(getFileType(sesion.ordenDiaUrl))
                      }}
                    >
                      <Eye className="w-5 h-5" /> Ver
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-full">
                    <DialogHeader>
                      <DialogTitle>Previsualización de archivo</DialogTitle>
                    </DialogHeader>
                    {previewType === 'pdf' && previewUrl && (
                      <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />
                    )}
                    {previewType === 'image' && previewUrl && (
                      <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />
                    )}
                    {previewType === 'doc' && previewUrl && (
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                        style={{ width: '100%', height: 600 }}
                        frameBorder="0"
                        title="Vista previa DOC"
                      />
                    )}
                    {previewType === 'other' && previewUrl && (
                      <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>
                    )}
                  </DialogContent>
                </Dialog>
                <a
                  href={sesion.ordenDiaUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="w-5 h-5" /> Descargar
                </a>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No disponible</div>
            )}
          </div>
          {/* Acta de la sesión */}
          <div>
            <h3 className="font-semibold text-[#0a3d68] mb-2">Acta de la sesión</h3>
            {sesion.actaUrl ? (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={() => {
                        setPreviewUrl(sesion.actaUrl!);
                        setPreviewType(getFileType(sesion.actaUrl))
                      }}
                    >
                      <Eye className="w-5 h-5" /> Ver
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-full">
                    <DialogHeader>
                      <DialogTitle>Previsualización de archivo</DialogTitle>
                    </DialogHeader>
                    {previewType === 'pdf' && previewUrl && (
                      <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />
                    )}
                    {previewType === 'image' && previewUrl && (
                      <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />
                    )}
                    {previewType === 'doc' && previewUrl && (
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                        style={{ width: '100%', height: 600 }}
                        frameBorder="0"
                        title="Vista previa DOC"
                      />
                    )}
                    {previewType === 'other' && previewUrl && (
                      <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>
                    )}
                  </DialogContent>
                </Dialog>
                <a
                  href={sesion.actaUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="w-5 h-5" /> Descargar
                </a>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No disponible</div>
            )}
          </div>
          {/* Audio de la sesión */}
          <div>
            <h3 className="font-semibold text-[#0a3d68] mb-2">Audio de la sesión</h3>
            {sesion.audioUrl ? (
              <div className="flex gap-2 items-center">
                <button
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  onClick={() => setAudioOpen((v) => !v)}
                >
                  <Play className="w-5 h-5" /> Escuchar
                </button>
                <a
                  href={sesion.audioUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="w-5 h-5" /> Descargar
                </a>
                {audioOpen && (
                  <audio controls src={sesion.audioUrl} className="ml-4 max-w-xs">
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No disponible</div>
            )}
          </div>
          {/* Video de la sesión */}
          <div>
            <h3 className="font-semibold text-[#0a3d68] mb-2">Video de la sesión</h3>
            {sesion.videoUrl ? (
              <a
                href={sesion.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Video className="w-5 h-5" /> Ver video
              </a>
            ) : (
              <div className="text-gray-400 text-sm">No disponible</div>
            )}
          </div>
          {/* Proyectos de la sesión */}
          <div>
            <h3 className="font-semibold text-[#0a3d68] mb-2">Proyectos de la sesión</h3>
            {sesion.proyectos.length === 0 ? (
              <div className="text-gray-400 text-sm">No hay proyectos en esta sesión</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border text-center">Expte N°</th>
                      <th className="px-3 py-2 border text-center">Descripción</th>
                      <th className="px-3 py-2 border text-center">Archivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesion.proyectos.map((p) => {
                      const type = getFileType(p.fileUrl)
                      return (
                        <tr key={p.id}>
                          <td className="border px-3 py-2 text-center">{p.expedienteNumber}</td>
                          <td className="border px-3 py-2">{p.descripcion}</td>
                          <td className="border px-3 py-2 text-center">
                            {p.fileUrl ? (
                              <div className="flex gap-2 justify-center">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Ver archivo"
                                      onClick={() => {
                                        setPreviewUrl(p.fileUrl!);
                                        setPreviewType(type);
                                      }}
                                    >
                                      <Eye className="w-5 h-5 inline" />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl w-full">
                                    <DialogHeader>
                                      <DialogTitle>Previsualización de archivo</DialogTitle>
                                    </DialogHeader>
                                    {previewType === 'pdf' && previewUrl && (
                                      <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />
                                    )}
                                    {previewType === 'image' && previewUrl && (
                                      <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />
                                    )}
                                    {previewType === 'doc' && previewUrl && (
                                      <iframe
                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                                        style={{ width: '100%', height: 600 }}
                                        frameBorder="0"
                                        title="Vista previa DOC"
                                      />
                                    )}
                                    {previewType === 'other' && previewUrl && (
                                      <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <a
                                  href={p.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Descargar archivo"
                                >
                                  <Download className="w-5 h-5 inline" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}