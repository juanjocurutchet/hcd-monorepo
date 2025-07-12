export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";
import Link from "next/link";

const UsuariosTableClient = nextDynamic(() => import("./UsuariosTableClient"), { ssr: false });

const ROLES = [
  { value: "SUPERADMIN", label: "Superadmin" },
  { value: "ADMIN", label: "Administrador" },
  { value: "EDITOR", label: "Editor" },
  { value: "USER", label: "Usuario" },
  { value: "BLOQUE", label: "Bloque" },
];

export default async function UsuariosPage() {
  // const usuarios = await getAllUsers(); // Ya no se usa

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <Link href="/admin-panel-dashboard/usuarios/nuevo" className="text-blue-600 hover:underline">
          Agregar usuario
        </Link>
      </div>
      <UsuariosTableClient />
    </div>
  );
}