import React from "react";
import { getBolsasByDepartamento } from "@/app/api/functions/select";

export default async function BolsasPage({ params }) {
  // Obtener los parámetros de la URL directamente
  const { slug } = params;
  const departamento = decodeURIComponent(slug);
  

  // Llamar a la función que obtiene las bolsas por departamento
  const bolsas = await getBolsasByDepartamento(departamento).catch((error) =>
    console.error("Error fetching bolsas:", error)
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-black from-red-50 to-white">
      <main className="flex-grow px-4 py-8 w-full max-w-3xl">
        <h1 className="text-center text-2xl font-bold text-red-600 mb-6">
          Bolsas de {departamento}
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Departamento</th>
                <th className="border px-4 py-2">Año</th>
                <th className="border px-4 py-2">Monto</th>
                <th className="border px-4 py-2">Tipo de Bolsa</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bolsas && bolsas.length > 0 ? (
                bolsas.map((bolsa, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{bolsa.Departamento}</td>
                    <td className="border px-4 py-2">{bolsa.Anio}</td>
                    <td className="border px-4 py-2">{bolsa.Monto}</td>
                    <td className="border px-4 py-2">{bolsa.Tipo_Bolsa}</td>
                    <td className="border px-4 py-2 text-center">
                      <a
                        href={`/pages/rutas/bolsas/${bolsa.Tipo_Bolsa}/${encodeURIComponent(
                          bolsa.Departamento
                        )}/${bolsa.Anio}`}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Ver detalles
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
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
