"use client";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        <Link href="/admin-panel/sesiones/nueva" className="text-blue-600 hover:underline">
          Agregar sesión
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando sesiones...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <ul className="space-y-4">
          {sesiones.map((sesion) => (
            <li
              key={sesion.id}
              className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <Link
                href={`/admin-panel/sesiones/${sesion.id}`}
                className="flex-1 flex items-center space-x-4 min-w-0"
                prefetch={false}
                style={{ textDecoration: 'none' }}
              >
                <div className="w-2 h-10 rounded bg-green-400" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">
                    {formatDate(sesion.date)} — {sesion.type}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {sesion.isPublished ? "Publicada" : "No publicada"}
                  </p>
                </div>
              </Link>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(sesion.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!loading && sesiones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay sesiones creadas aún.</p>
          <Link
            href="/admin-panel/sesiones/nueva"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera sesión
          </Link>
        </div>
      )}
    </div>
  );
}