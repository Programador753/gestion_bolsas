'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const DepartamentoSelector = ({ onSeleccion, departamentoActual = '' }) => {
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(departamentoActual);

  const handleChange = (e) => {
    const nuevoDepartamento = e.target.value;
    setDepartamentoSeleccionado(nuevoDepartamento);
    if (onSeleccion) {
      onSeleccion(nuevoDepartamento.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-red-600">Selección de Departamento</h2>
          <p className="text-sm text-gray-700">Filtra los datos por departamento</p>
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            className="w-full p-2 text-sm md:text-base bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            value={departamentoSeleccionado}
            onChange={handleChange}
            placeholder="Escribe el nombre del departamento"
          />
        </div>
      </div>
    </div>
  );
};

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoFiltrado, setDepartamentoFiltrado] = useState('');

  useEffect(() => {
    fetch('/api/departamentos')
      .then((res) => res.json())
      .then((data) => {
        const nombres = data.map((item) => item.nombre);
        setDepartamentos(nombres);
      })
      .catch((error) => console.error("Error fetching departamentos:", error));
  }, []);

  const normalizarTexto = (texto) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Elimina acentos

  const departamentosMostrados = departamentoFiltrado.trim()
    ? departamentos.filter((nombre) =>
        normalizarTexto(nombre).includes(normalizarTexto(departamentoFiltrado))
      )
    : departamentos;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de departamentos
        </h1>

        <DepartamentoSelector
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
