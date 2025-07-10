"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Log de depuración
  console.log({ session, status, pathname });

  useEffect(() => {
    if (status === "loading") return;
    // Permitir acceso solo a la página de login sin sesión
    if (!session && pathname !== "/admin-panel/login") {
      router.replace("/admin-panel/login");
    }
    // Si ya está logueado y está en login, redirigir a home
    if (session && pathname === "/admin-panel/login") {
      router.replace("/");
    }
  }, [session, status, pathname, router]);

  // Evitar parpadeo de UI mientras se resuelve la sesión
  if (status === "loading" || (!session && pathname !== "/admin-panel/login")) {
    return null;
  }

  return <>{children}</>;
}