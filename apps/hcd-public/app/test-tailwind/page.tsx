// app/test-tailwind/page.tsx
export default function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Prueba de Tailwind CSS</h1>
      <p className="text-gray-700 mb-2">Este es un párrafo con estilos de Tailwind.</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Botón de prueba
      </button>
    </div>
  );
}