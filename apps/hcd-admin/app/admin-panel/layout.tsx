// Eliminar todo el contenido, este layout ya no debe envolver nada ni importar AdminPanelLayoutClient.
export default function AdminPanelEmptyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}