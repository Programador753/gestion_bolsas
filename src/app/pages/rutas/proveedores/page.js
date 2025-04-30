import React from "react";
import Link from 'next/link';

const proveedores = [
  "TechSupply Solutions",
  "Office Materials Corp",
  "ElectroComponents SA",
  "MechaParts Industries",
  "ElectroTech Systems",
  "AutoParts Global",
  "BuildCorp Materials",
  "ChemSupplies Lab",
  "MedicalEquip Pro",
  "HospitalitySupply Co"
];

export default function ProveedoresPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de proveedores
        </h1>
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-red-600">
                Selección de proveedor
              </h2>
              <p className="text-sm text-gray-700">
                Filtra los datos por proveedor
              </p>
            </div>
            <div className="w-full md:w-64">
              <input
                className="bg-white w-full p-2 text-sm md:text-base text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                type="text"
              />
            </div>
            <div className="flex justify-end">
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200">
                Añadir proveedor
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {proveedores.map((nombre, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                  <td>
                    <p className="px-4 py-3 font-medium text-gray-800">{nombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600">Alta</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end space-x-2">
                    <Link href={`/pages/rutas/gestion/${nombre}`}>
                      <button className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200">
                        Gestionar
                      </button>
                    </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
