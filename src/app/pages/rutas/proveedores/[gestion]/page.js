'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GestionPage() {
  const params = useParams(); // 👈 obtiene los parámetros de la URL
  const nombre = decodeURIComponent(params?.gestion || ""); // Evita errores si no está definido
  const [proveedor, setProveedor] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener proveedores
      const proveedoresRes = await fetch('/api/proveedores');
      const proveedores = await proveedoresRes.json();
      const proveedorSel = proveedores.find(
        (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
      );
      setProveedor(proveedorSel);

      // 2. Obtener departamentos
      const departamentosRes = await fetch('/api/departamentos');
      const departamentosData = await departamentosRes.json();
      setDepartamentos(departamentosData);

      // 3. Obtener departamentos relacionados
      if (proveedorSel) {
        const relacionadosRes = await fetch(`/api/proveedores/${proveedorSel.Id_Proveedor}/departamentos`);
        const relacionados = await relacionadosRes.json();
        setSeleccionados(relacionados); // Array de Id_Departamento
      }
    };
    fetchData();
  }, [nombre]);

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((depId) => depId !== id)
        : [...prev, id]
    );
  };

  // Guardar cambios en el backend
  const handleGuardar = async () => {
    if (!proveedor) return;
    const res = await fetch('/api/proveedores/relacionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idProveedor: proveedor.Id_Proveedor,
        departamentos: seleccionados,
      }),
    });
    if (res.ok) {
      setMensaje('Cambios guardados con éxito');
      // <-- Recarga los departamentos relacionados desde el backend
      const relacionadosRes = await fetch(`/api/proveedores/${proveedor.Id_Proveedor}/departamentos`);
      const relacionados = await relacionadosRes.json();
      setSeleccionados(relacionados);
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('Error al guardar los cambios');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  if (!proveedor) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4 py-10 relative">
      {mensaje && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md text-white shadow-lg bg-green-600">
          {mensaje}
        </div>
      )}
      <div className="w-full max-w-2xl bg-white text-black p-4 rounded-xl shadow-lg border border-black relative">
        <h1 className="text-3xl font-extrabold mb-6 text-red-600">
          {proveedor.nombre}
        </h1>
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Departamentos en red
          </h2>
          <div className="space-y-3">
            {departamentos.map((dep) => (
              <div
                key={dep.Id_Departamento}
                className="flex justify-between items-center bg-white border border-black px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">{dep.nombre}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 accent-red-600 cursor-pointer"
                  checked={seleccionados.includes(dep.Id_Departamento)}
                  onChange={() => handleCheckboxChange(dep.Id_Departamento)}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleGuardar}
          className="fixed bottom-10 right-10 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg z-50"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
