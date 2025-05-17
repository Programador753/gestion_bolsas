'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AsignarProveedoresPage() {
  const { data: session, status } = useSession();
  const [proveedores, setProveedores] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [nuevoProveedor, setNuevoProveedor] = useState('');
  const router = useRouter();

  const rol = session?.user?.role;
  const idDepartamento = session?.user?.id || session?.user?.departamento || session?.user?.Id_Departamento;

  // Redirigir si no es Jefe_Departamento
  useEffect(() => {
    if (status === "loading") return;
    if (rol !== "Jefe_Departamento") router.replace("/pages/rutas/proveedores");
  }, [rol, status, router]);

  // Cargar proveedores no asignados a este departamento
  useEffect(() => {
    if (!idDepartamento) return;
    const fetchProveedores = async () => {
      try {
        const resAll = await fetch('/api/proveedores');
        const allData = await resAll.json();
        // Asegurar que tenemos un array de proveedores
        const allProveedores = Array.isArray(allData) 
          ? allData 
          : Array.isArray(allData.proveedores)
            ? allData.proveedores
            : [];

        const resAsignados = await fetch(`/api/proveedores/departamento/${idDepartamento}`);
        const asignadosData = await resAsignados.json();
        const asignados = Array.isArray(asignadosData)
          ? asignadosData
          : Array.isArray(asignadosData.proveedores)
            ? asignadosData.proveedores
            : [];

        const asignadosIds = asignados.map(p => p.Id_Proveedor);
        setProveedores(allProveedores.filter(p => !asignadosIds.includes(p.Id_Proveedor)));
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setMensaje('Error al cargar proveedores');
        setTipoMensaje('error');
      }
    };
    fetchProveedores();
  }, [idDepartamento]);

  // Añadir proveedor
  const handleAgregarProveedor = async () => {
    if (!nuevoProveedor.trim()) return;
    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoProveedor.trim() }),
      });
      if (!res.ok) throw new Error('Error al añadir el proveedor');
      const nuevoProveedorData = await res.json();
      setProveedores(prev => [...prev, nuevoProveedorData]);
      setNuevoProveedor('');
      setMensaje('Añadido con éxito');
      setTipoMensaje('success');
    } catch (error) {
      setMensaje('Error al añadir el proveedor');
      setTipoMensaje('error');
    } finally {
      setTimeout(() => setMensaje(''), 2500);
    }
  };

  // Asignar proveedor a este departamento
  const handleAsignar = async (proveedor) => {
    try {
      const res = await fetch('/api/proveedores/relacionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProveedor: proveedor.Id_Proveedor,
          departamentos: [idDepartamento],
        }),
      });
      if (!res.ok) throw new Error();
      setProveedores(prev => prev.filter(p => p.Id_Proveedor !== proveedor.Id_Proveedor));
      setMensaje('Asignado con éxito');
      setTipoMensaje('success');
    } catch {
      setMensaje('Error al asignar proveedor');
      setTipoMensaje('error');
    } finally {
      setTimeout(() => setMensaje(''), 2500);
    }
  };

  if (status === "loading" || rol !== "Jefe_Departamento") return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
      {mensaje && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md text-white shadow-lg ${
            tipoMensaje === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {mensaje}
        </div>
      )}
      {/* Botón Volver estático arriba a la izquierda, fuera del main */}
      <div className="w-full">
        <button
          onClick={() => typeof window !== "undefined" && window.history.back()}
          className="flex items-center text-red-700 hover:text-red-900 font-bold text-lg mb-6 mt-4 ml-4 bg-transparent"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>
      <main className="flex-grow px-4 py-10 w-full max-w-3xl relative">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Asignar proveedores a tu departamento
        </h1>
        {/* Input para añadir proveedor */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            className="w-full p-2 text-sm md:text-base bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            value={nuevoProveedor}
            onChange={(e) => setNuevoProveedor(e.target.value)}
            placeholder="Añadir nuevo proveedor"
          />
          <button
            onClick={handleAgregarProveedor}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md transition"
          >
            Nuevo proveedor
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {proveedores.map((proveedor, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                  <td>
                    <p className="px-2 py-3 font-semibold text-gray-800 text-base">
                      {proveedor.nombre}
                    </p>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button
                      onClick={() => handleAsignar(proveedor)}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-md text-base transition duration-200"
                    >
                      Asignar
                    </button>
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No hay proveedores por asignar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}