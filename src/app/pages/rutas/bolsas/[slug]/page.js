import React from "react"; // Importa React para usar JSX
import { getBolsasByDepartamento } from "@/app/api/functions/select"; // Importa función para obtener bolsas por departamento

export default async function BolsasPage({ params }) { // Componente de página asíncrono que recibe parámetros de la ruta
  const { slug } = params; // Extrae el parámetro 'slug' de la URL
  const departamento = decodeURIComponent(slug); // Decodifica el nombre del departamento

  // Llama a la función para obtener las bolsas del departamento, maneja errores si ocurren
  const bolsas = await getBolsasByDepartamento(departamento).catch((error) =>
    console.error("Error fetching bolsas:", error)
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      {/* Contenedor principal con estilos de altura mínima y centrado */}
      <main className="flex-grow px-4 py-10 w-full max-w-5xl">
        {/* Contenido principal de la página */}
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Bolsas de {departamento}
        </h1>

        {/* Tabla de bolsas */}
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full table-auto text-sm text-gray-800">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Departamento</th>
                <th className="px-4 py-3 text-left">Año</th>
                <th className="px-4 py-3 text-right">Inicial (€)</th>
                <th className="px-4 py-3 text-left">Tipo de Bolsa</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Si hay bolsas, las muestra en filas; si no, muestra mensaje */}
              {bolsas && bolsas.length > 0 ? (
                bolsas.map((bolsa, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                  >
                    <td className="px-4 py-3">{bolsa.Departamento}</td>
                    <td className="px-4 py-3">{bolsa.Anio}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {bolsa.Monto.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-4 py-3">{bolsa.Tipo_Bolsa}</td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/pages/rutas/bolsas/${bolsa.Tipo_Bolsa}/${encodeURIComponent(
                          bolsa.Departamento
                        )}/${bolsa.Anio}`}
                        className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Ver detalles
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No hay bolsas para este departamento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
