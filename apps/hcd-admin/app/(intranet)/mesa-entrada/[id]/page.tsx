"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Proyecto {
  id: number;
  fechaEntrada: string;
  prefijoOrigen: string;
  numeroExpediente: string;
  origen: string;
  tipo: string;
  titulo: string;
  fileUrl: string | null;
}

export default function DetalleSesionPage() {
  const params = useParams();
  const sesionId = params?.id;
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProyectos = async () => {
      if (!sesionId) return;

      try {
        const response = await fetch(`/api/sessions/${sesionId}/files`);
        if (response.ok) {
          const data = await response.json();
          setProyectos(data);
        } else {
          setError("Error al cargar los proyectos");
        }
      } catch (error) {
        console.error("Error fetching proyectos:", error);
        setError("Error al cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, [sesionId]);

    if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
        <div className="w-[90%] mx-auto bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">Proyectos en sesión</h1>
          <div className="text-center py-20">
            <div className="text-blue-600">Cargando proyectos...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
        <div className="w-[90%] mx-auto bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">Proyectos en sesión</h1>
          <div className="text-center py-20">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
      <div className="w-[90%] mx-auto bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">Proyectos en sesión</h1>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden shadow-sm bg-white">
            <thead>
              <tr className="bg-blue-50 text-blue-900 text-sm">
                <th className="px-4 py-3">Fecha de ingreso</th>
                <th className="px-4 py-3">Expte</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Archivo</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-8">No hay proyectos cargados para esta sesión.</td>
                </tr>
              ) : (
                proyectos.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-2 text-center text-xs">{new Date(p.fechaEntrada).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                    <td className="px-4 py-2 text-center text-xs font-semibold">{p.prefijoOrigen}-{p.numeroExpediente}</td>
                    <td className="px-4 py-2 text-center text-xs">{p.origen}</td>
                    <td className="px-4 py-2 text-center text-xs">{p.tipo}</td>
                    <td className="px-4 py-2 text-center text-xs">{p.titulo}</td>
                    <td className="px-4 py-2 text-center text-xs">
                      {p.fileUrl ? (
                        <a
                          href={p.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Ver archivo
                        </a>
                      ) : (
                        <span className="text-gray-400">Sin archivo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-center">
          <Link href="/mesa-entrada" className="inline-block px-6 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold shadow hover:bg-blue-200 transition">Volver a Mesa de Entrada</Link>
        </div>
      </div>
    </div>
  );
}