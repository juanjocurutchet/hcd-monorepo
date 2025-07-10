"use client";

import { useEffect, useState } from "react";

interface Activity {
  id: number;
  title: string;
  description: string;
  location?: string;
  date: string;
  isPublished: boolean;
}

export default function ActivityStats() {
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
    return <div className="flex items-center gap-2 text-gray-500">Cargando estadísticas…</div>;
  }

  const now = new Date();
  const total = activities.length;
  const upcoming = activities.filter(a => new Date(a.date) > now).length;
  const published = activities.filter(a => a.isPublished).length;
  const drafts = activities.filter(a => !a.isPublished).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center border">
        <span className="text-2xl font-bold text-blue-700">{total}</span>
        <span className="text-gray-600 mt-1">Total de actividades</span>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center border">
        <span className="text-2xl font-bold text-green-700">{upcoming}</span>
        <span className="text-gray-600 mt-1">Próximas</span>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center border">
        <span className="text-2xl font-bold text-indigo-700">{published}</span>
        <span className="text-gray-600 mt-1">Publicadas</span>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center border">
        <span className="text-2xl font-bold text-yellow-700">{drafts}</span>
        <span className="text-gray-600 mt-1">Borradores</span>
      </div>
    </div>
  );
}