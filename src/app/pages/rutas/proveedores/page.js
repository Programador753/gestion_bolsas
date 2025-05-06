import React from "react";
import Link from 'next/link';
import { getProveedores } from "@/app/api/functions/select";

export default async function ProveedoresPage() {
  const proveedores = await getProveedores();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de proveedores
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {proveedores.map((proveedor, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                  <td>
                    <p className="px-2 py-3 font-semibold text-gray-800 text-base">
                      {proveedor.nombre}
                    </p>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end font-medium text-gray-800">
                      <Link href={`/pages/rutas/proveedores/${proveedor.nombre}`}>
                        <button className="cursor-pointer bg-red-600 text-white px-5 py-2.5 rounded-md text-base hover:bg-red-700 transition duration-200">
                          Gestionar
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No hay proveedores registrados.
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
