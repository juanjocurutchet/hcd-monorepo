import { Calendar, Download, FileText, MapPin, User } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: number;
  title: string;
  description: string;
  location?: string;
  date: string;
  isPublished: boolean;
  responsible?: string;
  attachmentUrl?: string;
  imageUrl?: string;
}

interface ActivityCardProps {
  activity: Activity;
  isNext?: boolean;
}

export default function ActivityCard({ activity, isNext }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDaysUntil = (dateString: string) => {
    const activityDate = new Date(dateString);
    const now = new Date();
    const activityMidnight = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = activityMidnight.getTime() - nowMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    if (diffDays < 7) return `En ${diffDays} días`;
    return `En ${Math.ceil(diffDays / 7)} semanas`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-3 border hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        {activity.imageUrl ? (
          <img src={activity.imageUrl} alt="imagen actividad" className="w-12 h-12 rounded object-cover" />
        ) : (
          <FileText className="w-10 h-10 text-blue-400" />
        )}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{activity.title}</h2>
          <div className="flex gap-2 items-center">
            {activity.isPublished ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Publicada</span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Borrador</span>
            )}
            {isNext && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Próxima</span>
            )}
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">{getDaysUntil(activity.date)}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm line-clamp-3">{activity.description}</p>
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 items-center">
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(activity.date)}</span>
        {activity.location && (
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {activity.location}</span>
        )}
        {activity.responsible && (
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {activity.responsible}</span>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <Link href={`/actividades/${activity.id}`} className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Ver detalles</Link>
        {activity.attachmentUrl && (
          <a href={activity.attachmentUrl} download className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 flex items-center gap-1">
            <Download className="w-4 h-4" /> Descargar
          </a>
        )}
      </div>
    </div>
  );
}