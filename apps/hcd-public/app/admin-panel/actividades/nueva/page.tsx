import { ActividadForm } from "../components/actividad-form";

export default function NuevaActividadPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Actividad</h1>
        <p className="text-gray-600">Complete el formulario para agregar una nueva actividad</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ActividadForm />
      </div>
    </div>
  )
}
