'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const DepartamentoSelector = ({ departamentos, onSeleccion, departamentoActual = 'Todos' }) => {
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(departamentoActual);

  const handleChange = (e) => {
    const nuevoDepartamento = e.target.value;
    setDepartamentoSeleccionado(nuevoDepartamento);
    if (onSeleccion) onSeleccion(nuevoDepartamento);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-red-600">Selección de Departamento</h2>
          <p className="text-sm text-gray-700">Filtra los datos por departamento</p>
        </div>
        <div className="w-full md:w-64">
          <select
             className="w-full p-2 text-sm md:text-base bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            value={departamentoSeleccionado}
            onChange={handleChange}
          >
            <option value="Todos">Todos los departamentos</option>
            {departamentos.map((nombre, idx) => (
              <option key={idx} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {departamentoSeleccionado !== 'Todos' && (
        <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-red-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 8a1 1 0 112 0 1 1 0 01-2 0zm1 2a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">
              Mostrando datos únicamente del departamento: <strong>{departamentoSeleccionado}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoFiltrado, setDepartamentoFiltrado] = useState('Todos');

  useEffect(() => {
    fetch('/api/departamentos')
      .then((res) => res.json())
      .then((data) => {
        const nombres = data.map((item) => item.nombre);
        setDepartamentos(nombres);
      })
      .catch((error) => console.error("Error fetching departamentos:", error));
  }, []);

  const departamentosMostrados =
    departamentoFiltrado === 'Todos'
      ? departamentos
      : departamentos.filter((nombre) => nombre === departamentoFiltrado);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de departamentos
        </h1>

        <DepartamentoSelector
          departamentos={departamentos}
          onSeleccion={setDepartamentoFiltrado}
          departamentoActual={departamentoFiltrado}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {departamentosMostrados.map((nombre, idx) => (
                <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`./bolsas/${nombre}`}>
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-md transition">
                        Ver bolsas
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {departamentosMostrados.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-500">No hay departamentos que coincidan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
