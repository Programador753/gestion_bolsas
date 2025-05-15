'use client';

import React, { useEffect, useState } from 'react';
import styles from './InicioPage.module.css';
import { useSession } from "next-auth/react";

const InicioPage = () => {
    const { data: session } = useSession(); // Usar el hook useSession
    const [ordenes, setOrdenes] = useState([]);
    const [gastoPorDepartamento, setGastoPorDepartamento] = useState([]);
    const [presupuestoPorDepartamento, setPresupuestoPorDepartamento] = useState([]);
    const [searchDepartamento, setSearchDepartamento] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/Inicio_data');
                const data = await response.json();

                if (data.error) {
                    console.error('API Error:', data.error);
                    setOrdenes([]);
                    setGastoPorDepartamento([]);
                    setPresupuestoPorDepartamento([]);
                    return;
                }

                console.log('Datos devueltos por la API:', data); // Log para depuración

                // Logs adicionales para inspeccionar las propiedades de los datos
                console.log('Ordenes:', data.ordenes);
                console.log('Gasto por Departamento:', data.gasto);
                console.log('Presupuesto por Departamento:', data.presupuesto);

                setOrdenes(data.ordenes || []);
                setGastoPorDepartamento(data.gasto || []);
                setPresupuestoPorDepartamento(data.presupuesto || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setOrdenes([]);
                setGastoPorDepartamento([]);
                setPresupuestoPorDepartamento([]);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (session?.user?.role === "Jefe_Departamento" && session.user.departamento) {
            setGastoPorDepartamento(prev => prev.filter(item => item.departamento.toLowerCase() === session.user.departamento.toLowerCase()));
            setPresupuestoPorDepartamento(prev => prev.filter(item => item.departamento.toLowerCase() === session.user.departamento.toLowerCase()));
            setOrdenes(prev => prev.filter(orden => orden.departamento?.toLowerCase() === session.user.departamento.toLowerCase()));
        }
    }, [session]);

    const filteredGasto = searchDepartamento.trim() === "" ? gastoPorDepartamento : gastoPorDepartamento.filter(item =>
        item.departamento.toLowerCase().includes(searchDepartamento.toLowerCase())
    );

    const filteredPresupuesto = searchDepartamento.trim() === "" ? presupuestoPorDepartamento : presupuestoPorDepartamento.filter(item =>
        item.departamento.toLowerCase().includes(searchDepartamento.toLowerCase())
    );

    console.log('Filtered Gasto:', filteredGasto);
    console.log('Filtered Presupuesto:', filteredPresupuesto);
    console.log('Ordenes:', ordenes);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Inicio</h1>
            {session?.user?.role === "Jefe_Departamento" && session.user.departamento && (
                <h2 className="text-lg font-normal text-center text-gray-700 mb-4">
                    Departamento: {session.user.departamento}
                </h2>
            )}
            <p className="mb-4">Bienvenido a la Gestión de Bolsas</p>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                {session?.user?.role !== "Jefe_Departamento" && (
                    <input
                        type="text"
                        placeholder="Buscar por departamento"
                        value={searchDepartamento}
                        onChange={(e) => setSearchDepartamento(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2"
                    />
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Presupuesto Total por Departamento</h2>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-red-600 text-white">
                        <tr>
                            {session?.user?.role !== "Jefe_Departamento" && (
                                <th className="px-6 py-3 text-left">Departamento</th>
                            )}
                            <th className="px-6 py-3 text-right">Presupuesto Total (€)</th>
                            <th className="px-6 py-3 text-left">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPresupuesto.length > 0 ? (
                            filteredPresupuesto.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    {session?.user?.role !== "Jefe_Departamento" && (
                                        <td className="px-6 py-4 text-black">{item.departamento}</td>
                                    )}
                                    <td className="px-6 py-4 text-right font-medium text-black">{item.presupuesto_total}</td>
                                    <td className="px-6 py-4 text-black">{item.tipo}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={session?.user?.role === "Jefe_Departamento" ? 2 : 3} className="text-center py-6 text-gray-500">
                                    No hay datos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Gasto Total por Departamento</h2>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-red-600 text-white">
                        <tr>
                            {session?.user?.role !== "Jefe_Departamento" && (
                                <th className="px-6 py-3 text-left">Departamento</th>
                            )}
                            <th className="px-6 py-3 text-right">Gasto Total (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGasto.length > 0 ? (
                            filteredGasto.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    {session?.user?.role !== "Jefe_Departamento" && (
                                        <td className="px-6 py-4 text-black">{item.departamento}</td>
                                    )}
                                    <td className="px-6 py-4 text-right font-medium text-black">{item.gasto_total}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={session?.user?.role === "Jefe_Departamento" ? 1 : 2} className="text-center py-6 text-gray-500">
                                    No hay datos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Últimas Órdenes de Compra</h2>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-red-600 text-white">
                        <tr>
                            {session?.user?.role !== "Jefe_Departamento" && (
                                <th className="px-6 py-3 text-left">Departamento</th>
                            )}
                            <th className="px-6 py-3 text-left">Nombre del Proveedor</th>
                            <th className="px-6 py-3 text-right">Gasto (€)</th>
                            <th className="px-6 py-3 text-left">Fecha</th>
                            <th className="px-6 py-3 text-left">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.length > 0 ? (
                            ordenes.map((orden, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    {session?.user?.role !== "Jefe_Departamento" && (
                                        <td className="px-6 py-4 text-black">{orden.departamento || 'Sin Departamento'}</td>
                                    )}
                                    <td className="px-6 py-4 text-black">{orden.nombre_proveedor || 'Sin Proveedor'}</td>
                                    <td className="px-6 py-4 text-right font-medium text-black">{orden.gasto !== undefined ? orden.gasto : 'N/A'}</td>
                                    <td className="px-6 py-4 text-black">{orden.fecha ? new Date(orden.fecha).toLocaleDateString() : 'Sin Fecha'}</td>
                                    <td className="px-6 py-4 text-black">{orden.tipo || 'Sin Tipo'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={session?.user?.role === "Jefe_Departamento" ? 4 : 5} className="text-center py-6 text-gray-500">
                                    No hay órdenes de compra disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InicioPage;
