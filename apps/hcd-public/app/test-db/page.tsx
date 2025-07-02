import { neon } from "@neondatabase/serverless"

export default async function TestDbPage() {
  let dbStatus = "Desconectado"
  let error = null
  let users = []

  try {
    // Obtener la URL de la base de datos
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL no está definido en las variables de entorno")
    }

    // Crear cliente SQL
    const sql = neon(databaseUrl)

    // Intentar ejecutar una consulta simple
    const result = await sql`SELECT NOW() as time`
    dbStatus = "Conectado"

    // Obtener usuarios
    users = await sql`SELECT id, name, email, role FROM users`
  } catch (err) {
    error = err.message
    dbStatus = "Error de conexión"
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba de conexión a la base de datos</h1>

      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">Estado de la conexión</h2>
        <p className={`font-medium ${dbStatus === "Conectado" ? "text-green-600" : "text-red-600"}`}>{dbStatus}</p>
        {error && (
          <div className="mt-2 p-3 bg-red-100 text-red-800 rounded-md">
            <p className="font-medium">Error:</p>
            <pre className="mt-1 text-sm overflow-auto">{error}</pre>
          </div>
        )}
      </div>

      {users.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Usuarios en la base de datos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Nombre</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2 px-4 border">{user.id}</td>
                    <td className="py-2 px-4 border">{user.name}</td>
                    <td className="py-2 px-4 border">{user.email}</td>
                    <td className="py-2 px-4 border">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-gray-600">
          Si la conexión es exitosa, deberías ver "Conectado" y una lista de usuarios. Si hay un error, verás el mensaje
          de error correspondiente.
        </p>
      </div>
    </div>
  )
}
