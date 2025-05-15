// Pagina de bolsas
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Bolsas() {
  const [bolsas, setBolsas] = useState([]);
  const [filteredBolsas, setFilteredBolsas] = useState([]);
  const [searchDepartamento, setSearchDepartamento] = useState("");
  const [selectedAnio, setSelectedAnio] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [departamento, setDepartamento] = useState("");
  const [anio, setAnio] = useState("");
  const [monto, setMonto] = useState("");
  const [tipoBolsa, setTipoBolsa] = useState("");
  const [departamentos, setDepartamentos] = useState([]);

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
    const fetchDepartamentos = async () => {
      try {
        const response = await fetch('/api/departamentos'); // Llamada al endpoint API para obtener departamentos
        const data = await response.json();
        setDepartamentos(Array.isArray(data) ? data : []); // Aseguramos que departamentos sea un array
      } catch (error) {
        console.error('Error fetching departamentos:', error);
        setDepartamentos([]); // En caso de error, inicializamos como array vacío
      }
    };

    fetchDepartamentos();
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
        <select
          value={searchDepartamento}
          onChange={(e) => setSearchDepartamento(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2"
        >
          <option value="">Seleccionar departamento</option>
          {departamentos.map((dep, idx) => (
            <option key={idx} value={dep.nombre}>
              {dep.nombre}
            </option>
          ))}
        </select>

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

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Añadir Bolsa
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await fetch('/api/bolsas/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ departamento, anio, monto, tipoBolsa }),
              });

              if (response.ok) {
                alert('Bolsa añadida exitosamente');
                setShowForm(false);
                setDepartamento('');
                setAnio('');
                setMonto('');
                setTipoBolsa('');

                // Refresh the bolsas list
                const data = await response.json();
                setBolsas((prev) => [...prev, { departamento, anio, monto, tipoBolsa }]);
              } else {
                alert('Error al añadir la bolsa (rutas/bolsas/page.js_1)');
              }
            } catch (error) {
              console.error('Error submitting form:', error);
              alert('Error al añadir la bolsa (rutas/bolsas/page.js_2)');
            }
          }}
          className="bg-gray-100 p-4 rounded shadow-md mb-4"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            >
              <option value="">Seleccionar departamento</option>
              {departamentos.map((dep, idx) => (
                <option key={idx} value={dep.nombre}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            >
              <option value="">Seleccionar año</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Monto</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tipo de Bolsa</label>
            <select
              value={tipoBolsa}
              onChange={(e) => setTipoBolsa(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Inversion">Inversión</option>
              <option value="Presupuesto">Presupuesto</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Guardar Bolsa
          </button>
        </form>
      )}

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