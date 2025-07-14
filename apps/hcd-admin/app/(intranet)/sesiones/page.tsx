"use client";

import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { useEffect, useState } from "react";
import SesionAcordeon from "./components/SesionAcordeon";

interface Session {
  id: number;
  date: string;
  type: string;
  isPublished: boolean;
}

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSesiones = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions?onlyPublished=false");
      if (!res.ok) throw new Error("Error al obtener sesiones");
      const data = await res.json();
      setSesiones(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSesiones();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta sesión?")) return;
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la sesión");
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Error desconocido");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sesiones</h1>
        {/* <Link href="/admin-panel-dashboard/sesiones/nueva" className="text-blue-600 hover:underline">
          Agregar sesión
        </Link> */}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando sesiones...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {sesiones.map((sesion) => (
            <SesionAcordeon
              key={sesion.id}
              sesion={{
                id: sesion.id,
                fecha: sesion.date,
                titulo: `${formatDate(sesion.date)} — ${sesion.type}`,
                ordenDiaUrl: (sesion as any).ordenDiaUrl ?? undefined,
                actaUrl: (sesion as any).actaUrl ?? undefined,
                audioUrl: (sesion as any).audioUrl ?? undefined,
                videoUrl: (sesion as any).videoUrl ?? undefined,
                proyectos: (sesion as any).proyectos ?? [],
              }}
            />
          ))}
        </div>
      )}

      {!loading && sesiones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay sesiones creadas aún.</p>
          <Link
            href="/admin-panel-dashboard/sesiones/nueva"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera sesión
          </Link>
        </div>
      )}
    </div>
  );
}