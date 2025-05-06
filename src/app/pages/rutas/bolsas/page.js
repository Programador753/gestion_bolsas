// Pagina de bolsas
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Bolsas() {
  const [bolsas, setBolsas] = useState([]);
  const [filteredBolsas, setFilteredBolsas] = useState([]);
  const [searchDepartamento, setSearchDepartamento] = useState("");
  const [selectedAnio, setSelectedAnio] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/bolsas"); // Llamada al endpoint API
        const data = await response.json();
        setBolsas(Array.isArray(data) ? data : []); // Aseguramos que bolsas sea un array
        setFilteredBolsas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching bolsas:", error);
        setBolsas([]); // En caso de error, inicializamos como array vacío
        setFilteredBolsas([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = bolsas;

    if (searchDepartamento) {
      filtered = filtered.filter((bolsa) =>
        bolsa.Departamento.toLowerCase().includes(searchDepartamento.toLowerCase())
      );
    }

    if (selectedAnio) {
      filtered = filtered.filter((bolsa) => bolsa.Anio.toString() === selectedAnio);
    }

    setFilteredBolsas(filtered);
  }, [searchDepartamento, selectedAnio, bolsas]);

  const uniqueAnios = [...new Set(bolsas.map((bolsa) => bolsa.Anio))];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Bolsas</h1>
      <p className="mb-4">Aquí puedes ver todas las bolsas de todos los departamentos por año.</p>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por departamento"
          value={searchDepartamento}
          onChange={(e) => setSearchDepartamento(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2"
        />

        <select
          value={selectedAnio}
          onChange={(e) => setSelectedAnio(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/4"
        >
          <option value="">Seleccionar año</option>
          {uniqueAnios.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchDepartamento("");
            setSelectedAnio("");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Limpiar filtros
        </button>
      </div>

      <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-md">
        <thead className="bg-red-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Departamento</th>
            <th className="px-4 py-2 text-left">Año</th>
            <th className="px-4 py-2 text-right">Monto (€)</th>
            <th className="px-4 py-2 text-left">Tipo de Bolsa</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredBolsas && filteredBolsas.length > 0 ? (
            filteredBolsas.map((bolsa, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-red-50"}
              >
                <td className="px-4 py-3 text-black">{bolsa.Departamento}</td>
                <td className="px-4 py-3 text-black">{bolsa.Anio}</td>
                <td className="px-4 py-3 text-right font-medium text-black">
                  {bolsa.Monto.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
                <td className="px-4 py-3 text-black">{bolsa.Tipo_Bolsa}</td>
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
                No hay bolsas disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}