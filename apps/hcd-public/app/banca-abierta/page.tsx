import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Banca Abierta | HCD Las Flores",
  description: "Banca Abierta del Honorable Concejo Deliberante de Las Flores",
}

export default function BancaAbiertaPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0e4c7d]">Banca Abierta</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#0e4c7d]">¿Qué es la Banca Abierta?</h2>
        <p className="mb-4">
          La Banca Abierta es un espacio de participación ciudadana que permite a los vecinos de Las Flores exponer
          temas de interés comunitario ante el Concejo Deliberante.
        </p>
        <p className="mb-4">
          Este mecanismo busca fortalecer la democracia participativa, permitiendo que los ciudadanos puedan presentar
          propuestas, inquietudes o problemáticas directamente a los concejales durante las sesiones ordinarias.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#0e4c7d]">¿Cómo solicitar la Banca Abierta?</h2>
        <p className="mb-4">
          Para solicitar el uso de la Banca Abierta, los interesados deben presentar una solicitud por escrito ante la
          Secretaría del Concejo Deliberante, indicando:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Datos personales completos</li>
          <li className="mb-2">Tema a exponer</li>
          <li className="mb-2">Breve descripción del asunto</li>
          <li className="mb-2">Documentación que respalde la presentación (si corresponde)</li>
        </ul>
        <p>
          La solicitud será evaluada por la Comisión de Labor Parlamentaria, que determinará la fecha en que se otorgará
          el uso de la Banca Abierta.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-[#0e4c7d]">Reglamento</h2>
        <ul className="list-disc pl-6">
          <li className="mb-2">El expositor dispondrá de un tiempo máximo de 15 minutos para desarrollar su tema.</li>
          <li className="mb-2">
            No se permitirán expresiones agraviantes hacia los miembros del Concejo o terceras personas.
          </li>
          <li className="mb-2">El tema expuesto debe ser de interés general para la comunidad de Las Flores.</li>
          <li className="mb-2">Finalizada la exposición, los concejales podrán realizar preguntas al expositor.</li>
          <li>
            Lo expuesto en la Banca Abierta será considerado por el Concejo Deliberante, pudiendo derivarse a las
            comisiones correspondientes para su tratamiento.
          </li>
        </ul>
      </div>
    </div>
  )
}
