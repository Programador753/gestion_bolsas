"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProveedoresPage() {
  const { data: session, status } = useSession();
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const router = useRouter();

  // Cargar proveedores según el rol
  useEffect(() => {
    if (!session) return;

    const rol = session.user?.role;
    const idDepartamento =
      session.user?.id ||
      session.user?.departamento ||
      session.user?.Id_Departamento;

    const fetchProveedores = async () => {
      try {
        let data = [];
        if (rol === "Jefe_Departamento" && idDepartamento) {
          // Solo proveedores relacionados con su departamento
          const res = await fetch(
            `/api/proveedores/departamento/${idDepartamento}`
          );
          const resData = await res.json();
          data = Array.isArray(resData)
            ? resData
            : Array.isArray(resData.proveedores)
              ? resData.proveedores
              : [];
        } else {
          // Todos los proveedores
          const res = await fetch("/api/proveedores");
          const resData = await res.json();
          data = Array.isArray(resData)
            ? resData
            : Array.isArray(resData.proveedores)
              ? resData.proveedores
              : [];
        }
        setProveedores(data);
      } catch (error) {
        console.error("Error fetching proveedores:", error);
      }
    };

    fetchProveedores();
  }, [session]);

  const handleAgregarProveedor = async () => {
    if (!nuevoProveedor.trim()) return;

    try {
      console.log("Enviando proveedor:", nuevoProveedor.trim()); // Depuración
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoProveedor.trim() }),
      });

      if (!res.ok) throw new Error("Error al añadir el proveedor");

      const nuevoProveedorData = await res.json(); // Obtén el id, nombre y estado del proveedor
      setProveedores([...proveedores, nuevoProveedorData]);
      setNuevoProveedor("");
      setMensaje("Añadido con éxito");
      setTipoMensaje("success");
    } catch (error) {
      console.error("Error agregando proveedor:", error);
      setMensaje("Error al añadir el proveedor");
      setTipoMensaje("error");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleEliminarProveedor = async (nombre) => {
    // Función para eliminar un proveedor
    const confirmacion = window.confirm(
      "¿Estás seguro de eliminar el proveedor?"
    ); // Confirmación antes de eliminar
    if (!confirmacion) return;

    try {
      const res = await fetch("/api/proveedores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error("Error al eliminar el proveedor");

      setProveedores(proveedores.filter((prov) => prov.nombre !== nombre));
      setMensaje("Eliminado con éxito");
      setTipoMensaje("success");
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      setMensaje("Error al eliminar el proveedor");
      setTipoMensaje("error");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // Solo muestra los botones de agregar/eliminar si es Administrador
  const rol = session?.user?.role;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
      {/* Pop-up flotante */}
      {mensaje && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md text-white shadow-lg ${
            tipoMensaje === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {mensaje}
        </div>
      )}

      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de proveedores
        </h1>

        {rol === "Administrador" && (
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
        )}

        {/* Botón Asignar proveedores SOLO para Jefe_Departamento, encima de la tabla */}
        {rol === "Jefe_Departamento" && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => router.push("/pages/rutas/proveedores/asignar")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-6 py-3 rounded-md transition font-semibold"
            >
              Asignar proveedores
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {proveedores.map((proveedor, index) => (
                <tr
                  key={index}
                  className="bg-white border-b hover:bg-gray-50 transition"
                >
                  {/* Muestra el nombre del proveedor en la primera columna */}
                  <td>
                    <p className="px-2 py-3 font-semibold text-gray-800 text-base">
                      {proveedor.nombre}
                    </p>
                  </td>
                  {/* Segunda columna: botones de acción */}
                  <td className="px-2 py-3">
                    <div className="flex justify-end font-medium text-gray-800">
                      {/* 
                        <Link> de Next.js: 
                        Permite navegar a la página de gestión de ese proveedor específico.
                        El href incluye el nombre del proveedor en la URL.
                      */}
                      <Link
                        href={`/pages/rutas/proveedores/${proveedor.nombre}`}
                      >
                        <button className="cursor-pointer bg-red-600 text-white px-5 py-2.5 rounded-md text-base hover:bg-red-700 transition duration-200">
                          Gestionar
                        </button>
                      </Link>
                      {/* 
                        Botón "Eliminar": 
                        Solo visible si el usuario tiene rol "Administrador".
                        Al hacer clic, llama a handleEliminarProveedor con el nombre del proveedor.
                      */}
                      {rol === "Administrador" && (
                        <button
                          onClick={() =>
                            handleEliminarProveedor(proveedor.nombre)
                          }
                          className="ml-2 cursor-pointer bg-gray-600 text-white px-5 py-2.5 rounded-md text-base hover:bg-gray-700 transition duration-200"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Si no hay proveedores, muestra un mensaje */}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No hay proveedores registrados.
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
