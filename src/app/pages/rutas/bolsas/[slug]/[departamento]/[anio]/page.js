import React from 'react';
import { desgloseGastos } from '@/app/api/functions/select';

export default async function Page({ params }) {
  const { slug, departamento, anio } = params;

  const decodedDepartamento = decodeURIComponent(departamento);
  const decodedSlug = decodeURIComponent(slug);
  const normalizedSlug = decodedSlug.replace('Inversión', 'Inversion');

  const datos = await desgloseGastos(decodedDepartamento, anio, normalizedSlug);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <main className="flex-grow px-4 py-10 w-full max-w-5xl">
        {/* Título */}
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          {normalizedSlug.toUpperCase()} – {decodedDepartamento} ({anio})
        </h1>

        {/* Tabla o mensaje vacío */}
        {datos && datos.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full table-auto text-sm text-gray-700">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-right">Gasto (€)</th>
                  <th className="px-4 py-3 text-left">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((orden, idx) => (
                  <tr
                    key={orden.Id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                  >
                    <td className="px-4 py-3">{orden.Codigo}</td>
                    <td className="px-4 py-3">{orden.Tipo}</td>
                    <td className="px-4 py-3">
                      {new Date(orden.Fecha).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {orden.Gasto.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-4 py-3">{orden.Comentario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No se encontraron órdenes de compra.
          </p>
        )}
      </main>
    </div>
  );
}
