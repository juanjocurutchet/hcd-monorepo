"use client";
import { ArrowLeft, Calendar, Download, FileText, MapPin, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/activities/${id}`);
        if (!res.ok) throw new Error("Error al obtener la actividad");
        const data = await res.json();
        setActivity(data);
      } catch (err) {
        setError("No se pudo cargar la actividad");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchActivity();
  }, [id]);

  if (loading) return <div className="text-center text-gray-500 py-16">Cargando actividad…</div>;
  if (error) return <div className="text-center text-red-500 py-16">{error}</div>;
  if (!activity) return null;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-700 text-sm px-2 py-1 rounded transition"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>
        <button
          onClick={() => router.push("/actividades")}
          className="text-gray-400 hover:text-red-500 p-1 rounded-full transition"
          title="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          {activity.image_url ? (
            <img src={activity.image_url} alt="imagen actividad" className="w-16 h-16 rounded object-cover" />
          ) : (
            <FileText className="w-12 h-12 text-blue-400" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{activity.title}</h1>
            <div className="flex gap-2 items-center">
              {activity.is_published ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Publicada</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Borrador</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-700 text-base whitespace-pre-line">{activity.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(activity.date).toLocaleString("es-ES", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          {activity.location && (
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {activity.location}</span>
          )}
        </div>
        {/* Adjuntos */}
        {activity.file_url && (
          <div className="flex gap-2 mt-4">
            <a href={activity.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
              <Download className="w-4 h-4" /> Ver adjunto
            </a>
            <a href={activity.file_url} download className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 flex items-center gap-1">
              <Download className="w-4 h-4" /> Descargar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}