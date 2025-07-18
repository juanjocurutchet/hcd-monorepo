import SessionProviderWrapper from "../../../admin-panel/SessionProviderWrapper";
import { SesionForm } from "../components/sesion-form";

export default function NuevaSesionPage() {
  return (
    <SessionProviderWrapper>
      <div className="w-full py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Sesión</h1>
          <p className="text-gray-600">Complete el formulario para agregar una nueva sesión</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <SesionForm />
        </div>
      </div>
    </SessionProviderWrapper>
  )
}
