//Esta es la pagina que contiene el slug de la url para que pueda ser capturado por la ruta dinamica

import React from "react";
import Link from "next/link";
import { getDepartamentos } from "@/app/api/functions/select";




const departamentos = await getDepartamentos().then((data) => data.map((item) => item.nombre)).catch((error) => console.error("Error fetching departamentos:", error));


export default function DepartamentosPage() {
  return (
    <div className="min-h-screen flex flex-col items-center">
    <main className="flex-grow px-4 py-8 w-full max-w-lg">
      <h1 className="text-center text-2xl font-bold text-red-600 mb-6">Lista de departamentos</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-collapse">
          <thead>

          </thead>
          <tbody>
            {departamentos.map((nombre, idx) => {
              // Convertir el nombre a un slug para la URL
              const slug = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""); // Reemplaza espacios y caracteres especiales por guiones 
              // Aquí puedes agregar la lógica para manejar el slug y redirigir a la página correspondiente
              return (
                <tr key={idx}>
                  <td className="border px-4 py-2">{nombre}</td>
                  <td className="border px-4 py-2 text-center">
                    <Link href={`./bolsas/${slug}`}>
                      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
                        Ver bolsas
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  </div>
  );
}