"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const InicioPage = () => {
  const { data: session } = useSession(); // Usar el hook useSession
  const [ordenes, setOrdenes] = useState([]);
  const [gastoPorDepartamento, setGastoPorDepartamento] = useState([]);
  const [presupuestoPorDepartamento, setPresupuestoPorDepartamento] = useState(
    []
  );
  const [searchDepartamento, setSearchDepartamento] = useState("");
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/Inicio_data");
        const data = await response.json();

        if (data.error) {
          console.error("API Error:", data.error);
          setOrdenes([]);
          setGastoPorDepartamento([]);
          setPresupuestoPorDepartamento([]);
          return;
        }

        console.log("Datos devueltos por la API:", data); // Log para depuración

        // Logs adicionales para inspeccionar las propiedades de los datos
        console.log("Ordenes:", data.ordenes);
        console.log("Gasto por Departamento:", data.gasto);
        console.log("Presupuesto por Departamento:", data.presupuesto);

        setOrdenes(data.ordenes || []);
        setGastoPorDepartamento(data.gasto || []);
        setPresupuestoPorDepartamento(data.presupuesto || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setOrdenes([]);
        setGastoPorDepartamento([]);
        setPresupuestoPorDepartamento([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      session?.user?.role === "Jefe_Departamento" &&
      session.user.departamento
    ) {
      setGastoPorDepartamento((prev) =>
        prev.filter(
          (item) =>
            item.departamento.toLowerCase() ===
            session.user.departamento.toLowerCase()
        )
      );
      setPresupuestoPorDepartamento((prev) =>
        prev.filter(
          (item) =>
            item.departamento.toLowerCase() ===
            session.user.departamento.toLowerCase()
        )
      );
      setOrdenes((prev) =>
        prev.filter(
          (orden) =>
            orden.departamento?.toLowerCase() ===
            session.user.departamento.toLowerCase()
        )
      );
    }
  }, [session]);

  const filteredGasto =
    searchDepartamento.trim() === ""
      ? gastoPorDepartamento
      : gastoPorDepartamento.filter((item) =>
          item.departamento
            .toLowerCase()
            .includes(searchDepartamento.toLowerCase())
        );

  const filteredPresupuesto =
    searchDepartamento.trim() === ""
      ? presupuestoPorDepartamento
      : presupuestoPorDepartamento.filter((item) =>
          item.departamento
            .toLowerCase()
            .includes(searchDepartamento.toLowerCase())
        );

  // Calcular datos anuales para la gráfica
  const yearsSet = new Set([
    ...presupuestoPorDepartamento.map((item) => item.anio),
    ...gastoPorDepartamento.map((item) => item.anio),
  ]);
  const years = Array.from(yearsSet).sort();
  const chartData = years.map((anio) => {
    const presupuesto = presupuestoPorDepartamento
      .filter((item) => item.anio === anio)
      .reduce(
        (acc, curr) => acc + (parseFloat(curr.presupuesto_total) || 0),
        0
      );
    const gasto = gastoPorDepartamento
      .filter((item) => item.anio === anio)
      .reduce((acc, curr) => acc + (parseFloat(curr.gasto_total) || 0), 0);
    return {
      anio: anio,
      Presupuesto: presupuesto,
      Gasto: gasto,
    };
  });

  console.log("Filtered Gasto:", filteredGasto);
  console.log("Filtered Presupuesto:", filteredPresupuesto);
  console.log("Ordenes:", ordenes);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2 text-center text-red-600">
        Inicio
      </h1>
      {session?.user?.role === "Jefe_Departamento" &&
        session.user.departamento && (
          <h2 className="text-lg font-normal text-center text-gray-700 mb-4">
            Departamento: {session.user.departamento}
          </h2>
        )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {/* Tablas a la izquierda */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-left">
              Presupuesto Total por Departamento
            </h2>
            <div
              className={
                session?.user?.role === "Jefe_Departamento"
                  ? "w-full flex justify-start"
                  : "w-full"
              }
            >
              <table
                className={
                  (session?.user?.role === "Jefe_Departamento"
                    ? "w-full max-w-[600px] mx-0 "
                    : "min-w-full ") +
                  "bg-white border border-gray-300 rounded-lg shadow-md"
                }
              >
                <thead className="bg-red-600 text-white">
                  <tr>
                    {session?.user?.role !== "Jefe_Departamento" && (
                      <th className="px-6 py-3 text-center">Departamento</th>
                    )}
                    <th className="px-6 py-3 text-center">
                      Presupuesto Total (€)
                    </th>
                    <th className="px-6 py-3 text-center">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPresupuesto.length > 0 ? (
                    filteredPresupuesto.map((item, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        {session?.user?.role !== "Jefe_Departamento" && (
                          <td className="px-6 py-4 text-black text-center">
                            {item.departamento}
                          </td>
                        )}
                        <td className="px-6 py-4 text-black text-center font-medium">
                          {item.presupuesto_total}
                        </td>
                        <td className="px-6 py-4 text-black text-center">
                          {item.tipo}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          session?.user?.role === "Jefe_Departamento" ? 2 : 3
                        }
                        className="text-center py-6 text-gray-500"
                      >
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-left">
              Gasto Total por Departamento
            </h2>
            <div
              className={
                session?.user?.role === "Jefe_Departamento"
                  ? "w-full flex justify-start"
                  : "w-full"
              }
            >
              <table
                className={
                  (session?.user?.role === "Jefe_Departamento"
                    ? "w-full max-w-[600px] mx-0 "
                    : "min-w-full ") +
                  "bg-white border border-gray-300 rounded-lg shadow-md"
                }
              >
                <thead className="bg-red-600 text-white">
                  <tr>
                    {session?.user?.role !== "Jefe_Departamento" && (
                      <th className="px-6 py-3 text-center">Departamento</th>
                    )}
                    <th className="px-6 py-3 text-center">Gasto Total (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGasto.length > 0 ? (
                    filteredGasto.map((item, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        {session?.user?.role !== "Jefe_Departamento" && (
                          <td className="px-6 py-4 text-black text-center">
                            {item.departamento}
                          </td>
                        )}
                        <td className="px-6 py-4 text-black text-center font-medium">
                          {item.gasto_total}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          session?.user?.role === "Jefe_Departamento" ? 1 : 2
                        }
                        className="text-center py-6 text-gray-500"
                      >
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-left">
              Últimas Órdenes de Compra
            </h2>
            <div
              className={
                session?.user?.role === "Jefe_Departamento"
                  ? "w-full flex justify-start"
                  : "w-full"
              }
            >
              <table
                className={
                  (session?.user?.role === "Jefe_Departamento"
                    ? "w-full max-w-[600px] mx-0 "
                    : "min-w-full ") +
                  "bg-white border border-gray-300 rounded-lg shadow-md"
                }
              >
                <thead className="bg-red-600 text-white">
                  <tr>
                    {session?.user?.role !== "Jefe_Departamento" && (
                      <th className="px-6 py-3 text-center">Departamento</th>
                    )}
                    <th className="px-6 py-3 text-center">
                      Nombre del Proveedor
                    </th>
                    <th className="px-6 py-3 text-center">Gasto (€)</th>
                    <th className="px-6 py-3 text-center">Fecha</th>
                    <th className="px-6 py-3 text-center">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.length > 0 ? (
                    ordenes.map((orden, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        {session?.user?.role !== "Jefe_Departamento" && (
                          <td className="px-6 py-4 text-black text-center">
                            {orden.departamento || "Sin Departamento"}
                          </td>
                        )}
                        <td className="px-6 py-4 text-black text-center">
                          {orden.nombre_proveedor || "Sin Proveedor"}
                        </td>
                        <td className="px-6 py-4 text-black text-center font-medium">
                          {orden.gasto !== undefined ? orden.gasto : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-black text-center">
                          {orden.fecha
                            ? new Date(orden.fecha).toLocaleDateString()
                            : "Sin Fecha"}
                        </td>
                        <td className="px-6 py-4 text-black text-center">
                          {orden.tipo || "Sin Tipo"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          session?.user?.role === "Jefe_Departamento" ? 4 : 5
                        }
                        className="text-center py-6 text-gray-500"
                      >
                        No hay órdenes de compra disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 w-full flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2 text-left w-full">
            Evolución anual de Presupuesto y Gastos
          </h2>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anio" />
                <YAxis allowDataOverflow domain={[0, 'auto']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Presupuesto"
                  stroke="#d90429"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="Gasto"
                  stroke="#1d3557"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Filtro y gráfica por departamento */}
          {session?.user?.role !== "Jefe_Departamento" && (
            <div className="w-full mt-8">
              <label className="block mb-2 font-semibold">
                Filtrar por departamento:
              </label>
              <select
                className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
                value={selectedDepartamento}
                onChange={(e) => setSelectedDepartamento(e.target.value)}
              >
                <option value="">Seleccionar departamento</option>
                {Array.from(
                  new Set([
                    ...presupuestoPorDepartamento.map(
                      (item) => item.departamento
                    ),
                    ...gastoPorDepartamento.map((item) => item.departamento),
                  ])
                )
                  .filter(Boolean)
                  .map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
              </select>
              {selectedDepartamento && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={years.map((anio) => {
                      const presupuesto = presupuestoPorDepartamento
                        .filter(
                          (item) =>
                            item.anio === anio &&
                            item.departamento === selectedDepartamento
                        )
                        .reduce(
                          (acc, curr) => acc + (parseFloat(curr.presupuesto_total) || 0),
                          0
                        );
                      const gasto = gastoPorDepartamento
                        .filter(
                          (item) =>
                            item.anio === anio &&
                            item.departamento === selectedDepartamento
                        )
                        .reduce((acc, curr) => acc + (parseFloat(curr.gasto_total) || 0), 0);
                      return {
                        anio,
                        Presupuesto: presupuesto,
                        Gasto: gasto,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="anio" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Presupuesto"
                      stroke="#d90429"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="Gasto"
                      stroke="#1d3557"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
        </div>
    );
}


export default InicioPage;
