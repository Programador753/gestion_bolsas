import React from 'react';
import { desgloseGastos } from '@/app/api/functions/select';

export default async function Page({ params }) {
  const { slug, departamento, anio } = params;

  // Decodificar el departamento y el slug para asegurarnos que estén en el formato correcto
  const decodedDepartamento = decodeURIComponent(departamento);
  const decodedSlug = decodeURIComponent(slug);

  // Aquí, podrías agregar un reemplazo si es necesario para convertir caracteres especiales.
  // Ejemplo: Reemplazar 'Inversión' por 'Inversion' sin el carácter especial
  const normalizedSlug = decodedSlug.replace('Inversión', 'Inversion'); 

  // Llamamos a la función para obtener los datos con el valor normalizado
  const datos = await desgloseGastos(decodedDepartamento, anio, normalizedSlug);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-black from-red-50 to-white">
    <main className="flex-grow px-4 py-8 w-full max-w-3xl">
      <h1 className="text-center text-2xl font-bold text-red-600 mb-6">
        {normalizedSlug.toUpperCase()} – {decodedDepartamento} ({anio})
      </h1>

      {/* Renderizar los datos */}
      <div>
        {datos && datos.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Código</th>
                <th className="border px-4 py-2">Tipo</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Gasto</th>
                <th className="border px-4 py-2">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((orden) => (
                <tr key={orden.Id}>
                  <td className="border px-4 py-2">{orden.Codigo}</td>
                  <td className="border px-4 py-2">{orden.Tipo}</td>
                  <td className="border px-4 py-2">{new Date(orden.Fecha).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{orden.Gasto}</td>
                  <td className="border px-4 py-2">{orden.Comentario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No se encontraron órdenes de compra.</p>
        )}
      </div>
    </main>
  </div>
  );
}