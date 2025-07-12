"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/admin-panel/login");
    } else if (
      !session.user ||
      ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")
    ) {
      router.replace("/");
    }
  }, [session, status, router]);

  if (
    !session ||
    !session.user ||
    ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")
  ) {
    return null; // O spinner
  }

  return <>{children}</>;
}