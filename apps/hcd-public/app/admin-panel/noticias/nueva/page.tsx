import { NoticiaForm } from "@/app/admin-panel/noticias/components/noticia-form"

export default function NuevaNoticiaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nueva Noticia</h1>
      <div className="bg-white rounded-md shadow p-6">
        <NoticiaForm />
      </div>
    </div>
  )
}
