"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Activity {
  id: number;
  title: string;
  description: string;
  location?: string;
  date: string;
  isPublished: boolean;
}

export default function UpcomingActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Error al obtener actividades");
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow border col-span-1">Cargando próximas actividades…</div>;
  }

  const now = new Date();
  const upcoming = activities
    .filter(a => new Date(a.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-lg shadow border col-span-1 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Próximas Actividades</h2>
      {upcoming.length === 0 ? (
        <div className="text-gray-500">No hay actividades próximas.</div>
      ) : (
        <ul className="space-y-4">
          {upcoming.map(activity => (
            <li key={activity.id} className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0">
              <span className="font-medium text-gray-900">{activity.title}</span>
              <span className="text-sm text-gray-600">{new Date(activity.date).toLocaleString("es-ES", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              <span className={`text-xs rounded px-2 py-0.5 w-fit ${activity.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{activity.isPublished ? 'Publicada' : 'Borrador'}</span>
              <Link href={`/actividades/${activity.id}`} className="text-blue-600 text-xs hover:underline">Ver detalles</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}