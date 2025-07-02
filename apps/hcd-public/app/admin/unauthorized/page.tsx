export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso denegado</h1>
        <p className="text-gray-700 mb-6">
          No tenés permisos para acceder a esta sección del panel de administración.
        </p>
        <a
          href="/admin-panel/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </a>
      </div>
    </div>
  )
}
