"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const InicioPage = () => {
  const { data: session } = useSession();
  const [ordenes, setOrdenes] = useState([]);
  const [gastoPorDepartamento, setGastoPorDepartamento] = useState([]);
  const [presupuestoPorDepartamento, setPresupuestoPorDepartamento] = useState([]);
  const [searchDepartamento, setSearchDepartamento] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Añadir estado para el año
  
  // Estados para mostrar/ocultar tablas
  const [showPresupuesto, setShowPresupuesto] = useState(true);
  const [showGasto, setShowGasto] = useState(true);
  const [showOrdenes, setShowOrdenes] = useState(true);
  // Estado para toggle mensual/anual
  const [vistaEsMensual, setVistaEsMensual] = useState(true);

  // Código real de API restaurado
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

  // Filtros - Modificar para manejar el departamento fijo del jefe
  const isJefeDepartamento = session?.user?.role === "Jefe_Departamento";

  useEffect(() => {
    if (isJefeDepartamento && session?.user?.departamento) {
      setSearchDepartamento(session.user.departamento);
    }
  }, [session, isJefeDepartamento]);

  // Modificar filtros sin el año seleccionado
  const filteredGasto = gastoPorDepartamento.filter((item) =>
    isJefeDepartamento
      ? item.departamento === session?.user?.departamento
      : searchDepartamento.trim() === "" || 
        item.departamento.toLowerCase().includes(searchDepartamento.toLowerCase())
  );

  const filteredPresupuesto = presupuestoPorDepartamento.filter((item) =>
    isJefeDepartamento
      ? item.departamento === session?.user?.departamento
      : searchDepartamento.trim() === "" || 
        item.departamento.toLowerCase().includes(searchDepartamento.toLowerCase())
  );

  const filteredOrdenes = ordenes.filter((orden) =>
    isJefeDepartamento
      ? orden.departamento === session?.user?.departamento
      : searchDepartamento.trim() === "" || 
        (orden.departamento && orden.departamento.toLowerCase().includes(searchDepartamento.toLowerCase()))
  );

  // Datos para gráficos principales
  const yearsSet = new Set([
    ...presupuestoPorDepartamento.map((item) => item.anio),
    ...gastoPorDepartamento.map((item) => item.anio),
  ]);
  const years = Array.from(yearsSet).sort();
  
  const chartData = years.map((anio) => {
    const presupuesto = presupuestoPorDepartamento
      .filter((item) => item.anio === anio)
      .reduce((acc, curr) => acc + (parseFloat(curr.presupuesto_total) || 0), 0);
    const gasto = gastoPorDepartamento
      .filter((item) => item.anio === anio)
      .reduce((acc, curr) => acc + (parseFloat(curr.gasto_total) || 0), 0);
    return { anio, Presupuesto: presupuesto, Gasto: gasto };
  });

  // Datos para el gráfico de pie (presupuesto por departamento)
  const pieData = presupuestoPorDepartamento
    .filter(item => item.anio === selectedYear) // Usar selectedYear en lugar de 2024
    .map(item => ({
      name: item.departamento,
      value: parseFloat(item.presupuesto_total)
    }));

  // Colores modernos únicos para el gráfico - paleta más amplia
  const COLORS = [
    '#DC2626', // Rojo
    '#1E40AF', // Azul oscuro
    '#EA580C', // Naranja
    '#7C2D12', // Marrón
    '#059669', // Verde
    '#7C3AED', // Púrpura
    '#BE185D', // Rosa
    '#0891B2', // Cian
    '#65A30D', // Lima
    '#CA8A04', // Ámbar
    '#6B7280', // Gris
    '#0F766E'  // Teal
  ];

  

  const getTotalPresupuesto = () => {
    const total = presupuestoPorDepartamento
      .filter(item => item.departamento === (searchDepartamento || item.departamento))
      .reduce((acc, item) => {
        const valor = parseFloat(item.presupuesto_total);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
    return total;
  };

  const getTotalGasto = () => {
    const total = gastoPorDepartamento
      .filter(item => item.departamento === (searchDepartamento || item.departamento))
      .reduce((acc, item) => {
        const valor = parseFloat(item.gasto_total);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
    return total;
  };

  const getGeneralStats = () => {
    const totalPresupuesto = getTotalPresupuesto();
    const totalGasto = getTotalGasto();
    const saldoRestante = totalPresupuesto - totalGasto;
    const porcentajeGastado = totalPresupuesto > 0 
      ? ((totalGasto / totalPresupuesto) * 100).toFixed(1)
      : 0;

    return {
      totalPresupuesto,
      totalGasto,
      saldoRestante,
      porcentajeGastado: parseFloat(porcentajeGastado)
    };
  };

  // Modificar la carga de datos para el pie chart
  const getPresupuestoCard = (departamento) => {
    return presupuestoPorDepartamento
      .filter(item => 
        item.departamento === departamento && 
        item.anio === selectedYear // Usar selectedYear
      )
      .reduce((acc, curr) => acc + parseInt(curr.presupuesto_total) || 0, 0);
  };

  const getGastoCard = (departamento) => {
    return gastoPorDepartamento
      .filter(item => 
        item.departamento === departamento && 
        item.anio === selectedYear // Usar selectedYear
      )
      .reduce((acc, curr) => acc + parseInt(curr.gasto_total) || 0, 0);
  };

  // Actualizar las funciones de cálculo para Jefes de Departamento
  const getDeptoStats = (departamento) => {
    // Filtrar por departamento y año actual
    const presupuesto = presupuestoPorDepartamento
      .filter(item => 
        item.departamento === departamento && 
        item.anio === selectedYear
      )
      .reduce((acc, item) => {
        const valor = parseFloat(item.presupuesto_total);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

    const gasto = gastoPorDepartamento
      .filter(item => 
        item.departamento === departamento && 
        item.anio === selectedYear
      )
      .reduce((acc, item) => {
        const valor = parseFloat(item.gasto_total);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

    const porcentaje = presupuesto > 0 
      ? ((gasto / presupuesto) * 100).toFixed(1)
      : 0;

    return {
      presupuesto,
      gasto,
      porcentaje: parseFloat(porcentaje),
      restante: presupuesto - gasto
    };
  };

  // Actualizar getCurrentMonthStats para jefes de departamento
  const getCurrentMonthStats = (departamento = null) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const ordenesDelMes = ordenes.filter(orden => {
      if (!orden.fecha) return false;
      const fechaOrden = new Date(orden.fecha);
      return fechaOrden.getMonth() === currentMonth && 
             fechaOrden.getFullYear() === currentYear &&
             (departamento ? orden.departamento === departamento : true);
    });

    return {
      count: ordenesDelMes.length,
      total: ordenesDelMes.reduce((acc, orden) => 
        acc + (Number(orden.gasto) || 0), 0
      )
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-5">

        {/* Cards superiores - Layout condicional según el rol */}
        {session?.user?.role === "Jefe_Departamento" ? (
          /* Layout para Jefe de Departamento: 4 cards sin gráfico */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Card 1: Presupuesto del Departamento */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Mi Presupuesto</h3>
              <div className="text-center">
                {(() => {
                  const stats = getDeptoStats(session.user.departamento);
                  return (
                    <>
                      <p className="text-3xl font-bold text-blue-600">
                        €{stats.presupuesto.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Asignado
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Card 2: Gasto del Departamento */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Mi Gasto</h3>
              <div className="text-center">
                {(() => {
                  const stats = getDeptoStats(session.user.departamento);
                  return (
                    <>
                      <p className="text-3xl font-bold text-orange-600">
                        €{stats.gasto.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Ejecutado
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Card 3: Estado del Presupuesto */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Estado Presupuesto</h3>
              <div className="text-center">
                {(() => {
                  const stats = getDeptoStats(session.user.departamento);
                  return (
                    <>
                      <p className={`text-3xl font-bold ${
                        stats.porcentaje > 90 
                          ? 'text-red-600' 
                          : stats.porcentaje > 75 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {stats.porcentaje}%
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Utilizado
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            stats.porcentaje > 90 
                              ? 'bg-red-500' 
                              : stats.porcentaje > 75 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(stats.porcentaje, 100)}%` }}
                        ></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Card 4: Órdenes del Mes del Departamento */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Mis Órdenes del Mes</h3>
              <div className="text-center">
                {(() => {
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const misOrdenesMes = ordenes.filter(orden => {
                    const fechaOrden = new Date(orden.fecha);
                    return fechaOrden.getMonth() === currentMonth && 
                           fechaOrden.getFullYear() === currentYear &&
                           orden.departamento === session.user.departamento;
                  });
                  const totalMes = misOrdenesMes.reduce((acc, orden) => acc + parseInt(orden.gasto) || 0, 0);
                  
                  return (
                    <>
                      <p className="text-3xl font-bold text-purple-600">
                        {misOrdenesMes.length}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        €{totalMes.toLocaleString()} gastado
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* Layout para Administrador/Contable: 5 cards con estado de presupuesto */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {/* Cards para admin/contable */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Presupuesto</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  €{getTotalPresupuesto().toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">Total</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Gasto</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  €{getTotalGasto().toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">Acumulado</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Saldo Restante</h3>
              <div className="text-center">
                {(() => {
                  const { saldoRestante } = getGeneralStats();
                  return (
                    <>
                      <p className={`text-3xl font-bold ${saldoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        €{Math.abs(saldoRestante).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {saldoRestante >= 0 ? 'Disponible' : 'Sobregiro'}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Órdenes del Mes</h3>
              <div className="text-center">
                {(() => {
                  const stats = getCurrentMonthStats();
                  return (
                    <>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.count}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        €{stats.total.toLocaleString()} gastado
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Estado General */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center h-48">
              <h3 className="text-base font-semibold text-red-600 mb-3 text-center">Estado General</h3>
              <div className="text-center">
                {(() => {
                  const { porcentajeGastado } = getGeneralStats();
                  return (
                    <>
                      <p className={`text-3xl font-bold ${
                        porcentajeGastado > 90 
                          ? 'text-red-600' 
                          : porcentajeGastado > 75 
                            ? 'text-yellow-600' 
                            : porcentajeGastado > 50
                              ? 'text-blue-600'
                              : 'text-green-600'
                      }`}>
                        {porcentajeGastado}%
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Utilizado</p>
                      <p className={`text-sm font-semibold mt-1 ${
                        porcentajeGastado > 90 
                          ? 'text-red-600' 
                          : porcentajeGastado > 75 
                            ? 'text-yellow-600' 
                            : porcentajeGastado > 50
                              ? 'text-blue-600'
                              : 'text-green-600'
                      }`}>
                        {porcentajeGastado > 90 
                          ? '⚠️ Crítico'
                          : porcentajeGastado > 75 
                            ? '🔶 Precaución'
                            : porcentajeGastado > 50
                              ? '📊 Normal'
                              : '✅ Óptimo'}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal con layout de 2 columnas */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Columna izquierda: Tablas */}
          <div className="flex-1">
            {/* Filtro por departamento */}
            {session?.user?.role !== "Jefe_Departamento" ? (
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Filtrar por departamento:
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
                  value={searchDepartamento}
                  onChange={(e) => setSearchDepartamento(e.target.value)}
                >
                  <option value="">Todos los departamentos</option>
                  {Array.from(new Set([
                    ...presupuestoPorDepartamento.map(item => item.departamento),
                    ...gastoPorDepartamento.map(item => item.departamento)
                  ])).filter(Boolean).map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Departamento:
                </label>
                <input
                  type="text"
                  value={session.user.departamento}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100"
                />
              </div>
            )}

            {/* Tabla Presupuesto */}
            <div className="mb-8">
              <button
                className="flex items-center justify-between w-full text-xl font-semibold text-red-600 mb-3 focus:outline-none"
                onClick={() => setShowPresupuesto(!showPresupuesto)}
              >
                <span>Presupuesto Total{session?.user?.role !== "Jefe_Departamento" && " por Departamento"}</span>
                <span>{showPresupuesto ? "▲" : "▼"}</span>
              </button>
              {showPresupuesto && (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-red-600 text-white">
                      <tr>
                        {session?.user?.role !== "Jefe_Departamento" && (
                          <th className="px-6 py-3 text-center">Departamento</th>
                        )}
                        <th className="px-6 py-3 text-center">Presupuesto Total (€)</th>
                        <th className="px-6 py-3 text-center">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                      {filteredPresupuesto.length > 0 ? (
                        filteredPresupuesto.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            {session?.user?.role !== "Jefe_Departamento" && (
                              <td className="px-6 py-4 text-center">{item.departamento}</td>
                            )}
                            <td className="px-6 py-4 text-center font-medium">
                              {item.presupuesto_total?.toLocaleString() || item.presupuesto_total}
                            </td>
                            <td className="px-6 py-4 text-center">{item.tipo}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={session?.user?.role === "Jefe_Departamento" ? 2 : 3} 
                              className="text-center py-6 text-gray-500">
                            No hay datos disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tabla Gastos */}
            <div className="mb-8">
              <button
                className="flex items-center justify-between w-full text-xl font-semibold text-red-600 mb-3 focus:outline-none"
                onClick={() => setShowGasto(!showGasto)}
              >
                <span>Gasto Total{session?.user?.role !== "Jefe_Departamento" && " por Departamento"}</span>
                <span>{showGasto ? "▲" : "▼"}</span>
              </button>
              {showGasto && (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
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
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            {session?.user?.role !== "Jefe_Departamento" && (
                              <td className="px-6 py-4 text-center">{item.departamento}</td>
                            )}
                            <td className="px-6 py-4 text-center font-medium">
                              {item.gasto_total?.toLocaleString() || item.gasto_total}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={session?.user?.role === "Jefe_Departamento" ? 1 : 2} 
                              className="text-center py-6 text-gray-500">
                            No hay datos disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tabla Órdenes */}
            <div className="mb-8">
              <button
                className="flex items-center justify-between w-full text-xl font-semibold text-red-600 mb-3 focus:outline-none"
                onClick={() => setShowOrdenes(!showOrdenes)}
              >
                <span>Últimas Órdenes de Compra</span>
                <span>{showOrdenes ? "▲" : "▼"}</span>
              </button>
              {showOrdenes && (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-red-600 text-white">
                      <tr>
                        {session?.user?.role !== "Jefe_Departamento" && (
                          <th className="px-6 py-3 text-center">Departamento</th>
                        )}
                        <th className="px-6 py-3 text-center">Nombre del Proveedor</th>
                        <th className="px-6 py-3 text-center">Gasto (€)</th>
                        <th className="px-6 py-3 text-center">Fecha</th>
                        <th className="px-6 py-3 text-center">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdenes.length > 0 ? (
                        filteredOrdenes.map((orden, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            {session?.user?.role !== "Jefe_Departamento" && (
                              <td className="px-6 py-4 text-center">
                                {orden.departamento || "Sin Departamento"}
                              </td>
                            )}
                            <td className="px-6 py-4 text-center">
                              {orden.nombre_proveedor || "Sin Proveedor"}
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                              {orden.gasto !== undefined ? orden.gasto?.toLocaleString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {orden.fecha ? new Date(orden.fecha).toLocaleDateString() : "Sin Fecha"}
                            </td>
                            <td className="px-6 py-4 text-center">{orden.tipo || "Sin Tipo"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={session?.user?.role === "Jefe_Departamento" ? 4 : 5} 
                              className="text-center py-6 text-gray-500">
                            No hay órdenes de compra disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Gráficos principales */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Evolución anual de Presupuesto y Gastos
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 mb-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="anio" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="Presupuesto" fill="#d90429" name="Presupuesto" />
                  <Bar dataKey="Gasto" fill="#1d3557" name="Gasto" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de pie para distribución de presupuesto por departamento (solo para admin/contable) */}
            {session?.user?.role !== "Jefe_Departamento" && pieData.length > 0 && !searchDepartamento && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                  Distribución de Presupuesto por Departamento {selectedYear}
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: €${entry.value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico filtrado por departamento con toggle  - Solo para admin/contable y si hay un departamento seleccionado*/} 
            {session?.user?.role !== "Jefe_Departamento" && searchDepartamento && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Evolución {vistaEsMensual ? 'mensual' : 'anual'} - {searchDepartamento}
                  </h3>
                  
                  {/* Toggle Switch  - Cambia entre vista mensual y anual*/}
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${!vistaEsMensual ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      Anual
                    </span>
                    <button
                      onClick={() => setVistaEsMensual(!vistaEsMensual)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        vistaEsMensual ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          vistaEsMensual ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${vistaEsMensual ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      Mensual
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={vistaEsMensual 
                        ? // Vista Mensual
                          (() => {
                            const meses = [
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ];
                            
                            return meses.map((mes, index) => {
                              // Filtrar gastos del departamento por mes
                              const gastosDelMes = ordenes.filter(orden => {
                                const fechaOrden = new Date(orden.fecha);
                                return fechaOrden.getMonth() === index && 
                                       fechaOrden.getFullYear() === selectedYear &&
                                       orden.departamento === searchDepartamento;
                              });
                              
                              const gastoMensual = gastosDelMes.reduce((acc, orden) => acc + orden.gasto, 0);
                              
                              // Presupuesto mensual (distribución uniforme)
                              const presupuestoAnual = presupuestoPorDepartamento
                                .filter(item => item.departamento === searchDepartamento && item.anio === selectedYear)
                                .reduce((acc, curr) => acc + parseFloat(curr.presupuesto_total), 0);
                              const presupuestoMensual = presupuestoAnual / 12;
                              
                              return {
                                periodo: mes.slice(0, 3), // Enero -> Ene
                                Presupuesto: presupuestoMensual,
                                Gasto: gastoMensual
                              };
                            });
                          })()
                        : // Vista Anual
                          years.map((anio) => {
                            const presupuesto = presupuestoPorDepartamento
                              .filter(item => item.anio === anio && item.departamento === searchDepartamento)
                              .reduce((acc, curr) => acc + (parseFloat(curr.presupuesto_total) || 0), 0);
                            const gasto = gastoPorDepartamento
                              .filter(item => item.anio === anio && item.departamento === searchDepartamento)
                              .reduce((acc, curr) => acc + (parseFloat(curr.gasto_total) || 0), 0);
                            return { periodo: anio.toString(), Presupuesto: presupuesto, Gasto: gasto };
                          })
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`€${value.toLocaleString()}`, name]} />
                      <Legend />
                      <Bar dataKey="Presupuesto" fill="#d90429" name="Presupuesto" />
                      <Bar dataKey="Gasto" fill="#1d3557" name="Gasto" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Indicadores adicionales solo para vista mensual */}
                  {vistaEsMensual && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Mes actual</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {new Date().toLocaleDateString('es-ES', { month: 'long' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progreso anual</p>
                          <p className="text-lg font-semibold text-orange-600">
                            {Math.round((new Date().getMonth() + 1) / 12 * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estado</p>
                          {(() => {
                            try {
                              // Determinar qué departamento usar
                              const departamentoAUsar = searchDepartamento;
                              
                              if (!departamentoAUsar) {
                                return <p className="text-lg font-semibold text-gray-500">N/A</p>;
                              }
                              
                              // Calcular presupuesto y gasto de manera segura
                              const presupuestoDepto = (presupuestoPorDepartamento || [])
                                .filter(item => 
                                  item && 
                                  item.departamento === departamentoAUsar && 
                                  item.anio === selectedYear
                                )
                                .reduce((acc, curr) => {
                                  const valor = parseInt(curr.presupuesto_total) || 0;
                                  return acc + valor;
                                }, 0);
                              
                              const gastoDepto = (gastoPorDepartamento || [])
                                .filter(item => 
                                  item && 
                                  item.departamento === departamentoAUsar && 
                                  item.anio === selectedYear
                                )
                                .reduce((acc, curr) => {
                                  const valor = parseInt(curr.gasto_total) || 0;
                                  return acc + valor;
                                }, 0);
                              
                              let porcentajeGastado = 0;
                              if (presupuestoDepto > 0) {
                                porcentajeGastado = parseFloat(((gastoDepto / presupuestoDepto) * 100).toFixed(1));
                              }
                              
                              // Determinar estado y color
                              let estado, colorClass;
                              if (porcentajeGastado > 90) {
                                estado = '⚠️ Crítico';
                                colorClass = 'text-red-600';
                              } else if (porcentajeGastado > 75) {
                                estado = '🔶 Precaución';
                                colorClass = 'text-yellow-600';
                              } else if (porcentajeGastado > 50) {
                                estado = '📊 Normal';
                                colorClass = 'text-blue-600';
                              } else {
                                estado = '✅ Óptimo';
                                colorClass = 'text-green-600';
                              }
                              
                              return (
                                <p className={`text-lg font-semibold ${colorClass}`}>
                                  {estado}
                                </p>
                              );
                              
                            } catch (error) {
                              console.error('Error calculando estado:', error);
                              return <p className="text-lg font-semibold text-gray-500">Error</p>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gráfico de evolución mensual para Jefe de Departamento */}
            {session?.user?.role === "Jefe_Departamento" && session.user.departamento && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                  Mi Evolución Mensual {selectedYear} - {session.user.departamento}
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={(() => {
                        const meses = [
                          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                        ];
                        
                        return meses.map((mes, index) => {
                          // Filtrar gastos del departamento por mes
                          const gastosDelMes = ordenes.filter(orden => {
                            const fechaOrden = new Date(orden.fecha);
                            return fechaOrden.getMonth() === index && 
                                   fechaOrden.getFullYear() === selectedYear &&
                                   orden.departamento === session.user.departamento;
                          });
                          
                          const gastoMensual = gastosDelMes.reduce((acc, orden) => acc + orden.gasto, 0);
                          
                          // Presupuesto mensual (distribución uniforme)
                          const presupuestoAnual = presupuestoPorDepartamento
                            .filter(item => item.departamento === session.user.departamento && item.anio === selectedYear)
                            .reduce((acc, curr) => acc + parseFloat(curr.presupuesto_total), 0);
                          const presupuestoMensual = presupuestoAnual / 12;
                          
                          return {
                            periodo: mes.slice(0, 3), // Enero -> Ene
                            Presupuesto: presupuestoMensual,
                            Gasto: gastoMensual
                          };
                        });
                      })()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`€${value.toLocaleString()}`, name]} />
                      <Legend />
                      <Bar dataKey="Presupuesto" fill="#d90429" name="Presupuesto" />
                      <Bar dataKey="Gasto" fill="#1d3557" name="Gasto" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Indicadores adicionales para Jefe de Departamento */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Mes actual</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {new Date().toLocaleDateString('es-ES', { month: 'long' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Progreso anual</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {Math.round((new Date().getMonth() + 1) / 12 * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estado</p>
                        {(() => {
                          try {
                            const deptoPresupuesto = (presupuestoPorDepartamento || [])
                              .filter(item => 
                                item && 
                                item.departamento === session.user.departamento && 
                                item.anio === selectedYear
                              )
                              .reduce((acc, curr) => acc + parseInt(curr.presupuesto_total) || 0, 0);
                            
                            const deptoGasto = (gastoPorDepartamento || [])
                              .filter(item => 
                                item && 
                                item.departamento === session.user.departamento && 
                                item.anio === selectedYear
                              )
                              .reduce((acc, curr) => acc + parseInt(curr.gasto_total) || 0, 0);
                            
                            let porcentajeGastado = 0;
                            if (deptoPresupuesto > 0) {
                              porcentajeGastado = parseFloat(((deptoGasto / deptoPresupuesto) * 100).toFixed(1));
                            }
                            
                            // Determinar estado y color
                            let estado, colorClass;
                            if (porcentajeGastado > 90) {
                              estado = '⚠️ Crítico';
                              colorClass = 'text-red-600';
                            } else if (porcentajeGastado > 75) {
                              estado = '🔶 Precaución';
                              colorClass = 'text-yellow-600';
                            } else if (porcentajeGastado > 50) {
                              estado = '📊 Normal';
                              colorClass = 'text-blue-600';
                            } else {
                              estado = '✅ Óptimo';
                              colorClass = 'text-green-600';
                            }
                            
                            return (
                              <p className={`text-lg font-semibold ${colorClass}`}>
                                {estado}
                              </p>
                            );
                            
                          } catch (error) {
                            console.error('Error calculando estado:', error);
                            return <p className="text-lg font-semibold text-gray-500">Error</p>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de porcentaje gastado para Jefe de Departamento */}
            {session?.user?.role === "Jefe_Departamento" && session.user.departamento && (
              <div className="mt-8">
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    Estado del Presupuesto - {session.user.departamento}
                  </h3>
                  {(() => {
                    try {
                      const deptoPresupuesto = (presupuestoPorDepartamento || [])
                        .filter(item => 
                          item && 
                          item.departamento === session.user.departamento && 
                          item.anio === selectedYear
                        )
                        .reduce((acc, curr) => acc + parseInt(curr.presupuesto_total) || 0, 0);
                      
                      const deptoGasto = (gastoPorDepartamento || [])
                        .filter(item => 
                          item && 
                          item.departamento === session.user.departamento && 
                          item.anio === selectedYear
                        )
                        .reduce((acc, curr) => acc + parseInt(curr.gasto_total) || 0, 0);
                      
                      const porcentajeGastado = deptoPresupuesto > 0 
                        ? parseFloat(((deptoGasto / deptoPresupuesto) * 100).toFixed(1))
                        : 0;
                      
                      const restante = deptoPresupuesto - deptoGasto;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Presupuesto Total</p>
                              <p className="text-xl font-bold text-gray-800">
                                €{deptoPresupuesto.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gastado</p>
                              <p className="text-xl font-bold text-red-600">
                                €{deptoGasto.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Disponible</p>
                              <p className="text-xl font-bold text-green-600">
                                €{restante.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Porcentaje utilizado</span>
                              <span className="text-lg font-semibold text-red-600">
                                {porcentajeGastado}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className={`h-4 rounded-full transition-all duration-300 ${
                                  porcentajeGastado > 90 
                                    ? 'bg-red-500' 
                                    : porcentajeGastado > 75 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-center">
                              <p className={`text-sm font-medium ${
                                porcentajeGastado > 90 
                                  ? 'text-red-600' 
                                  : porcentajeGastado > 75 
                                    ? 'text-yellow-600' 
                                    : 'text-green-600'
                              }`}>
                                {porcentajeGastado > 90 
                                  ? '⚠️ Presupuesto casi agotado'
                                  : porcentajeGastado > 75 
                                    ? '🔔 Precaución con el gasto'
                                    : '✅ Presupuesto bajo control'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error calculando estado del presupuesto:', error);
                      return (
                        <div className="text-center text-gray-500">
                          <p>Error al calcular el estado del presupuesto</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioPage;
