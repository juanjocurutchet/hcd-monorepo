import { UsuarioForm } from "../components/usuario-form";

export default function NuevoUsuarioPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-600">Complete el formulario para crear un nuevo usuario</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <UsuarioForm />
      </div>
    </div>
  )
}
