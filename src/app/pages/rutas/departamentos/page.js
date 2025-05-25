'use client';
import { useSession } from "next-auth/react"; // Hook para obtener la sesión del usuario
import React, { useEffect, useState } from 'react'; // Importa React y los hooks useEffect y useState
import Link from 'next/link'; // Componente para navegación interna en Next.js

// Componente para seleccionar departamento y filtrar
const DepartamentoSelector = ({ onSeleccion, departamentoActual = '' }) => {
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(departamentoActual);

  // Actualiza el estado y llama a la función de selección al cambiar el input
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
  // Estados para departamentos, filtro, nuevo departamento y mensajes
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoFiltrado, setDepartamentoFiltrado] = useState('');
  const [nuevoDepartamento, setNuevoDepartamento] = useState('');
  const [mensaje, setMensaje] = useState(''); // Mensaje flotante
  const [tipoMensaje, setTipoMensaje] = useState(''); // Tipo de mensaje: success/error

  const { data: session } = useSession(); // Obtiene la sesión del usuario

  // useEffect: carga los departamentos al montar el componente
  useEffect(() => {
    fetchDepartamentos();
  }, []);

  // Función para obtener departamentos desde la API
  const fetchDepartamentos = async () => {
    try {
      const res = await fetch('/api/departamentos');
      const data = await res.json();
      // Si el backend devuelve {departamentos: [...]}, usa ese array
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.departamentos)
          ? data.departamentos
          : [];
      const nombres = lista.map((item) => item.nombre);
      setDepartamentos(nombres);
    } catch (error) {
      console.error("Error fetching departamentos:", error);
    }
  };

  // Normaliza texto para búsquedas (minúsculas y sin acentos)
  const normalizarTexto = (texto) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Elimina acentos

  // Elimina un departamento tras confirmación
  const handleEliminarDepartamento = async (nombre) => {
    const confirmacion = window.confirm('¿Está seguro de eliminar el departamento?');
    if (!confirmacion) return;

    try {
      await fetch(`/api/departamentos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      setDepartamentos(departamentos.filter((dep) => dep !== nombre));
      setMensaje('Eliminado con éxito');
      setTipoMensaje('success');
    } catch (error) {
      console.error("Error eliminando departamento:", error);
      setMensaje('Error al eliminar el departamento');
      setTipoMensaje('error');
    } finally {
      setTimeout(() => setMensaje(''), 3000); // Limpia el mensaje después de 3 segundos
    }
  };

  // Añade un nuevo departamento
  const handleAgregarDepartamento = async () => {
    if (!nuevoDepartamento.trim()) return;

    try {
      await fetch(`/api/departamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoDepartamento.trim() }),
      });
      setNuevoDepartamento('');
      setMensaje('Añadido correctamente');
      setTipoMensaje('success');
      await fetchDepartamentos(); // Recarga la lista desde el backend
    } catch (error) {
      console.error("Error agregando departamento:", error);
      setMensaje('Error al añadir el departamento');
      setTipoMensaje('error');
    } finally {
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  // Lógica para mostrar solo el departamento propio si es Jefe de Departamento
  let departamentosMostrados = departamentos;
  if (
    session?.user?.role === "Jefe_Departamento" &&
    session.user.departamento
  ) {
    departamentosMostrados = [session.user.departamento];
  } else if (departamentoFiltrado.trim()) {
    departamentosMostrados = departamentos.filter((nombre) =>
      normalizarTexto(nombre).includes(normalizarTexto(departamentoFiltrado))
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
      {/* Pop-up flotante para mensajes de éxito/error */}
      {mensaje && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md text-white shadow-lg ${tipoMensaje === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
        >
          {mensaje}
        </div>
      )}

      <main className="flex-grow px-4 py-10 w-full max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          Lista de departamentos
        </h1>

        {/* Solo mostrar el selector y el input si NO es jefe ni contable */}
        {!["Jefe_Departamento", "Contable"].includes(session?.user?.role) && (
          <>
            <DepartamentoSelector
              onSeleccion={setDepartamentoFiltrado}
              departamentoActual={departamentoFiltrado}
            />
            <div className="mb-6">
              <input
                type="text"
                className="w-full p-2 text-sm md:text-base bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                value={nuevoDepartamento}
                onChange={(e) => setNuevoDepartamento(e.target.value)}
                placeholder="Añadir nuevo departamento"
              />
              <button
                onClick={handleAgregarDepartamento}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md transition"
              >
                Añadir Departamento
              </button>
            </div>
          </>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {departamentosMostrados.map((nombre, idx) => (
                <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{nombre}</td>
                  <td className="px-4 py-3 text-right" colSpan={2}>
                    <div className="flex justify-end gap-4">
                      {/* Botón para ver bolsas del departamento */}
                      <Link href={`./bolsas/${nombre}`}>
                        <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-md transition cursor-pointer">
                          Ver bolsas
                        </button>
                      </Link>
                      {/* Solo mostrar eliminar si NO es jefe ni contable */}
                      {!["Jefe_Departamento", "Contable"].includes(session?.user?.role) && (
                        <button
                          onClick={() => handleEliminarDepartamento(nombre)}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-1.5 rounded-md transition cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Mensaje si no hay departamentos que mostrar */}
              {departamentosMostrados.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">No hay departamentos que coincidan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}