"use client"; // Indica que este archivo es un componente cliente en Next.js

import React, { useEffect, useState } from "react"; // Importa React y hooks
import Link from "next/link"; // Importa el componente Link de Next.js para navegación
import { useSession } from "next-auth/react"; // Hook para obtener la sesión del usuario autenticado

export default function Bolsas() { // Componente principal de la página
  const { data: session } = useSession(); // Obtiene la sesión actual del usuario

  // Estados para manejar datos y formularios
  const [bolsas, setBolsas] = useState([]); // Lista completa de bolsas
  const [filteredBolsas, setFilteredBolsas] = useState([]); // Lista filtrada según búsqueda/filtros
  const [searchDepartamento, setSearchDepartamento] = useState(""); // Filtro por departamento
  const [selectedAnio, setSelectedAnio] = useState(""); // Filtro por año
  const [showForm, setShowForm] = useState(false); // Mostrar/ocultar formulario de añadir bolsa
  const [departamento, setDepartamento] = useState(""); // Departamento del formulario
  const [anio, setAnio] = useState(""); // Año del formulario
  const [monto, setMonto] = useState(""); // Monto del formulario
  const [tipoBolsa, setTipoBolsa] = useState(""); // Tipo de bolsa del formulario

  // useEffect para cargar las bolsas al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/bolsas"); // Llama a la API para obtener bolsas
        const data = await response.json();
        setBolsas(Array.isArray(data) ? data : []); // Guarda las bolsas en el estado
        setFilteredBolsas(Array.isArray(data) ? data : []); // Inicializa el filtrado
      } catch (error) {
        console.error("Error fetching bolsas:", error);
        setBolsas([]);
        setFilteredBolsas([]);
      }
    };
    fetchData();
  }, []); // Solo se ejecuta una vez al montar

  // useEffect para filtrar las bolsas según los filtros y el rol del usuario
  useEffect(() => {
    let filtered = bolsas;

    // Si el usuario es Jefe de Departamento, solo ve su departamento
    if (
      session?.user?.role === "Jefe_Departamento" &&
      session.user.departamento
    ) {
      filtered = bolsas.filter(
        (bolsa) =>
          bolsa.Departamento.toLowerCase() ===
          session.user.departamento.toLowerCase()
      );
    } else {
      // Si no, puede filtrar por departamento y año
      if (searchDepartamento) {
        filtered = filtered.filter((bolsa) =>
          bolsa.Departamento.toLowerCase().includes(
            searchDepartamento.toLowerCase()
          )
        );
      }
      if (selectedAnio) {
        filtered = filtered.filter(
          (bolsa) => bolsa.Anio.toString() === selectedAnio
        );
      }
    }

    setFilteredBolsas(filtered); // Actualiza el estado filtrado
  }, [searchDepartamento, selectedAnio, bolsas, session]); // Se ejecuta cuando cambian estos valores

  // Obtiene los años y departamentos únicos para los selectores
  const uniqueAnios = [...new Set(bolsas.map((bolsa) => bolsa.Anio))];
  const uniqueDepartamentos = [
    ...new Set(bolsas.map((bolsa) => bolsa.Departamento)),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2 text-center text-red-600">
          Bolsas
        </h1>

        {/* Muestra el departamento si el usuario es Jefe de Departamento */}
        {session?.user?.role === "Jefe_Departamento" &&
          session.user.departamento && (
            <h2 className="text-lg font-normal text-center text-gray-700 mb-4">
              Departamento: {session.user.departamento}
            </h2>
          )}

        {/* Filtros y botones */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Filtro por departamento (no para Jefe de Departamento) */}
          {session?.user?.role !== "Jefe_Departamento" && (
            <select
              value={searchDepartamento}
              onChange={(e) => setSearchDepartamento(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2"
            >
              <option value="">Seleccionar departamento</option>
              {uniqueDepartamentos.map((dep, idx) => (
                <option key={idx} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          )}

          {/* Filtro por año */}
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

          {/* Botón para limpiar filtros */}
          <button
            onClick={() => {
              setSearchDepartamento("");
              setSelectedAnio("");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Limpiar filtros
          </button>

          {/* Botón para mostrar formulario de añadir bolsa (solo Administrador) */}
          {session?.user?.role === "Administrador" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Añadir Bolsa
            </button>
          )}
        </div>

        {/* Formulario para añadir bolsa */}
        {showForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch("/api/bolsas", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    departamento,
                    anio,
                    monto,
                    tipoBolsa,
                  }),
                });

                if (response.ok) {
                  alert("Bolsa añadida exitosamente");
                  const newBolsa = {
                    Departamento: departamento,
                    Anio: parseInt(anio),
                    Monto: parseFloat(monto),
                    Tipo_Bolsa: tipoBolsa,
                  };
                  setBolsas((prev) => [...prev, newBolsa]);
                  setShowForm(false);
                  setDepartamento("");
                  setAnio("");
                  setMonto("");
                  setTipoBolsa("");
                } else {
                  let errorMsg = "Error al añadir la bolsa";
                  try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                  } catch (jsonError) {
                    console.warn("Respuesta no era JSON:", jsonError);
                  }
                  alert(`Error: ${errorMsg}`);
                }
              } catch (error) {
                console.error("Error adding bolsa:", error);
                alert("Error al añadir la bolsa");
              }
            }}
            className="bg-gray-100 p-4 rounded shadow-md mb-4"
          >
            {/* Selectores y campos del formulario */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                required
              >
                <option value="">Seleccionar departamento</option>
                {uniqueDepartamentos.map((dep, idx) => (
                  <option key={idx} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Año
              </label>
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                required
              >
                <option value="">Seleccionar año</option>
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Monto
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Bolsa
              </label>
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

            {/* Botón para guardar */}
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Guardar Bolsa
            </button>
          </form>
        )}

        {/* Tabla de bolsas */}
        <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-md">
          <thead className="bg-red-600 text-white">
            <tr>
              {session?.user?.role !== "Jefe_Departamento" && (
                <th className="px-4 py-2 text-left">Departamento</th>
              )}
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
                  {session?.user?.role !== "Jefe_Departamento" && (
                    <td className="px-4 py-3 text-black">
                      {bolsa.Departamento}
                    </td>
                  )}
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
                      href={`/pages/rutas/bolsas/${
                        bolsa.Tipo_Bolsa
                      }/${encodeURIComponent(bolsa.Departamento)}/${
                        bolsa.Anio
                      }`}
                      className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition"
                    >
                      Ver detalles
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={session?.user?.role === "Jefe_Departamento" ? 4 : 5}
                  className="text-center py-6 text-gray-500"
                >
                  No hay bolsas disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
