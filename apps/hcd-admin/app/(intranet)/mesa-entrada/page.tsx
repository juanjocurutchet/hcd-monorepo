"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Sesion {
  id: number;
  type: string;
  date: string;
  isPublished: boolean;
}

export default function MesaEntradaPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const puedeIngresarProyecto = ["SUPERADMIN", "ADMIN", "BLOQUE"].includes(userRole);

  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSesiones = async () => {
      try {
        const response = await fetch('/api/sessions?onlyPublished=true');
        if (response.ok) {
          const data = await response.json();
          setSesiones(data);
        } else {
          setError("Error al cargar las sesiones");
        }
      } catch (error) {
        console.error("Error fetching sesiones:", error);
        setError("Error al cargar las sesiones");
      } finally {
        setLoading(false);
      }
    };

    fetchSesiones();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-8 drop-shadow-sm">Mesa de Entrada</h1>
        <div className="w-[90%] mx-auto text-center py-20">
          <div className="text-blue-600">Cargando sesiones...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-8 drop-shadow-sm">Mesa de Entrada</h1>
        <div className="w-[90%] mx-auto text-center py-20">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-8 drop-shadow-sm">Mesa de Entrada</h1>
      <div className="w-[90%] mx-auto space-y-6">
        {sesiones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
            <div className="text-gray-500">No hay sesiones publicadas disponibles</div>
          </div>
        ) : (
          sesiones.map((sesion) => (
            <div key={sesion.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
                    {sesion.type}
                  </span>
                  <span className="text-gray-500 text-xs">{new Date(sesion.date).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                </div>
                <h2 className="text-lg font-bold text-blue-800 mb-2">
                  Sesión {sesion.type.toLowerCase()} del {new Date(sesion.date).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                </h2>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <Link href={`/mesa-entrada/${sesion.id}`} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Ver</Link>
                {puedeIngresarProyecto && (
                  <Link href={`/mesa-entrada/${sesion.id}/ingresar`} className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition">Ingresar proyecto</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-center text-gray-400 mt-12">Solo usuarios autorizados pueden ingresar proyectos. El público general puede consultar los proyectos presentados en cada sesión.</p>
    </div>
  );
}