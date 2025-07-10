"use client";
import { useEffect, useState } from "react";
import ActivityCard from "../../components/ActivityCard";

export default function HomeIntranet() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/activities");
        if (!res.ok) throw new Error("Error al obtener actividades");
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        setError("No se pudieron cargar las actividades");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Actividades programadas</h1>
      {loading ? (
        <div className="text-center text-gray-500 py-16">Cargando actividades…</div>
      ) : error ? (
        <div className="text-center text-red-500 py-16">{error}</div>
      ) : activities.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No hay actividades programadas.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, i) => (
            <ActivityCard
              key={activity.id}
              activity={{
                id: activity.id,
                title: activity.title,
                description: activity.description,
                location: activity.location,
                date: activity.date,
                isPublished: activity.isPublished ?? activity.is_published,
                responsible: "",
                attachmentUrl: "",
                imageUrl: activity.image_url,
              }}
              isNext={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}