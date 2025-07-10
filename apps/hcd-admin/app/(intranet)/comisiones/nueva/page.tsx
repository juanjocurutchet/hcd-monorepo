import { ComisionForm } from "../components/comision-form";

export default function NuevaComisionPage() {
  return (
    <div className="w-full py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Comisión</h1>
        <p className="text-gray-600">Complete el formulario para agregar una nueva comisión</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ComisionForm />
      </div>
    </div>
  )
}
