import { getProveedorByNombre } from "@/app/api/functions/select"; // Asegúrate de tener esta función en tu API
import React from "react";

// Este componente espera el nombre del proveedor en la URL
export default async function GestionPage({ params }) {
  const { nombre } = params;
  const proveedor = await getProveedorByNombre(nombre); // Debe devolver un objeto con `.estado`

  const estado = proveedor.estado === 0 ? "Baja" : "Alta";
  const departamentos = ["Informática", "Calidad", "Logística", "Compras", "Finanzas"];

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="w-full max-w-3xl bg-white text-black p-8 rounded-2xl shadow-xl border border-black">
        <h1 className="text-3xl font-extrabold mb-6 text-red-600">{proveedor.nombre}</h1>

        <div className="mb-6">
          <p className="text-lg">
            Estado:{" "}
            <span className={`font-bold ${estado === "Alta" ? "text-green-600" : "text-red-600"}`}>
              {estado}
            </span>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Departamentos en red</h2>
          <div className="space-y-3">
            {departamentos.map((dep, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white border border-black px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">{dep}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 accent-red-600 cursor-pointer"
                />
              </div>
            ))}

            <div className="flex justify-end mt-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
