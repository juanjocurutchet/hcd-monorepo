// app/admin/login/layout.tsx
import type { ReactNode } from "react"

export const metadata = {
  title: "Iniciar sesión | HCD Las Flores",
  description: "Acceso administrativo al Honorable Concejo Deliberante de Las Flores",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      {children}
    </div>
  )
}
