//Esta es la pagina que contiene el slug de la url para que pueda ser capturado por la ruta dinamica

import React from "react";
import Link from "next/link";
import { getDepartamentos } from "@/app/api/functions/select";
import styles from "./dbPrueba.module.css"




const departamentos = [
  'Informática',
  'Administración',
  'Electricidad',
  'Mecánica',
  'Electrónica',
  'Automoción',
  'Construcción',
  'Química',
  'Sanidad',
  'Hostelería'
];

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
              const slug = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
              return (
                <tr key={idx}>
                  <td className="border px-4 py-2">{nombre}</td>
                  <td className="border px-4 py-2 text-center">
                    <Link href={`/bolsas/${slug}`}>
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